/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';
import { NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';

export class AdminRegenerateUserSessionKeyQueryDto {
  /**
   * The ID of the account to regenerate the session key for.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class AdminRegenerateUserSessionKeyResponseDto extends SuccessResponseDto {}

export class AdminRegenerateUserSessionKeyNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminRegenerateUserSessionKeyNotFoundErrorMessageEnum',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}
