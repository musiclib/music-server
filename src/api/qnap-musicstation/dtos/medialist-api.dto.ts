/* eslint-disable max-classes-per-file */
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class QnapMediaListApiBaseQueryDto {
  @IsInt()
  @Min(1)
  @Max(100_000)
  declare counts: number;

  @IsEnum(['album'])
  declare type: string;

  @IsString()
  @IsNotEmpty()
  declare sid: string;
}

export class QnapMediaListApiRandomQueryDto extends QnapMediaListApiBaseQueryDto {
  @IsEnum(['random'])
  declare act: string;
}
