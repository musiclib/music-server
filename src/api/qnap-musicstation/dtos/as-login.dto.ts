import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class QnapAsLoginQueryDto {
  @ApiProperty({
    default: 'login',
  })
  @IsString()
  @IsEnum(['login'])
  declare act: string;

  @IsString()
  @IsNotEmpty()
  declare ssid: string;
}
