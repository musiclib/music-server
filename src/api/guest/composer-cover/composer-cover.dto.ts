import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Max, Min } from 'class-validator';

export class GuestComposerCoverQueryDto {
  /**
   * The ID of the composer
   */
  @IsInt({ message: ErrorCodes.INVALID_COMPOSER_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_COMPOSER_ID_ERROR })
  declare id: number;

  /**
   * The width/height size of the image in pixels
   */
  @IsInt({ message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Min(100, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  declare size: number;
}
