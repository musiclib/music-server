/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsString } from 'class-validator';

export class UserCreateRootPathBodyDto {
  /**
   * The fully-qualified path to set for the root path
   */
  @IsString({ message: ErrorCodes.INVALID_ROOT_PATH_ERROR })
  declare rootPath: string;
}

export class UserCreateRootPathResponseDto extends SuccessResponseDto {}

export class UserCreateRootPathBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR, ErrorCodes.DUPLICATE_ROOT_PATH_ERROR],
    enumName: 'UserCreateRootPathBadRequestErrorMessageEnum',
    default: ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
  })
  declare message: ErrorCodes[];
}
