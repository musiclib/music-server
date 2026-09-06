import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CACHE_MANAGER, Cache, CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Query,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { CoverCgiAlbumQueryDto, CoverCgiArtistQueryDto, CoverCgiComposerQueryDto, CoverCgiSongQueryDto } from './dtos';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyCoverImageService } from './cover-image.service';
import { User } from '../user.decorator';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseInterceptors(CacheInterceptor)
export class SynologyCoverImageController {
  private readonly logger: Logger = new Logger(SynologyCoverImageController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly coverImageService: SynologyCoverImageService,
  ) {}

  @Get('/webapi/AudioStation/cover.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the cover image for an album, artist, composer or song',
    description: [
      // eslint-disable-next-line max-len
      `Retrieves the cover image for an album, artist, composer or song.  The cover image can be retrieved by specifying the appropriate query parameters in the request.  If an image is not found a default blank cover image will be returned.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    type: Buffer,
    description: 'The image blob',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @Header('Cache-Control', 'private, max-age=600, stale-while-revalidate=60')
  @CacheTTL(60)
  @ApiProduces('application/octet-stream')
  async route(
    @User() user: AccountEntity,
    @Query()
    query:
      | CoverCgiAlbumQueryDto
      | CoverCgiArtistQueryDto
      | CoverCgiComposerQueryDto
      | CoverCgiSongQueryDto
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | any, // TODO: there are some query parameters that are not yet defined in the DTO
    @Res() res: Response,
  ) {
    let album;
    if ('id' in query) {
      album = await this.coverImageService.getFileCoverImage(user.id, query.id);
    } else if ('artist_name' in query) {
      album = await this.coverImageService.getArtistCoverImage(user.id, query.artist_name);
    } else if ('album_name' in query) {
      album = await this.coverImageService.getAlbumCoverImage(user.id, query.album_artist_name, query.album_name);
    } else if ('composer_name' in query) {
      album = await this.coverImageService.getComposerCoverImage(user.id, query.composer_name);
    }
    if (album?.coverImage) {
      return new StreamableFile(album.coverImage, {
        type: album.coverImageMimeType,
        disposition: 'inline',
        length: album.coverImage.length,
      });
    }
    res.setHeader('Content-Type', 'image/png');
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    return new StreamableFile(createReadStream(blankCoverPath), {
      type: 'image/png',
    });
  }
}
