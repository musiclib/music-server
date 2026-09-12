/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsInt, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRoleEnum } from 'src/types/enums';

export class AdminUpdateUserRolesQueryDto {
  /**
   * The ID of the account whose roles are changing.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare id: number;
}

export class AdminUpdateUserRolesBodyDto {
  /**
   * The administrator's password to authorize the change
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  declare adminPassword: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  @IsEnum(UserRoleEnum, {
    each: true,
    message: ErrorCodes.INVALID_ROLE_ERROR,
  })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USER_ROLE_ERROR })
  declare roles: UserRoleEnum[];
}

export class AdminUpdateUserRolesResponseDto extends SuccessResponseDto {}

export class AdminUpdateUserRolesNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminUpdateUserRolesNotFoundErrorMessageEnum',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminUpdateUserRolesBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_USER_ROLE_ERROR, ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR],
    enumName: 'AdminUpdateUserRolesBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_USER_ROLE_ERROR,
  })
  declare message: ErrorCodes[];
}
