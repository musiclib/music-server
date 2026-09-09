/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { SynologyPaginationDto, SynologyPaginationResponseDto, SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';
import type { RatingOrUnset } from 'src/types';

class ArtistBodyDto extends SynologyPaginationDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Artist` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.ARTIST,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

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

  /**
   * Synology supports having personal and shared libraries but this software does not have a
   * direct equivalent, users can add the same root path to achieve it.  As such this value
   * is ignored but defined to match the Synology API.
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
}

export class SynologyArtistsBodyDto extends ArtistBodyDto {}

export class SynologyArtistsByGenreBodyDto extends ArtistBodyDto {
  @IsString()
  declare genre: string;
}

export class SynologyArtistsByDefaultGenreBodyDto extends ArtistBodyDto {
  @IsString()
  declare genre_filter: string;
}

class SynologyAlbumArtistRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumArtistRatingDto,
  })
  declare artist_rating: SynologyAlbumArtistRatingDto;
}

export class SynologyArtistDto {
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  @IsString()
  declare id: string;

  @IsString()
  declare name: string;
}

export class SynologyArtistDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyArtistDto,
    isArray: true,
  })
  declare artists: SynologyArtistDto[];
}

export class SynologyArtistResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyArtistDataDto,
  })
  declare data: SynologyArtistDataDto;
}
