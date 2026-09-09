import { IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QnapAsGetFileQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.f?.substring('music_'.length), 10) ?? undefined)
  declare f: number;

  @IsString()
  declare ext: string;

  @IsString()
  declare from: string;

  @IsInt()
  declare addcounts: number;
}
