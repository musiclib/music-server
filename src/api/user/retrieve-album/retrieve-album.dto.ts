/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos/library.album.dto';
import { NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';

export class UserRetrieveAlbumQueryDto {
  /**
   * The ID of the album
   */
  @IsInt({ message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  declare id: number;
}

export class UserRetrieveAlbumResponseDto extends SuccessResponseDto {
  /**
   * The list of albums that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
  })
  declare album: LibraryAlbumWithTracksDto;
}

export class UserRetrieveAlbumNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
    enumName: 'UserRetrieveAlbumNotFoundErrorMessage',
    default: ErrorCodes.ALBUM_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}
