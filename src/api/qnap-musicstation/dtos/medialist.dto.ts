/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SortDirectionEnum } from 'src/types/enums';
import { Transform } from 'class-transformer';

export class QnapMediaListApiListQueryDto {
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
  declare linkidlist: number[];

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

export class QnapMediaListApiRandomQueryDto {
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
