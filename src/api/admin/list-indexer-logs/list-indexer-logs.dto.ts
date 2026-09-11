/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class AdminLogEntryDto {
  @IsInt()
  declare accountId: number;

  @IsDate()
  declare date: Date;

  @IsString()
  declare username: string;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class AdminListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @IsOptional()
  accountId?: number;

  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class AdminListIndexerLogsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: AdminLogEntryDto,
    isArray: true,
  })
  declare logs: AdminLogEntryDto[];
}

export class AdminListIndexerLogsNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ACCOUNT_ID_ERROR, ErrorCodes.INVALID_ROOT_PATH_ID_ERROR],
    enumName: 'AdminListIndexerLogsNotFoundErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminListIndexerLogsBadRequestResponseDto extends BadRequestResponseDto {
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
    enumName: 'AdminListIndexerLogsBadRequestErrorMessageEnum',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
