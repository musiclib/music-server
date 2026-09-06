/* eslint-disable max-classes-per-file */
import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { LibraryAlbumDto } from 'src/library/dtos/library.album.dto';
import { PaginationQueryDto } from 'src/api/request.dto';
import { Transform } from 'class-transformer';

export class UserListAlbumsQueryDto extends PaginationQueryDto {
  /**
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsDate({ message: ErrorCodes.INVALID_ADDED_AFTER_ERROR })
  @Transform(({ value }) => new Date(value))
  @Min(new Date(1000, 0, 1).getTime(), { message: ErrorCodes.INVALID_ADDED_AFTER_ERROR })
  @Max(new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).getTime(), {
    message: ErrorCodes.INVALID_ADDED_AFTER_ERROR,
  })
  @IsOptional()
  addedAfter?: Date;

  /**
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsDate({ message: ErrorCodes.INVALID_ADDED_BEFORE_ERROR })
  @Transform(({ value }) => new Date(value))
  @Min(new Date(1000, 0, 1).getTime(), { message: ErrorCodes.INVALID_ADDED_BEFORE_ERROR })
  @Max(new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).getTime(), {
    message: ErrorCodes.INVALID_ADDED_BEFORE_ERROR,
  })
  @IsOptional()
  addedBefore?: Date;

  /**
   * Optional filter for the artist name, which will do a case-insensitive partial-match against the
   * artists associated with an album.
   */
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
  })
  @IsString({ each: true, message: ErrorCodes.INVALID_ARTIST_ERROR })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Length(1, 100, { each: true, message: ErrorCodes.INVALID_ARTIST_LENGTH_ERROR })
  @IsNotEmpty({ each: true, message: ErrorCodes.INVALID_ARTIST_LENGTH_ERROR })
  @IsOptional()
  artist?: string[];

  /**
   * Optional filter for the composer name, which will do a case-insensitive partial-match against the
   * composers associated with an album.
   */
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
  })
  @IsString({ each: true, message: ErrorCodes.INVALID_COMPOSER_ERROR })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Length(1, 100, { each: true, message: ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR })
  @IsNotEmpty({ each: true, message: ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR })
  @IsOptional()
  composer?: string[];

  /**
   * Optional search filter that will do a case-insensitive partial-match against the album
   * name, artist name, composer name, or genre.
   */
  @IsString({ message: ErrorCodes.INVALID_FILTER_ERROR })
  @Length(1, 100, { message: ErrorCodes.INVALID_FILTER_LENGTH_ERROR })
  @IsOptional()
  filter?: string;

  /**
   * Optional filter for the genre name, which will do a case-insensitive partial-match against the
   * genres associated with an album.
   */
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
  })
  @IsString({ each: true, message: ErrorCodes.INVALID_GENRE_ERROR })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Length(1, 100, { each: true, message: ErrorCodes.INVALID_GENRE_LENGTH_ERROR })
  @IsNotEmpty({ each: true, message: ErrorCodes.INVALID_GENRE_LENGTH_ERROR })
  @IsOptional()
  genre?: string[];

  /**
   * Maximum rating value, which will do an exact match against the rating associated with an album.  The
   * rating is a value between 0 and 5, inclusive.
   */
  @IsInt({ message: ErrorCodes.INVALID_MAX_RATING_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_MAX_RATING_ERROR })
  @Max(5, { message: ErrorCodes.INVALID_MAX_RATING_ERROR })
  @IsOptional()
  maxRating?: number;

  /**
   * Minimum rating value, which will do an exact match against the rating associated with an album.  The
   * rating is a value between 0 and 5, inclusive.
   */
  @IsInt({ message: ErrorCodes.INVALID_MIN_RATING_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_MIN_RATING_ERROR })
  @Max(5, { message: ErrorCodes.INVALID_MIN_RATING_ERROR })
  @IsOptional()
  minRating?: number;

  /**
   * Optional filter for the date the album was released, which will do an exact match against
   * the date of release.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsDate({ message: ErrorCodes.INVALID_RELEASED_AFTER_ERROR })
  @Transform(({ value }) => new Date(value))
  @Min(new Date(1000, 0, 1).getTime(), { message: ErrorCodes.INVALID_RELEASED_AFTER_ERROR })
  @Max(new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).getTime(), {
    message: ErrorCodes.INVALID_RELEASED_AFTER_ERROR,
  })
  @IsOptional()
  releasedAfter?: Date;

  /**
   * Optional filter for the date the album was released, which will do an exact match against
   * the date of release.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsDate({ message: ErrorCodes.INVALID_RELEASED_BEFORE_ERROR })
  @Transform(({ value }) => new Date(value))
  @Min(new Date(1000, 0, 1).getTime(), { message: ErrorCodes.INVALID_RELEASED_BEFORE_ERROR })
  @Max(new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).getTime(), {
    message: ErrorCodes.INVALID_RELEASED_BEFORE_ERROR,
  })
  @IsOptional()
  releasedBefore?: Date;

  /**
   * Optional filter for the direction to sort the results by.
   */
  @ApiProperty({
    enum: SortDirectionEnum,
    default: SortDirectionEnum.ASC,
    enumName: 'SortDirectionEnum',
  })
  @IsEnum(SortDirectionEnum, { message: ErrorCodes.INVALID_SORT_ORDER_ERROR })
  @IsOptional()
  sortDirection?: SortDirectionEnum;

  /**
   * Optional filter for the field to sort results by.
   */
  @ApiProperty({
    enum: AlbumSortFieldEnum,
    default: AlbumSortFieldEnum.ALBUM,
    enumName: 'AlbumSortFieldEnum',
  })
  @IsEnum(AlbumSortFieldEnum, { message: ErrorCodes.INVALID_SORT_FIELD_ERROR })
  @IsOptional()
  sortField?: AlbumSortFieldEnum;

  /**
   * Optional filter for the year of the album, which will do an exact match against the year associated
   * with an album's release date.
   */
  @ApiProperty({
    type: 'integer',
    required: false,
  })
  @IsInt({ message: ErrorCodes.INVALID_YEAR_ERROR })
  @Min(1000, { message: ErrorCodes.INVALID_YEAR_ERROR })
  @Max(new Date().getFullYear() + 100, { message: ErrorCodes.INVALID_YEAR_ERROR })
  @IsOptional()
  year?: number;
}

export class UserListAlbumsResponseDto extends SuccessResponseDto {
  /**
   * The list of albums that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryAlbumDto,
    isArray: true,
  })
  declare albums: LibraryAlbumDto[];

  /**
   * The offset of the first album in the albums array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of albums that match the query parameters, which may be greater
   * than the number of albums returned in the albums array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

const UserListAlbumsBadRequestErrorMessages = [
  ErrorCodes.INVALID_ADDED_AFTER_ERROR,
  ErrorCodes.INVALID_ADDED_BEFORE_ERROR,
  ErrorCodes.INVALID_ARTIST_ERROR,
  ErrorCodes.INVALID_ARTIST_LENGTH_ERROR,
  ErrorCodes.INVALID_COMPOSER_ERROR,
  ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR,
  ErrorCodes.INVALID_FILTER_ERROR,
  ErrorCodes.INVALID_FILTER_LENGTH_ERROR,
  ErrorCodes.INVALID_GENRE_ERROR,
  ErrorCodes.INVALID_GENRE_LENGTH_ERROR,
  ErrorCodes.INVALID_LIMIT_ERROR,
  ErrorCodes.INVALID_LIMIT_RANGE_ERROR,
  ErrorCodes.INVALID_MAX_RATING_ERROR,
  ErrorCodes.INVALID_MIN_RATING_ERROR,
  ErrorCodes.INVALID_OFFSET_ERROR,
  ErrorCodes.INVALID_OFFSET_RANGE_ERROR,
  ErrorCodes.INVALID_RELEASED_AFTER_ERROR,
  ErrorCodes.INVALID_RELEASED_BEFORE_ERROR,
  ErrorCodes.INVALID_SORT_FIELD_ERROR,
  ErrorCodes.INVALID_SORT_ORDER_ERROR,
  ErrorCodes.INVALID_YEAR_ERROR,
];

export class UserListAlbumsBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request.
   */
  @ApiProperty({
    isArray: true,
    enum: UserListAlbumsBadRequestErrorMessages,
    enumName: 'UserListAlbumsBadRequestErrorMessages',
    default: UserListAlbumsBadRequestErrorMessages[0],
  })
  declare message: ErrorCodes[];
}
