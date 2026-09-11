/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';

export class AdminDeleteAccountQueryDto {
  /**
   * The ID of the account to be deleted.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class AdminDeleteAccountResponseDto extends SuccessResponseDto {}

export class AdminDeleteAccountNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ACCOUNT_ID_ERROR, ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminDeleteAccountNotFoundErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminDeleteAccountBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ACCOUNT_ID_ERROR, ErrorCodes.INVALID_ACCOUNT_ERROR, ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR],
    enumName: 'AdminDeleteAccountBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
