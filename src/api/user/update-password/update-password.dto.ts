/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserUpdatePasswordBodyDto {
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare newPassword: string;
}

export class UserUpdatePasswordResponseDto extends SuccessResponseDto {}

export class UserUpdatePasswordBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_PASSWORD_ERROR, ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR],
    enumName: 'UserUpdatePasswordBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_PASSWORD_ERROR,
  })
  declare message: ErrorCodes[];
}
