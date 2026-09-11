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
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import { SynologyMethodEnum } from './enums';
import {
  SynologyPlaylistAddOrRemoveItemBodyDto,
  SynologyPlaylistCreateNormalBodyDto,
  SynologyPlaylistCreateSmartBodyDto,
  SynologyPlaylistDeleteBodyDto,
  SynologyPlaylistIdResponseDto,
  SynologyPlaylistListBodyDto,
  SynologyPlaylistMoveItemsBodyDto,
  SynologyPlaylistRemoveMissingBodyDto,
  SynologyPlaylistRenameBodyDto,
  SynologyPlaylistResponseDto,
  SynologyPlaylistRetrieveBodyDto,
  SynologyPlaylistTrackListBodyDto,
  SynologyPlaylistUpdateSmartBodyDto,
  SynologyPlaylistWithItemsResponseDto,
} from './dtos/playlist.cgi.dto';
import { SynologyPlaylistService } from './playlist.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyPlaylistController {
  constructor(private readonly playlistService: SynologyPlaylistService) {}

  @Post('/webapi/AudioStation/playlist.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manages playlists',
    description: [
      // eslint-disable-next-line max-len
      `Manages playlists in the music library.  This endpoint is used to list, create, delete, rename, and update playlists, as well as add and remove tracks and radio stations from playlists.  It provides the ability to retrieve playlist information and track/radio lists for playlists.`,
      // eslint-disable-next-line max-len
      `Playlists can be a "normal" playlist containing a static list of tracks and radio stations you add, or a "smart" playlist which is a dynamic filter based on criteria such as genre, artist, album, and more.`,
      `Listing playlists are not returned in a paginated format, but the tracks and radio stations within them are.`,
      PAGINATED_DATA_DESCRIPTION,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Endpoints for creating and managing playlists',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(SynologySuccessResponseDto) },
        { $ref: getSchemaPath(SynologyPlaylistResponseDto) },
        { $ref: getSchemaPath(SynologyPlaylistIdResponseDto) },
        { $ref: getSchemaPath(SynologyPlaylistWithItemsResponseDto) },
      ],
    },
  })
  @ApiExtraModels(
    SynologyPlaylistAddOrRemoveItemBodyDto,
    SynologyPlaylistCreateNormalBodyDto,
    SynologyPlaylistCreateSmartBodyDto,
    SynologyPlaylistDeleteBodyDto,
    SynologyPlaylistListBodyDto,
    SynologyPlaylistMoveItemsBodyDto,
    SynologyPlaylistRemoveMissingBodyDto,
    SynologyPlaylistRenameBodyDto,
    SynologyPlaylistRetrieveBodyDto,
    SynologyPlaylistTrackListBodyDto,
    SynologyPlaylistUpdateSmartBodyDto,
    SynologySuccessResponseDto,
    SynologyPlaylistIdResponseDto,
    SynologyPlaylistResponseDto,
    SynologyPlaylistWithItemsResponseDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyPlaylistAddOrRemoveItemBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistCreateNormalBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistCreateSmartBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistDeleteBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistMoveItemsBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistRemoveMissingBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistRenameBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistTrackListBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistUpdateSmartBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistRetrieveBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyPlaylistListBodyDto),
        },
      ],
    },
  })
  async routeRequest(
    @User() user: AccountEntity,
    @Body()
    variousBodies:
      | SynologyPlaylistAddOrRemoveItemBodyDto
      | SynologyPlaylistCreateNormalBodyDto
      | SynologyPlaylistCreateSmartBodyDto
      | SynologyPlaylistDeleteBodyDto
      | SynologyPlaylistMoveItemsBodyDto
      | SynologyPlaylistRemoveMissingBodyDto
      | SynologyPlaylistRenameBodyDto
      | SynologyPlaylistRetrieveBodyDto
      | SynologyPlaylistTrackListBodyDto
      | SynologyPlaylistUpdateSmartBodyDto,
  ): Promise<
    | SynologySuccessResponseDto
    | SynologyPlaylistResponseDto
    | SynologyPlaylistIdResponseDto
    | SynologyPlaylistWithItemsResponseDto
  > {
    // Route #1:  create a playlist
    if (variousBodies.method === SynologyMethodEnum.CREATE) {
      const body = plainToInstance(SynologyPlaylistCreateNormalBodyDto, variousBodies);
      return this.createPlaylist(user, body);
    }
    // Route #2:  create a "smart" playlist, which is a filter for songs
    if (variousBodies.method === SynologyMethodEnum.CREATE_SMART) {
      const body = plainToInstance(SynologyPlaylistCreateSmartBodyDto, variousBodies);
      return this.createSmartPlaylist(user, body);
    }
    // Route #3:  delete a playlist
    if (variousBodies.method === SynologyMethodEnum.DELETE) {
      const body = plainToInstance(SynologyPlaylistDeleteBodyDto, variousBodies);
      return this.deletePlaylist(user, body);
    }
    if (variousBodies.method === SynologyMethodEnum.UPDATE_SONGS) {
      const body = plainToInstance(SynologyPlaylistAddOrRemoveItemBodyDto, variousBodies);
      // Route #4:  add song(s) and radio station(s)
      if (body.offset === -1) {
        return this.addItem(user, body);
      }
      // Route #5:  delete from a playlist
      if ((body.offset > -1 && body.songs.length === 0) || body.songs.join('').length === 0) {
        return this.removeItem(user, body);
      }
      // Route #6:  swap two tracks in the playlist order
      if (body.offset > -1 && body.songs.length > 0) {
        return this.moveItem(user, body);
      }
    }
    // Route #7:  remove missing tracks from playlist (redundant)
    if (variousBodies.method === SynologyMethodEnum.REMOVE_MISSING) {
      return this.removeMissingTracks();
    }
    // Route #8:  rename a playlist
    if (variousBodies.method === SynologyMethodEnum.RENAME) {
      const body = plainToInstance(SynologyPlaylistRenameBodyDto, variousBodies);
      return this.renamePlaylist(user, body);
    }
    // Route #9:  update a "smart" playlist
    if (variousBodies.method === SynologyMethodEnum.UPDATE_SMART) {
      const body = plainToInstance(SynologyPlaylistUpdateSmartBodyDto, variousBodies);
      return this.updateSmartPlaylist(user, body);
    }
    // Route #10:  get the info for a playlist
    if (variousBodies.method === SynologyMethodEnum.GET_INFO) {
      const body = plainToInstance(SynologyPlaylistRetrieveBodyDto, variousBodies);
      return this.getPlaylistInfo(user, body);
    }
    // Router #11:  list the playlists in the music library
    if (variousBodies.method === SynologyMethodEnum.LIST) {
      const data = await this.getPlaylists(user);
      return data;
    }
    // Route #12:  get the track list for a playlist
    const body = plainToInstance(SynologyPlaylistTrackListBodyDto, variousBodies);
    return this.getItems(user, body);
  }

  async createPlaylist(
    user: AccountEntity,
    body: SynologyPlaylistCreateNormalBodyDto,
  ): Promise<SynologyPlaylistIdResponseDto> {
    const data = await this.playlistService.createPlaylist(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async createSmartPlaylist(
    user: AccountEntity,
    body: SynologyPlaylistCreateSmartBodyDto,
  ): Promise<SynologyPlaylistIdResponseDto> {
    const data = await this.playlistService.createSmartPlaylist(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async deletePlaylist(user: AccountEntity, body: SynologyPlaylistDeleteBodyDto): Promise<SynologySuccessResponseDto> {
    await this.playlistService.deletePlaylist(user.id, body);
    return {
      success: true,
    };
  }

  async addItem(
    user: AccountEntity,
    body: SynologyPlaylistAddOrRemoveItemBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.playlistService.addItem(user.id, body);
    return {
      success: true,
    };
  }

  async removeItem(
    user: AccountEntity,
    body: SynologyPlaylistAddOrRemoveItemBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.playlistService.removeItem(user.id, body);
    return {
      success: true,
    };
  }

  async moveItem(
    user: AccountEntity,
    body: SynologyPlaylistAddOrRemoveItemBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.playlistService.moveItem(user.id, body);
    return {
      success: true,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async removeMissingTracks(): Promise<SynologySuccessResponseDto> {
    return {
      success: true,
    };
  }

  async renamePlaylist(
    user: AccountEntity,
    body: SynologyPlaylistRenameBodyDto,
  ): Promise<SynologyPlaylistIdResponseDto> {
    const data = await this.playlistService.renamePlaylist(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async updateSmartPlaylist(
    user: AccountEntity,
    body: SynologyPlaylistUpdateSmartBodyDto,
  ): Promise<SynologyPlaylistIdResponseDto> {
    const data = await this.playlistService.updateSmartPlaylist(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async getPlaylists(user: AccountEntity): Promise<SynologyPlaylistResponseDto> {
    const data = await this.playlistService.getPlaylists(user.id);
    return {
      data,
      success: true,
    };
  }

  async getItems(
    user: AccountEntity,
    body: SynologyPlaylistTrackListBodyDto,
  ): Promise<SynologyPlaylistWithItemsResponseDto> {
    const data = await this.playlistService.getItems(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async getPlaylistInfo(
    user: AccountEntity,
    body: SynologyPlaylistRetrieveBodyDto,
  ): Promise<SynologyPlaylistResponseDto> {
    const data = await this.playlistService.getPlaylistInfo(user.id, body);
    return {
      data,
      success: true,
    };
  }
}
