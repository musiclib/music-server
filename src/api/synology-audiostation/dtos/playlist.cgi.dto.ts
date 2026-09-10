/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { SynologyPaginationDto, SynologySuccessResponseDto } from './synology.dto';
import { SynologySongDto } from './song.cgi.dto';
import { Transform, plainToInstance } from 'class-transformer';

export class SynologyPlaylistBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Proxy` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.PLAYLIST,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology supports having personal and shared libraries but this software does not have a
   * direct equivalent, users can add the same root path to achieve it.  As such this value
   * is ignored but defined to match the Synology API.
   *
   * This endpoint requires a value of `all` or `personal` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyLibraryEnum,
    enumName: 'SynologyLibraryEnum',
    example: SynologyLibraryEnum.ALL,
  })
  @IsEnum(SynologyLibraryEnum)
  declare library: SynologyLibraryEnum;

  /**
   * Synology's API has versioned endpoints and some have at least 3 versions.  This software
   * currently only supports the latest version of the API for each endpoint and ignores this value
   * for now.  It's possible to build in support for prior versions of an endpoint but that would
   * require using the `debug-proxy` to capture the request and response payloads to understand the
   * differences between versions.  If you are running an older DSM NAS and wish to help then check
   * out the GitHub Issues page and submit a request to support your version of the API.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare version: number;
}

export class SynologyPlaylistRetrieveBodyDto extends SynologyPlaylistBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `getinfo` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_INFO,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyPlaylistListBodyDto extends SynologyPlaylistBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `list` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.LIST,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;
}

export class SynologyPlaylistCreateNormalBodyDto extends SynologyPlaylistBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `create` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.CREATE,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare name: string;
}

class SynologySmartListRule {
  @IsInt()
  declare interval: number;

  declare op: number;

  @IsInt()
  declare tag: number;

  @IsString()
  declare tagval: string;

  get intervalName(): SmartPlaylistIntervalTagEnum | undefined {
    switch (this.interval) {
      case 1:
        return SmartPlaylistIntervalTagEnum.DAYS;
      case 2:
        return SmartPlaylistIntervalTagEnum.WEEKS;
      case 3:
        return SmartPlaylistIntervalTagEnum.MONTHS;
      default:
        return undefined;
    }
  }

  get operationName(): SmartPlaylistOperationEnum | undefined {
    switch (this.op) {
      case 1:
        return SmartPlaylistOperationEnum.IS;
      case 2:
        return SmartPlaylistOperationEnum.IS_NOT;
      case 3:
        return SmartPlaylistOperationEnum.CONTAINS;
      case 4:
        return SmartPlaylistOperationEnum.DOES_NOT_CONTAIN;
      case 5:
        return SmartPlaylistOperationEnum.LESS_THAN;
      case 6:
        return SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO;
      case 7:
        return SmartPlaylistOperationEnum.IN_THE_LAST;
      case 8:
        return SmartPlaylistOperationEnum.NOT_IN_THE_LAST;
      case 9:
        return SmartPlaylistOperationEnum.AFTER;
      case 10:
        return SmartPlaylistOperationEnum.BEFORE;
      default:
        return undefined;
    }
  }

  get fieldName(): SmartPlaylistFieldEnum | undefined {
    switch (this.tag) {
      case 1:
        return SmartPlaylistFieldEnum.ARTIST;
      case 2:
        return SmartPlaylistFieldEnum.ALBUM;
      case 11:
        return SmartPlaylistFieldEnum.ALBUM_ARTIST;
      case 12:
        return SmartPlaylistFieldEnum.COMPOSER;
      case 3:
        return SmartPlaylistFieldEnum.GENRE;
      case 4:
        return SmartPlaylistFieldEnum.FILE_PATH;
      case 7:
        return SmartPlaylistFieldEnum.YEAR;
      case 9:
        return SmartPlaylistFieldEnum.BIT_RATE;
      case 10:
        return SmartPlaylistFieldEnum.DATE_ADDED;
      case 13:
        return SmartPlaylistFieldEnum.RATING;
      default:
        return undefined;
    }
  }
}

export class SynologyPlaylistCreateSmartBodyDto extends SynologyPlaylistBodyDto {
  @ApiProperty({
    enum: SmartPlaylistConjugalEnum,
    enumName: 'SmartPlaylistConjugalEnum',
    example: SmartPlaylistConjugalEnum.AND,
  })
  @IsEnum(SmartPlaylistConjugalEnum)
  declare conj_rule: SmartPlaylistConjugalEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `create` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.CREATE_SMART,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare name: string;

  @ApiProperty({
    type: SynologySmartListRule,
    isArray: true,
  })
  @Transform(({ value }) => JSON.parse(value).map((rule) => plainToInstance(SynologySmartListRule, rule)))
  declare rules_json: SynologySmartListRule[];
}

export class SynologyPlaylistUpdateSmartBodyDto extends SynologyPlaylistCreateSmartBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `update` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.UPDATE_SMART,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyPlaylistRenameBodyDto extends SynologyPlaylistBodyDto {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `rename` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.RENAME,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare new_name: string;
}

export class SynologyPlaylistDeleteBodyDto extends SynologyPlaylistBodyDto {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  @Transform(({ obj }) => {
    const type = obj.id.split('/')[0].split('_')[2];
    switch (type) {
      case 'normal':
        return PlaylistTypeEnum.NORMAL;
      case 'smart':
        return PlaylistTypeEnum.SMART;
      default:
        return undefined;
    }
  })
  declare type: PlaylistTypeEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `delete` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.DELETE,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;
}

export class SynologyPlaylistAddOrRemoveItemBodyDto extends SynologyPlaylistBodyDto {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `updatesongs` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.UPDATE_SONGS,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The number of items to remove.
   */
  declare limit: number;

  /**
   * The position of the item(s) in the playlist, if `-1` then it is a new item otherwise
   * the list-index for the item.
   */
  declare offset: number;

  /**
   * The ID of the song comes in a `music_<id>,music_<id>` format or for radio stations it
   * can be `radio_<title>_<url>` or when deleting, an empty value.
   *
   * eg adding song(s): `music_1234,music_5678`
   * eg adding radio(s) `radio_The Best Radio Station Ever https://example.com/stream`
   * eg adding both: `music_1234,music_5678,radio_The Best Radio Station Ever https://example.com/stream`
   *
   * The posted value is transformed to an array of song IDs as numbers or radio station IDs
   * as strings.
   */
  @IsInt()
  @Transform(({ value }) =>
    value.split(',').map((v) => {
      if (v.startsWith('music_')) {
        return Number.parseInt(v.split('_').pop(), 10);
      }
      return v;
    }),
  )
  declare songs: (number | string)[];
}

export class SynologyPlaylistMoveItemsBodyDto extends SynologyPlaylistBodyDto {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `updatesongs` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.UPDATE_SONGS,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The number of items being moved
   */
  @IsInt()
  declare limit: number;

  /**
   * The position of the item(s) in the playlist, if `-1` then it is a new item otherwise
   * the list-index for the item.
   */
  declare offset: number;

  /**
   * The ID of the song comes in a `music_<id>,music_<id>` format, eg `music_1234,music_5678`
   * or when deleting, an empty value.
   */
  @IsInt()
  @Transform(({ value }) => value.split(',').map((v) => Number.parseInt(v.split('_').pop(), 10)))
  declare songs: number[];
}

export class SynologyPlaylistRemoveMissingBodyDto extends SynologyPlaylistBodyDto {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `removemissing` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.REMOVE_MISSING,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;
}

export class SynologyPlaylistTrackListBodyDto extends SynologyPaginationDto {
  /**
   * Additional data to include in the response.  This field is ignored by the backend for now
   * and a fixed-payload response is returned.
   */
  @IsString()
  declare additional: string;

  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `list` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.LIST,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;
}

export class SynologyPlaylistIdDataDto {
  @IsString()
  declare id: string;
}

export class SynologyPlaylistIdResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistIdDataDto,
  })
  declare data: SynologyPlaylistIdDataDto;
}

class SynologyPlaylistSharingInfoDto {
  @IsNumber()
  declare date_available: number;

  @IsNumber()
  declare date_expired: number;

  @IsString()
  declare id: string;

  @IsString()
  declare url: string;

  @IsString()
  declare status: string;
}

export class SynologyPlaylistRuleDto {
  @IsNumber()
  declare interval: number;

  @IsNumber()
  declare op: number;

  @IsNumber()
  declare tag: number;

  @IsString()
  declare tagval: string;
}

class SynologyPlaylistAdditionalDto {
  @ApiProperty({
    enum: SmartPlaylistConjugalEnum,
    enumName: 'SmartPlaylistConjugalEnum',
    example: SmartPlaylistConjugalEnum.AND,
  })
  @IsEnum(SmartPlaylistConjugalEnum)
  rules_conjunction?: SmartPlaylistConjugalEnum;

  @ApiProperty({
    type: SynologyPlaylistRuleDto,
    isArray: true,
  })
  rules?: SynologyPlaylistRuleDto[];

  @ApiProperty({
    type: SynologyPlaylistSharingInfoDto,
  })
  declare sharing_info: SynologyPlaylistSharingInfoDto;
}

class SynologyPlaylistDto {
  @IsString()
  declare id: string;

  @IsString()
  declare library: string;

  @IsString()
  declare name: string;

  @IsString()
  declare sharing_status: string;

  @ApiProperty({
    enum: PlaylistTypeEnum,
    enumName: 'PlaylistTypeEnum',
    example: PlaylistTypeEnum.NORMAL,
  })
  @IsEnum(PlaylistTypeEnum)
  declare type: PlaylistTypeEnum;

  @ApiProperty({
    type: SynologyPlaylistAdditionalDto,
  })
  declare additional: SynologyPlaylistAdditionalDto;
}

export class SynologyPlaylistDataDto {
  @IsNumber()
  declare offset: number;

  @IsNumber()
  declare total: number;

  @ApiProperty({
    type: SynologyPlaylistDto,
    isArray: true,
  })
  declare playlists: SynologyPlaylistDto[];
}

export class SynologyPlaylistResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistDataDto,
  })
  declare data: SynologyPlaylistDataDto;
}

export class SynologyPlaylistSongDto extends SynologySongDto {
  @IsInt()
  declare position: number;
}

export class SynologyPlaylistAdditionalWithItemsDto extends SynologyPlaylistAdditionalDto {
  @ApiProperty({
    type: SynologyPlaylistSongDto,
    isArray: true,
  })
  declare songs: SynologyPlaylistSongDto[];

  declare songs_offset: number;

  declare songs_total: number;
}

export class SynologyPlaylistWithItemsDto extends SynologyPlaylistDto {
  @ApiProperty({
    type: SynologyPlaylistAdditionalWithItemsDto,
  })
  declare additional: SynologyPlaylistAdditionalWithItemsDto;
}

export class SynologyPlaylistWithItemsDataDto {
  @ApiProperty({
    type: SynologyPlaylistWithItemsDto,
    isArray: true,
  })
  declare playlists: SynologyPlaylistWithItemsDto[];
}

export class SynologyPlaylistWithItemsResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistWithItemsDataDto,
  })
  declare data: SynologyPlaylistWithItemsDataDto;
}
