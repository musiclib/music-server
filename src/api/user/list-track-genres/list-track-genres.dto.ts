/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { GenreSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { LibraryGenreDto } from 'src/library/dtos/library.genre.dto';
import { PaginationQueryDto } from 'src/api/request.dto';

export class UserListTrackGenresQueryDto extends PaginationQueryDto {
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
    enum: GenreSortFieldEnum,
    default: GenreSortFieldEnum.GENRE,
    enumName: 'GenreSortFieldEnum',
  })
  @IsEnum(GenreSortFieldEnum, { message: ErrorCodes.INVALID_SORT_FIELD_ERROR })
  @IsOptional()
  sortField?: GenreSortFieldEnum;
}

export class UserListTrackGenresResponseDto extends SuccessResponseDto {
  /**
   * The list of genres that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryGenreDto,
    isArray: true,
  })
  declare genres: LibraryGenreDto[];

  /**
   * The offset of the first genre in the genres array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of genres that match the query parameters, which may be greater
   * than the number of genres returned in the genres array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

const UserListTrackGenresBadRequestErrorMessages = [
  ErrorCodes.INVALID_LIMIT_ERROR,
  ErrorCodes.INVALID_LIMIT_RANGE_ERROR,
  ErrorCodes.INVALID_OFFSET_ERROR,
  ErrorCodes.INVALID_OFFSET_RANGE_ERROR,
  ErrorCodes.INVALID_SORT_FIELD_ERROR,
  ErrorCodes.INVALID_SORT_ORDER_ERROR,
];

export class UserListTrackGenresBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserListTrackGenresBadRequestErrorMessages,
    enumName: 'UserListTrackGenresBadRequestErrorMessages',
    default: UserListTrackGenresBadRequestErrorMessages[0],
  })
  declare message: ErrorCodes[];
}
