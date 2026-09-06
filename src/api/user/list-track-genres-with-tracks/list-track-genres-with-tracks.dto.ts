/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';
import { LibraryGenreWithTracksDto } from 'src/library/dtos/library.genre.dto';
import { UserListTrackGenresQueryDto } from '../list-track-genres/list-track-genres.dto';

export class UserListTrackGenresWithTracksQueryDto extends UserListTrackGenresQueryDto {}

export class UserListTrackGenresWithTracksResponseDto extends SuccessResponseDto {
  /**
   * The list of genres that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryGenreWithTracksDto,
    isArray: true,
  })
  declare genres: LibraryGenreWithTracksDto[];

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

const UserListTrackGenresWithTracksBadRequestErrorMessages = [
  ErrorCodes.INVALID_LIMIT_ERROR,
  ErrorCodes.INVALID_LIMIT_RANGE_ERROR,
  ErrorCodes.INVALID_OFFSET_ERROR,
  ErrorCodes.INVALID_OFFSET_RANGE_ERROR,
  ErrorCodes.INVALID_SORT_FIELD_ERROR,
  ErrorCodes.INVALID_SORT_ORDER_ERROR,
];

export class UserListTrackGenresWithTracksBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserListTrackGenresWithTracksBadRequestErrorMessages,
    enumName: 'UserListTrackGenresWithTracksBadRequestErrorMessages',
    default: UserListTrackGenresWithTracksBadRequestErrorMessages[0],
  })
  declare message: ErrorCodes[];
}
