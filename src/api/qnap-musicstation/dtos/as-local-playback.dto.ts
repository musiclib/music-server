import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class QnapAsLocalPlaybackQueryDto {
  @ApiProperty({
    default: 'checkstatus',
  })
  @IsString()
  @IsEnum(['checkstatus'])
  declare act: string;
}
