import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class QnapMediaToolApiQueryDto {
  @IsString()
  @IsEnum(['get_ip_list'])
  declare act: string;

  @IsString()
  @IsNotEmpty()
  declare sid: string;
}
