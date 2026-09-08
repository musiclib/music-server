import { IsString } from 'class-validator';

export class QnapMediaCoverApiQueryDto {
  /**
   * The action (always "list")
   */
  @IsString()
  declare imagepath: string;
}
