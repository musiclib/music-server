/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class UserLogEntryDto {
  @IsDate()
  declare date: Date;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class UserListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class UserListIndexerLogsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: UserLogEntryDto,
    isArray: true,
  })
  declare logs: UserLogEntryDto[];
}

export class UserListIndexerLogsNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ACCOUNT_ID_ERROR, ErrorCodes.INVALID_ROOT_PATH_ID_ERROR],
    enumName: 'UserListIndexerLogsNotFoundErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserListIndexerLogsBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
      ErrorCodes.INVALID_ROOT_PATH_ID_ERROR,
      ErrorCodes.INVALID_SEARCH_LENGTH_ERROR,
    ],
    enumName: 'UserListIndexerLogsBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
