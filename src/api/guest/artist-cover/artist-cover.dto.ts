import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Max, Min } from 'class-validator';

export class GuestArtistCoverQueryDto {
  /**
   * The ID of the artist
   */
  @IsInt({ message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  declare id: number;

  /**
   * The width/height size of the image in pixels
   */
  @IsInt({ message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Min(100, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  declare size: number;
}
