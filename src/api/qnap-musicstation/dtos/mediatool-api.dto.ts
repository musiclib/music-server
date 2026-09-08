import { IsEnum, IsString } from 'class-validator';

export class QnapMediaToolApiQueryDto {
  @IsString()
  @IsEnum(['get_ip_list'])
  declare act: string;
}
