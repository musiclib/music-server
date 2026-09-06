// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRoleEnum } from 'src/types/enums';

export class AdminCreateAccountBodyDto {
  /**
   * The username for signing in
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;

  /**
   * The plain-text password the user will enter to sign in.  It will be hashed and securely-stored in the database.
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare password: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  @IsEnum(UserRoleEnum, { each: true, message: ErrorCodes.INVALID_ROLE_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USER_ROLE_ERROR })
  declare roles: UserRoleEnum[];
}

export class AdminCreateAccountResponseDto extends SuccessResponseDto {}

export class AdminCreateAccountBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ROLE_ERROR,
      ErrorCodes.INVALID_USER_ROLE_ERROR,
      ErrorCodes.INVALID_USERNAME_ERROR,
      ErrorCodes.INVALID_USERNAME_LENGTH_ERROR,
      ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
    ],
    enumName: 'AdminCreateAccountBadRequestErrorMessageEnum',
  })
  declare message: ErrorCodes[];
}
