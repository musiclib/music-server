import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Controller, Get, HttpCode, HttpStatus, Inject, Logger, Query, Req, Res } from '@nestjs/common';
import { CoverCgiAlbumQueryDto, CoverCgiArtistQueryDto, CoverCgiComposerQueryDto, CoverCgiSongQueryDto } from './dtos';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyCoverImageService } from './cover-image.service';
import { User } from '../user.decorator';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
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
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async route(
    @User() user: AccountEntity,
    @Query()
    query: CoverCgiAlbumQueryDto | CoverCgiArtistQueryDto | CoverCgiComposerQueryDto | CoverCgiSongQueryDto,
    @Req() request: Request,
    @Res() response: Response,
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
      const eTag = `album-${album.id}-${album.updatedAt?.getTime() || ''}-2`;
      const fileType = album.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Type': album.coverImageMimeType,
        'Content-Disposition': `inline; filename="album-cover.${album.id}.${fileType}"`,
        ETag: eTag,
      });
      if (request.fresh) {
        response.status(304);
        return response.end(emptyBuffer);
      }
      return response.end(album.coverImage);
    }
    // anticipated for:
    // genres: default_genre_name="..."
    // folders: id="dir_n"
    response.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="album-cover.blank.png"`,
      ETag: 'blank-cover',
    });
    if (request.fresh) {
      response.status(304);
      return response.end(emptyBuffer);
    }
    blankBuffer = blankBuffer || readFileSync(join(__dirname, 'resources', 'blank-cover.png'));
    return response.end(blankBuffer);
  }
}
