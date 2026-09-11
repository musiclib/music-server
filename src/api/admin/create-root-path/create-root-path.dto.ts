/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString } from 'class-validator';

export class AdminCreateRootPathQueryDto {
  /**
   * The ID of the account to create the root path for.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class AdminCreateRootPathBodyDto {
  /**
   * The fully-qualified path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare rootPath: string;
}

export class AdminCreateRootPathResponseDto extends SuccessResponseDto {}

export class AdminCreateRootPathNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminCreateRootPathNotFoundErrorMessageEnum',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminCreateRootPathBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR, ErrorCodes.DUPLICATE_ROOT_PATH_ERROR],
    enumName: 'AdminCreateRootPathBadRequestErrorMessageEnum',
    default: ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
  })
  declare message: ErrorCodes[];
}
