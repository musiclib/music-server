/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { type RatingOrUnset } from 'src/types';
import { SortDirectionEnum } from 'src/types/enums';
import { Transform } from 'class-transformer';

export class QnapArtistDto {
  @IsString()
  declare Albumartist: string;

  @IsString()
  declare FileName: string;

  @IsString()
  declare FileType: 'artist';

  @IsString()
  declare ImagePath: string;

  @IsInt()
  declare LinkID: number;

  @IsString()
  declare Title: string;
}

export class QnapAlbumDto {
  @IsString()
  declare Albumartist: string;

  @IsString()
  declare Artist: string;

  @IsString()
  declare FileName: string;

  @IsString()
  declare FileType: 'album';

  @IsString()
  declare Genre: string;

  @IsString()
  declare ImagePath: string;

  @IsBoolean()
  declare Is_VA: boolean;

  @IsInt()
  declare LinkID: number;

  @IsString()
  declare Title: string;
}

export class QnapFolderDto {
  @IsString()
  declare FileName: string;

  @IsString()
  declare FilePath: string;

  @IsString()
  declare FileType: 'folder';

  @IsInt()
  declare LinkID: number;

  @IsString()
  declare ImagePath: string;

  @IsString()
  declare prefix: string;
}

export class QnapGenreDto {
  @IsString()
  declare FileName: string;

  @IsString()
  declare FileType: 'genre';

  @IsString()
  declare Title: string;

  @IsString()
  declare LinkID: string;
}

export class QnapTrackDto {
  @IsString()
  declare Album: string;

  @IsString()
  declare AlbumArtist: string;

  @IsString()
  declare Artist: string;

  @IsString()
  declare audio_playtime: string;

  @IsString()
  declare did: string;

  @IsString()
  declare Disc: string;

  @IsString()
  declare Extension: string;

  /**
   * Boolean flag for being favorited, which is not supported in Qnap's UI
   */
  @IsInt()
  declare favorite: number;

  @IsString()
  declare FileName: string;

  @IsString()
  declare FilePath: string;

  @IsString()
  declare FileSize: string;

  @IsString()
  declare FileType: string;

  @ApiProperty({
    format: 'integer',
    default: 3,
  })
  @IsInt()
  declare Formatid: 3;

  @IsString()
  declare Genre: string;

  @IsString()
  declare ImagePath: string;

  @IsString()
  declare iOrderNr: string;

  @IsInt()
  declare LinkID: number;

  @ApiProperty({
    format: 'integer',
    default: 0,
  })
  @IsNumber()
  declare MediaType: 0;

  @IsString()
  declare Order: string;

  @ApiProperty({
    format: 'integer',
    default: 0,
  })
  @IsNumber()
  declare Rating: RatingOrUnset;

  @IsInt()
  declare SongID: number;

  @IsString()
  declare Title: string;

  @IsInt()
  @IsOptional()
  declare Tracknumber?: number;

  @IsInt()
  declare UseCount: number;

  @IsInt()
  @IsOptional()
  declare Year?: number;
}

export class QnapMediaListBucketQueryDto {
  @ApiProperty({
    type: 'string',
    default: 'list',
  })
  @IsEnum(['list'])
  declare act: string;

  /**
   * The link ID for the bucket, which can be either 'Mg-3D-3D' or 'Mw-3D-3D'
   * Mg-3D-3D means "recently added"
   * Mw-3D-3D means "frequently played"
   */
  @ApiProperty({
    type: 'string',
    default: 'Mg-3D-3D',
  })
  @IsEnum(['Mg-3D-3D', 'Mw-3D-3D'])
  declare linkid: string;

  /**
   * Media grouping to return, album, artist
   */
  @ApiProperty({
    type: 'string',
    default: 'myfavorite',
  })
  @IsEnum(['myfavorite', 'get_spotlight_list', 'recycle'])
  declare type: string;
}

export class QnapMediaListRandomQueryDto {
  @ApiProperty({
    type: 'string',
    default: 'random',
  })
  @IsEnum(['random'])
  declare act: string;

  /**
   * Analogous for "limit" for pagination
   */
  @IsInt()
  @Min(1)
  @Max(100_000)
  declare counts: number;

  /**
   * Media grouping to return, album, artist
   */
  @IsEnum(['album', 'artist'])
  declare type: string;
}

export class QnapMediaListRandomArtistsResponseDto {
  @IsInt()
  declare success: number;

  @ApiProperty({
    type: QnapArtistDto,
    isArray: true,
  })
  declare datas: QnapArtistDto[];
}

export class QnapMediaListRandomAlbumsResponseDto {
  @IsInt()
  declare success: number;

  @ApiProperty({
    type: QnapAlbumDto,
    isArray: true,
  })
  declare datas: QnapAlbumDto[];
}

export class QnapMediaListGeneralQueryDto {
  /**
   * The action (always "list")
   */
  @IsEnum(['list'])
  declare act: string;

  /**
   * The sort direction
   */
  @ApiProperty({
    enum: SortDirectionEnum,
    enumName: 'SortDirectionEnum',
    default: 'asc',
  })
  @IsEnum(SortDirectionEnum)
  declare desc: SortDirectionEnum;

  /**
   * The ID of an item being browsed, such as an artist or album or genre
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  declare linkid?: number;

  /**
   * A list of song ids for songs_info actions
   */
  @Transform(({ value }) => (value ? value.split(',').map(Number) : []))
  @IsInt({ each: true })
  @IsOptional()
  declare linkidlist?: number[];

  /**
   * The page size, AKA the "limit" elsewhere in this server
   */
  @IsInt()
  @Min(1)
  @Max(100_000)
  declare pagesize: number;

  /**
   * The current page, which multiplied by page size is AKA the "offset" elsewhere in this server
   */
  @IsInt()
  @Min(1)
  @Max(100_000)
  declare currpage: number;

  /**
   * The field to sort by
   */
  @ApiProperty({
    type: 'string',
    default: 'title',
  })
  @IsString()
  @IsEnum(['title'])
  declare sortBy: string;

  /**
   * Media grouping to return, album, artist
   */
  @IsEnum(['songs', 'artist', 'album', 'genre', 'songs_info', 'folder'])
  declare type: string;
}

class QnapMediaListAlbumsPaginatedDto {
  @IsInt()
  declare TotalCounts: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare CurrPage: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare PageSize: number;

  @ApiProperty({
    type: QnapAlbumDto,
    isArray: true,
  })
  declare data: QnapAlbumDto[];
}

class QnapMediaListArtistsPaginatedDto {
  @IsInt()
  declare TotalCounts: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare CurrPage: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare PageSize: number;

  @ApiProperty({
    type: QnapArtistDto,
    isArray: true,
  })
  declare data: QnapArtistDto[];
}

class QnapMediaListFoldersDto {
  @ApiProperty({
    type: QnapFolderDto,
    isArray: true,
  })
  declare data: QnapFolderDto[];
}

class QnapMediaListGenresPaginatedDto {
  @IsInt()
  declare TotalCounts: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare CurrPage: number;

  @IsInt()
  declare PageSize: number;

  @ApiProperty({
    type: QnapGenreDto,
    isArray: true,
  })
  declare data: QnapGenreDto[];
}
class QnapMediaListTracksPaginatedDto {
  @IsInt()
  declare TotalCounts: number;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  declare CurrPage: number;

  @IsInt()
  declare PageSize: number;

  @ApiProperty({
    type: QnapTrackDto,
    isArray: true,
  })
  declare data: QnapTrackDto[];
}

export class QnapMediaListArtistsResponseDto {
  @ApiProperty({
    type: QnapMediaListArtistsPaginatedDto,
  })
  declare datas: QnapMediaListArtistsPaginatedDto;
}

export class QnapMediaListAlbumsResponseDto {
  @ApiProperty({
    type: QnapMediaListAlbumsPaginatedDto,
  })
  declare datas: QnapMediaListAlbumsPaginatedDto;
}

export class QnapMediaListGenresResponseDto {
  @ApiProperty({
    type: QnapMediaListGenresPaginatedDto,
  })
  declare datas: QnapMediaListGenresPaginatedDto;
}

export class QnapMediaListFoldersResponseDto {
  @ApiProperty({
    type: QnapMediaListFoldersDto,
  })
  declare datas: QnapMediaListFoldersDto;
}

export class QnapMediaListTracksResponseDto {
  @ApiProperty({
    type: QnapMediaListTracksPaginatedDto,
  })
  declare datas: QnapMediaListTracksPaginatedDto;
}
