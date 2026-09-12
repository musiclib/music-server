/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class AdminResetUserPasswordQueryDto {
  /**
   * The ID of the account whose password is to be reset.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class AdminResetUserPasswordBodyDto {
  /**
   * The administrator's password to authorize the change
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare adminPassword: string;

  @IsString({ message: ErrorCodes.INVALID_NEW_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_NEW_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_NEW_PASSWORD_ERROR })
  declare newPassword: string;
}

export class AdminResetUserPasswordResponseDto extends SuccessResponseDto {}

export class AdminResetUserPasswordNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminResetUserPasswordNotFoundErrorMessageEnum',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminResetUserPasswordBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
      ErrorCodes.INVALID_NEW_PASSWORD_ERROR,
      ErrorCodes.INVALID_NEW_PASSWORD_LENGTH_ERROR,
    ],
    enumName: 'AdminResetUserPasswordBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_PASSWORD_ERROR,
  })
  declare message: ErrorCodes[];
}
