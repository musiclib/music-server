import { AUTHENTICATED_REQUEST_DESCRIPTION, PAGINATED_DATA_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import {
  SynologySongResponseDto,
  SynologySongsBodyDto,
  SynologySongsByAlbumArtistBodyDto,
  SynologySongsByAlbumBodyDto,
  SynologySongsByAlbumComposerBodyDto,
  SynologySongsByAlbumDefaultGenreBodyDto,
  SynologySongsByAlbumGenreBodyDto,
  SynologySongsByArtistBodyDto,
  SynologySongsByComposerBodyDto,
  SynologySongsByDefaultGenreBodyDto,
  SynologySongsByGenreBodyDto,
  SynologySongsRateBodyDto,
} from './dtos';
import { SynologySongService } from './song.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologySongController {
  private readonly logger: Logger = new Logger(SynologySongController.name);

  constructor(private readonly songService: SynologySongService) {}

  @Post('/webapi/AudioStation/song.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists songs in the music library',
    description: [
      `Lists songs found in the music library.  The songs can be filtered by album, artist, composer, or genre.`,
      PAGINATED_DATA_DESCRIPTION,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns a list of songs',
    schema: {
      oneOf: [{ $ref: getSchemaPath(SynologySongResponseDto) }, { $ref: getSchemaPath(SynologySuccessResponseDto) }],
    },
  })
  @ApiExtraModels(
    SynologySongsBodyDto,
    SynologySongsByAlbumArtistBodyDto,
    SynologySongsByAlbumBodyDto,
    SynologySongsByAlbumComposerBodyDto,
    SynologySongsByAlbumDefaultGenreBodyDto,
    SynologySongsByAlbumGenreBodyDto,
    SynologySongsByArtistBodyDto,
    SynologySongsByComposerBodyDto,
    SynologySongsByDefaultGenreBodyDto,
    SynologySongsByGenreBodyDto,
    SynologySongsRateBodyDto,
    SynologySongResponseDto,
    SynologySuccessResponseDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologySongsBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByAlbumBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByArtistBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByAlbumArtistBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByComposerBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByAlbumComposerBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByAlbumGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByAlbumDefaultGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsByDefaultGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologySongsRateBodyDto),
        },
      ],
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body()
    variousBodies:
      | SynologySongsBodyDto
      | SynologySongsByAlbumBodyDto
      | SynologySongsByArtistBodyDto
      | SynologySongsByAlbumArtistBodyDto
      | SynologySongsByComposerBodyDto
      | SynologySongsByAlbumComposerBodyDto
      | SynologySongsByAlbumGenreBodyDto
      | SynologySongsByGenreBodyDto
      | SynologySongsByDefaultGenreBodyDto
      | SynologySongsByAlbumDefaultGenreBodyDto,
  ): Promise<SynologySongResponseDto | SynologySuccessResponseDto> {
    if ('composer' in variousBodies) {
      // Route #1:  Composer tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumComposerBodyDto, variousBodies);
        const data = await this.songService.listComposerAlbumTracks(
          user.id,
          body.composer,
          body.album,
          body.album_artist,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #2:  Composer tracks
      const body = plainToInstance(SynologySongsByComposerBodyDto, variousBodies);
      const data = await this.songService.listComposerTracks(user.id, body.composer, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    if ('genre' in variousBodies) {
      // Route #3:  Genre tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumGenreBodyDto, variousBodies);
        const data = await this.songService.listGenreAlbumTracks(
          user.id,
          body.album,
          body.album_artist,
          body.genre,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #4:  Genre tracks
      const body = plainToInstance(SynologySongsByGenreBodyDto, variousBodies);
      const data = await this.songService.listGenreTracks(user.id, body.genre, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    if ('genre_filter' in variousBodies) {
      // Route #5:  Default genre tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumDefaultGenreBodyDto, variousBodies);
        const data = await this.songService.listGenreAlbumTracks(
          user.id,
          body.album,
          body.album_artist,
          body.genre_filter,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #6:  Default genre tracks
      const body = plainToInstance(SynologySongsByAlbumDefaultGenreBodyDto, variousBodies);
      const data = await this.songService.listGenreTracks(user.id, body.genre_filter, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    // Route #7:  Album tracks
    if ('album' in variousBodies) {
      const body = plainToInstance(SynologySongsByAlbumBodyDto, variousBodies);
      const data = await this.songService.listAlbumTracks(
        user.id,
        body.album,
        body.album_artist,
        body.offset,
        body.limit,
      );
      return {
        data,
        success: true,
      };
    }
    // Route #8:  Artist tracks
    if ('artist' in variousBodies) {
      const body = plainToInstance(SynologySongsByArtistBodyDto, variousBodies);
      const data = await this.songService.listArtistTracks(user.id, body.artist, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    // Route #9:  Rating one or more track(s)
    if ('rating' in variousBodies) {
      const body = plainToInstance(SynologySongsRateBodyDto, variousBodies);
      await this.songService.rateTracks(user.id, body.id, body.rating);
      return {
        success: true,
      };
    }
    // Route #10:  Generic track list
    const body = plainToInstance(SynologySongsBodyDto, variousBodies);
    const data = await this.songService.listTracks(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
