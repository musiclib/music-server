/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ContentTypeEnum, FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { SynologyPaginationDto, SynologyPaginationResponseDto, SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';

export class SynologySongsBodyDto extends SynologyPaginationDto {
  @IsString()
  @IsEnum(['avg_rating', 'song_tag,song_audio,song_rating'])
  declare additional: string;

  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Song` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.SONG,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology supports having personal and shared libraries but this software does not have a
   * direct equivalent, users can add the same root path to achieve it.  As such this value
   * is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `all` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyLibraryEnum,
    enumName: 'SynologyLibraryEnum',
    example: SynologyLibraryEnum.ALL,
  })
  @IsEnum(SynologyLibraryEnum)
  declare library: SynologyLibraryEnum;

  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
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

export class SynologySongsByAlbumBodyDto extends SynologySongsBodyDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;
}

export class SynologySongsByArtistBodyDto extends SynologySongsBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologySongsByAlbumArtistBodyDto extends SynologySongsByAlbumBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologySongsByComposerBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologySongsByAlbumComposerBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologySongsByAlbumGenreBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologySongsByAlbumDefaultGenreBodyDto extends SynologySongsByAlbumBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologySongsByGenreBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologySongsByDefaultGenreBodyDto extends SynologySongsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologySongsRateBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Song` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.SONG,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * The IDs of the track(s) to rate comes in a `music_<id>,music_<id>` format.
   *
   * eg `music_1234,music_5678`
   *
   * The posted value is transformed to an array of song IDs as numbers.
   */
  @ApiProperty({
    type: 'integer',
    isArray: true,
  })
  @IsInt()
  @Transform(({ value }) =>
    value.split(',').map((v) => {
      if (v.startsWith('music_')) {
        return Number.parseInt(v.split('_').pop(), 10);
      }
      return v;
    }),
  )
  declare id: number[];

  /**
   * Synology's API uses this value to route requests appropriately. This endpoint requires
   * a value of `setrating` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.SET_RATING,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The rating of the track
   */
  @IsInt()
  @Min(0)
  @Max(5)
  declare rating: number;

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

class SynologySongRatingDto {
  @IsNumber()
  declare rating: number;
}

class SynologySongAudioDto {
  @IsNumber()
  declare bitrate: number;

  @IsNumber()
  declare channel: number;

  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare codec: FileTypeEnum;

  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare container: FileTypeEnum;

  @IsNumber()
  declare duration: number;

  @IsNumber()
  declare filesize: number;

  @IsNumber()
  declare frequency: number;
}

class SynologySongTagDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;

  @IsString()
  declare artist: string;

  @IsString()
  declare comment: string;

  @IsString()
  declare composer: string;

  @IsInt()
  declare disc: number;

  @IsString()
  declare genre: string;

  @IsInt()
  declare track: number;

  @IsInt()
  declare year: number;
}

class SynologySongAdditionalDto {
  @ApiProperty({
    type: SynologySongAudioDto,
  })
  declare song_audio: SynologySongAudioDto;

  @ApiProperty({
    type: SynologySongRatingDto,
  })
  declare song_rating: SynologySongRatingDto;

  @ApiProperty({
    type: SynologySongTagDto,
  })
  declare song_tag: SynologySongTagDto;
}

export class SynologySongDto {
  @ApiProperty({
    type: SynologySongAdditionalDto,
  })
  declare additional: SynologySongAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare path: string;

  @IsString()
  declare title: string;

  @ApiProperty({
    enum: ContentTypeEnum,
    enumName: 'ContentTypeEnum',
  })
  @IsEnum(ContentTypeEnum)
  declare type: ContentTypeEnum;
}

export class SynologySongDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologySongDto,
    isArray: true,
  })
  declare songs: SynologySongDto[];
}

export class SynologySongResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologySongDataDto,
  })
  declare data: SynologySongDataDto;
}
