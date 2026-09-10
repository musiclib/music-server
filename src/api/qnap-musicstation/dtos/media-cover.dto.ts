import { IsString } from 'class-validator';

export class QnapMediaCoverQueryDto {
  /**
   * The action (always "list")
   */
  @IsString()
  declare imagepath: string;
}
