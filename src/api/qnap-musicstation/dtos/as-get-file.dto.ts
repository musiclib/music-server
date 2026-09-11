import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QnapAsGetFileQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.f?.substring('music_'.length), 10) ?? undefined)
  declare f: number;

  @IsString()
  declare ext: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  declare from?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  declare addcounts?: number;
}
