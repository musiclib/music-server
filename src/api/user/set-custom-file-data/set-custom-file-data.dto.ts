/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UserSetCustomFileDataQueryDto {
  /**
   * The ID of the file
   */
  @IsInt({ message: ErrorCodes.INVALID_FILE_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_FILE_ID_ERROR })
  declare id: number;
}

export class UserSetCustomFileDataBodyDto {
  @IsString({ message: ErrorCodes.INVALID_ALBUM_ARTISTS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_ALBUM_ARTISTS_LENGTH_ERROR })
  @IsOptional()
  declare albumArtists: string;

  @IsString({ message: ErrorCodes.INVALID_ALBUM_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_ALBUM_TITLE_LENGTH_ERROR })
  @IsOptional()
  declare albumTitle: string;

  @IsString({ message: ErrorCodes.INVALID_ARTIST_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR })
  @IsOptional()
  declare artists: string;

  @IsString({ message: ErrorCodes.INVALID_COMMENT_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_COMMENT_LENGTH_ERROR })
  @IsOptional()
  declare comment: string;

  @IsString({ message: ErrorCodes.INVALID_COMPOSERS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR })
  @IsOptional()
  declare composers: string;

  @IsInt({ message: ErrorCodes.INVALID_DISC_NUMBER_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR })
  @IsOptional()
  declare discNumber: number;

  @IsString({ message: ErrorCodes.INVALID_GENRES_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_GENRES_LENGTH_ERROR })
  @IsOptional()
  declare genres: string;

  @IsString({ message: ErrorCodes.INVALID_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_TITLE_LENGTH_ERROR })
  @IsOptional()
  declare title?: string;

  @IsInt({ message: ErrorCodes.INVALID_TRACK_NUMBER_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR })
  @IsOptional()
  declare trackNumber: number;

  @IsInt({ message: ErrorCodes.INVALID_YEAR_ERROR })
  @Min(1000, { message: ErrorCodes.INVALID_YEAR_ERROR })
  @Max(new Date().getFullYear() + 100, { message: ErrorCodes.INVALID_YEAR_RANGE_ERROR })
  @IsOptional()
  declare year?: number;
}

export class UserSetCustomFileDataResponseDto extends SuccessResponseDto {}

export class UserSetCustomFileDataNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR, ErrorCodes.NOT_FOUND_ERROR],
    enumName: 'UserSetCustomFileDataNotFoundErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}

const UserSetCustomFileDataBadRequestErrorMessage = [
  ErrorCodes.INVALID_FILE_ID_ERROR,
  ErrorCodes.INVALID_ALBUM_ARTISTS_ERROR,
  ErrorCodes.INVALID_ALBUM_ARTISTS_LENGTH_ERROR,
  ErrorCodes.INVALID_ALBUM_TITLE_ERROR,
  ErrorCodes.INVALID_ALBUM_TITLE_LENGTH_ERROR,
  ErrorCodes.INVALID_ARTISTS_ERROR,
  ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR,
  ErrorCodes.INVALID_COMMENT_ERROR,
  ErrorCodes.INVALID_COMMENT_LENGTH_ERROR,
  ErrorCodes.INVALID_COMPOSERS_ERROR,
  ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR,
  ErrorCodes.INVALID_DISC_NUMBER_ERROR,
  ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR,
  ErrorCodes.INVALID_GENRES_ERROR,
  ErrorCodes.INVALID_GENRES_LENGTH_ERROR,
  ErrorCodes.INVALID_TITLE_ERROR,
  ErrorCodes.INVALID_TITLE_LENGTH_ERROR,
  ErrorCodes.INVALID_TRACK_NUMBER_ERROR,
  ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR,
  ErrorCodes.INVALID_YEAR_ERROR,
  ErrorCodes.INVALID_YEAR_RANGE_ERROR,
];

export class UserSetCustomFileDataBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserSetCustomFileDataBadRequestErrorMessage,
    enumName: 'UserSetCustomFileDataBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
