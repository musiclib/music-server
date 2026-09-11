import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QnapMediaCoverQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  declare imagepath?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  declare artistId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  declare albumId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  declare folderId?: number;
}
