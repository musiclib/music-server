/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AdminUpdateRootPathQueryDto {
  /**
   * The ID of the root path to update
   */
  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  declare id: number;
}

export class AdminUpdateRootPathBodyDto {
  /**
   * The new path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare newPath: string;
}

export class AdminUpdateRootPathResponseDto extends SuccessResponseDto {}

export class AdminUpdateRootPathNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR],
    enumName: 'AdminUpdateRootPathNotFoundErrorMessageEnum',
    default: ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminUpdateRootPathBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR, ErrorCodes.DUPLICATE_ROOT_PATH_ERROR],
    enumName: 'AdminUpdateRootPathBadRequestErrorMessageEnum',
    default: ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
  })
  declare message: ErrorCodes[];
}
