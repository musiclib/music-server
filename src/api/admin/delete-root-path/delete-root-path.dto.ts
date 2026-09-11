/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';

export class AdminDeleteRootPathQueryDto {
  /**
   * The ID of the root path to delete
   */
  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  declare id: number;
}

export class AdminDeleteRootPathResponseDto extends SuccessResponseDto {}

export class AdminDeleteRootPathNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR],
    enumName: 'AdminDeleteRootPathNotFoundErrorMessageEnum',
    default: ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}
