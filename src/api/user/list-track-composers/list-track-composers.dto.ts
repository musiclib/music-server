/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ComposerSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { LibraryComposerDto } from 'src/library/dtos/library.composer.dto';
import { PaginationQueryDto } from 'src/api/request.dto';
import { Transform } from 'class-transformer';

export class UserListTrackComposersQueryDto extends PaginationQueryDto {
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
   * Optional filter for the date the composer was added to the library, which will do an exact match against
   * the date the composer was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
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
   * Optional search filter that will do a case-insensitive partial-match against the composer
   * name, artist name, album name, or genre.
   */
  @IsString({ message: ErrorCodes.INVALID_FILTER_ERROR })
  @Length(1, 100, { message: ErrorCodes.INVALID_FILTER_LENGTH_ERROR })
  @IsOptional()
  filter?: string;

  /**
   * Optional filter for the genre name, which will do a case-insensitive partial-match against the
   * genres associated with a composer.
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
    enum: ComposerSortFieldEnum,
    default: ComposerSortFieldEnum.COMPOSER,
    enumName: 'ComposerSortFieldEnum',
  })
  @IsEnum(ComposerSortFieldEnum, { message: ErrorCodes.INVALID_SORT_FIELD_ERROR })
  @IsOptional()
  sortField?: ComposerSortFieldEnum;
}

export class UserListTrackComposersResponseDto extends SuccessResponseDto {
  /**
   * The list of composers that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryComposerDto,
    isArray: true,
  })
  declare composers: LibraryComposerDto[];

  /**
   * The offset of the first composer in the composers array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of composers that match the query parameters, which may be greater
   * than the number of composers returned in the composers array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

const UserListTrackComposersBadRequestErrorMessages = [
  ErrorCodes.INVALID_ADDED_AFTER_ERROR,
  ErrorCodes.INVALID_ADDED_BEFORE_ERROR,
  ErrorCodes.INVALID_FILTER_ERROR,
  ErrorCodes.INVALID_FILTER_LENGTH_ERROR,
  ErrorCodes.INVALID_GENRE_ERROR,
  ErrorCodes.INVALID_GENRE_LENGTH_ERROR,
  ErrorCodes.INVALID_LIMIT_ERROR,
  ErrorCodes.INVALID_LIMIT_RANGE_ERROR,
  ErrorCodes.INVALID_OFFSET_ERROR,
  ErrorCodes.INVALID_OFFSET_RANGE_ERROR,
  ErrorCodes.INVALID_SORT_FIELD_ERROR,
  ErrorCodes.INVALID_SORT_ORDER_ERROR,
];

export class UserListTrackComposersBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserListTrackComposersBadRequestErrorMessages,
    enumName: 'UserListTrackComposersBadRequestErrorMessages',
    default: UserListTrackComposersBadRequestErrorMessages[0],
  })
  declare message: ErrorCodes[];
}
