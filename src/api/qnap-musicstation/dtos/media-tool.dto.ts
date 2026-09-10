/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class QnapMediaToolQueryDto {
  @IsString()
  @IsEnum(['get_ip_list'])
  declare act: string;
}

export class QnapMediaToolDto {
  @IsString()
  declare LANIP: string;

  @IsString()
  declare LANIP_LIST: string;

  @IsInt()
  declare INNERPORT: number;

  @IsString()
  declare INNERPORT_SSL?: string;

  @IsString()
  declare EXTIP: string;

  @IsInt()
  declare EXTPORT: number;

  @IsString()
  declare EXTPORT_SSL?: string;
}

export class QnapMediaToolResponseDto {
  @IsInt()
  declare success: number;

  @ApiProperty({
    type: QnapMediaToolDto,
  })
  declare info: QnapMediaToolDto;
}
