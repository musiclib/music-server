/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { NotFoundResponseDto } from 'src/api/response.dto';

export class GuestStreamFileQueryDto {
  /**
   * The ID of the file
   */
  @IsInt({ message: ErrorCodes.INVALID_FILE_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_FILE_ID_ERROR })
  declare id: number;
}

export class GuestStreamFileNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.FILE_NOT_FOUND_ERROR],
    enumName: 'GuestStreamFileNotFoundErrorMessage',
    default: ErrorCodes.FILE_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}
