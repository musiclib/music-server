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
import {
  SynologyAlbumResponseDto,
  SynologyAlbumsBodyDto,
  SynologyAlbumsByArtistAndDefaultGenreBodyDto,
  SynologyAlbumsByArtistAndGenreBodyDto,
  SynologyAlbumsByArtistBodyDto,
  SynologyAlbumsByComposerBodyDto,
  SynologyAlbumsByDefaultGenreBodyDto,
  SynologyAlbumsByGenreBodyDto,
} from './dtos/album.cgi.dto';
import { SynologyAlbumService } from './album.service';
import { SynologyGuard } from './synology.guard';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyAlbumController {
  private readonly logger: Logger = new Logger(SynologyAlbumController.name);

  constructor(private readonly albumService: SynologyAlbumService) {}

  @Post('/webapi/AudioStation/album.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists albums in the music library',
    description: [
      `Lists albums found in the music library.  The albums can be filtered by artist, composer or genre.`,
      PAGINATED_DATA_DESCRIPTION,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns a list of albums',
    type: SynologyAlbumResponseDto,
  })
  @ApiExtraModels(
    SynologyAlbumsBodyDto,
    SynologyAlbumsByArtistBodyDto,
    SynologyAlbumsByArtistAndGenreBodyDto,
    SynologyAlbumsByComposerBodyDto,
    SynologyAlbumsByGenreBodyDto,
    SynologyAlbumsByDefaultGenreBodyDto,
    SynologyAlbumsByArtistAndDefaultGenreBodyDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyAlbumsBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByArtistBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByArtistAndGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByComposerBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByDefaultGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyAlbumsByArtistAndDefaultGenreBodyDto),
        },
      ],
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body()
    variousBodies:
      | SynologyAlbumsBodyDto
      | SynologyAlbumsByArtistBodyDto
      | SynologyAlbumsByArtistAndGenreBodyDto
      | SynologyAlbumsByComposerBodyDto
      | SynologyAlbumsByGenreBodyDto
      | SynologyAlbumsByDefaultGenreBodyDto
      | SynologyAlbumsByArtistAndDefaultGenreBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    // Route #1:  albums in a genre by an artist
    if ('genre' in variousBodies) {
      if ('artist' in variousBodies) {
        return this.listAlbumsInGenreByArtist(
          user,
          plainToInstance(SynologyAlbumsByArtistAndGenreBodyDto, variousBodies),
        );
      }
      // Route #2:  albums in a genre
      if ('genre' in variousBodies) {
        return this.listAlbumsInGenre(user, plainToInstance(SynologyAlbumsByGenreBodyDto, variousBodies));
      }
    }
    // Route #3:  albums in a default genre
    if ('genre_filter' in variousBodies) {
      if ('artist' in variousBodies) {
        return this.listAlbumsByArtistInDefaultGenre(
          user,
          plainToInstance(SynologyAlbumsByArtistAndDefaultGenreBodyDto, variousBodies),
        );
      }
      return this.listAlbumsInDefaultGenre(user, plainToInstance(SynologyAlbumsByDefaultGenreBodyDto, variousBodies));
    }
    // Route #4:  albums by a composer
    if ('composer' in variousBodies) {
      return this.listAlbumsByComposer(user, plainToInstance(SynologyAlbumsByComposerBodyDto, variousBodies));
    }
    // Route #5:  albums by an artist
    if ('artist' in variousBodies) {
      return this.listAlbumsByArtist(user, plainToInstance(SynologyAlbumsByArtistBodyDto, variousBodies));
    }
    // Route #6:  all albums
    return this.listAlbums(user, plainToInstance(SynologyAlbumsBodyDto, variousBodies));
  }

  private async listAlbumsInGenreByArtist(
    user: AccountEntity,
    body: SynologyAlbumsByArtistAndGenreBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listArtistGenreAlbums(
      user.id,
      body.artist,
      body.genre,
      body.offset,
      body.limit,
    );
    return { data, success: true };
  }

  private async listAlbumsInGenre(
    user: AccountEntity,
    body: SynologyAlbumsByGenreBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listGenreAlbums(user.id, body.genre, body.offset, body.limit);
    return { data, success: true };
  }

  private async listAlbumsByArtistInDefaultGenre(
    user: AccountEntity,
    body: SynologyAlbumsByArtistAndDefaultGenreBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listArtistGenreAlbums(
      user.id,
      body.artist,
      body.genre_filter,
      body.offset,
      body.limit,
    );
    return { data, success: true };
  }

  private async listAlbumsInDefaultGenre(
    user: AccountEntity,
    body: SynologyAlbumsByDefaultGenreBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listGenreAlbums(user.id, body.genre_filter, body.offset, body.limit);
    return { data, success: true };
  }

  private async listAlbumsByComposer(
    user: AccountEntity,
    body: SynologyAlbumsByComposerBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listComposerAlbums(user.id, body.composer, body.offset, body.limit);
    return { data, success: true };
  }

  private async listAlbumsByArtist(
    user: AccountEntity,
    body: SynologyAlbumsByArtistBodyDto,
  ): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listArtistAlbums(user.id, body.artist, body.offset, body.limit);
    return { data, success: true };
  }

  private async listAlbums(user: AccountEntity, body: SynologyAlbumsBodyDto): Promise<SynologyAlbumResponseDto> {
    const data = await this.albumService.listAlbums(user.id, body.offset, body.limit);
    return { data, success: true };
  }
}
