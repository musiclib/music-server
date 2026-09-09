/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { SynologyPaginationDto, SynologyPaginationResponseDto, SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';
import type { RatingOrUnset } from 'src/types';

export class SynologyAlbumsBodyDto extends SynologyPaginationDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Album` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.ALBUM,
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

export class SynologyAlbumsByArtistBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;
}

export class SynologyAlbumsByArtistAndGenreBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;

  @IsString()
  declare genre: string;
}

export class SynologyAlbumsByComposerBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer: string;
}

export class SynologyAlbumsByGenreBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre: string;
}

export class SynologyAlbumsByDefaultGenreBodyDto extends SynologyAlbumsBodyDto {
  /**
   * The name of the genre
   */
  @IsString()
  declare genre_filter: string;
}

export class SynologyAlbumsByArtistAndDefaultGenreBodyDto extends SynologyAlbumsBodyDto {
  @IsString()
  declare artist: string;

  @IsString()
  declare genre_filter: string;
}

class SynologyAlbumAverageRatingDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;
}

class SynologyAlbumAdditionalDto {
  @ApiProperty({
    type: SynologyAlbumAverageRatingDto,
  })
  declare avg_rating: SynologyAlbumAverageRatingDto;
}

export class SynologyAlbumDto {
  /**
   * Additional data for the album to return in the response data.
   */
  @ApiProperty({
    type: SynologyAlbumAdditionalDto,
  })
  declare additional: SynologyAlbumAdditionalDto;

  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString()
  declare album_artist: string;

  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString()
  declare artist: string;

  /**
   * The display name of the artist, which is used for sorting and display consistency when albums
   * have a different artist name than the album artist name.  For example, a compilation album may have
   * multiple artists but the album artist is "Various Artists" and the display artist is "Various".
   */
  @IsString()
  declare display_artist: string;

  /**
   * The name or title of the album.
   */
  @IsString()
  declare name: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}

export class SynologyAlbumDataDto extends SynologyPaginationResponseDto {
  /**
   * The list of albums returned by the Synology AudioStation API.  The number of albums returned is
   * limited by the `limit` value in the request body and the `offset` value in the request body
   * determines which albums are returned.
   */
  @ApiProperty({
    type: SynologyAlbumDto,
    isArray: true,
  })
  declare albums: SynologyAlbumDto[];
}

export class SynologyAlbumResponseDto extends SynologySuccessResponseDto {
  /**
   * The data payload returned by the Synology AudioStation API.  This includes the list of albums
   * and pagination information.
   */
  @ApiProperty({
    type: SynologyAlbumDataDto,
  })
  declare data: SynologyAlbumDataDto;
}
