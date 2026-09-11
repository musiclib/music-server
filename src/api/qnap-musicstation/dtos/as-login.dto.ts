/* eslint-disable max-classes-per-file */
import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QnapAsLoginQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  declare act?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  declare ssid?: string;
}
export class QnapAsLoginBodyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  declare act?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  declare ssid?: string;
}

export class QnapUserAsLoginFunctionsDto {
  @ApiProperty({
    example: 0,
    description: 'Whether the user can create shared folders.',
  })
  declare createsharefolder: number;
}

export class QnapUserAsLoginUserDataDto {
  @ApiProperty()
  declare status: number;

  @ApiProperty()
  declare localplayback: number;

  @ApiProperty()
  declare alarm: number;

  @ApiProperty()
  declare internetradio: number;

  @ApiProperty()
  declare id3tageditor: number;

  @ApiProperty()
  declare bluetooth: number;

  @ApiProperty()
  declare dlna: number;

  @ApiProperty()
  declare dlnaclient: number;

  @ApiProperty()
  declare account: string;

  @ApiProperty()
  declare usr_id: number;

  @ApiProperty()
  declare sid: string;

  @ApiProperty()
  declare is_admin: number;

  @ApiProperty()
  declare email: string;

  @ApiProperty()
  declare personal_email: string;

  @ApiProperty()
  declare defaultUpload: string;

  @ApiProperty()
  declare defaultUpload_ID: string;

  @ApiProperty()
  declare defaultUpload_Full_Path: string;

  @ApiProperty()
  declare scanMode: string;

  @ApiProperty()
  declare writable: string;

  @ApiProperty()
  declare qdms_enable: number;

  @ApiProperty()
  declare medialib: number;

  @ApiProperty()
  declare home_path: string;

  @ApiProperty()
  declare localplayback_enable: number;

  @ApiProperty()
  declare bluetooth_enable: number;

  @ApiProperty()
  declare ssid: number;

  @ApiProperty()
  declare is_hero: number;

  @ApiProperty()
  declare cuid: string;

  @ApiProperty()
  declare builtinFirmwareVersion: string;

  @ApiProperty()
  declare displayModelName: string;

  @ApiProperty()
  declare systemModelName: string;

  @ApiProperty({ type: QnapUserAsLoginFunctionsDto })
  declare api_functions: QnapUserAsLoginFunctionsDto;
}

export class QnapUserAsLoginSystemDataDto {
  @ApiProperty()
  declare MSVersion: string;

  @ApiProperty()
  declare media_console_support: string;

  @ApiProperty()
  declare mediafoder_counts: number;

  @ApiProperty()
  declare appVersion: string;

  @ApiProperty()
  declare auth: number;

  @ApiProperty()
  declare homes: number;

  @ApiProperty()
  declare recycle: number;

  @ApiProperty()
  declare qsync: number;

  @ApiProperty()
  declare api_version: string;

  @ApiProperty()
  declare cayin_install: number;

  @ApiProperty()
  declare cayin_license: string;
}

@ApiExtraModels(QnapUserAsLoginUserDataDto, QnapUserAsLoginSystemDataDto)
export class QnapUserAsLoginDatasDto {
  @ApiProperty({
    type: 'array',
    oneOf: [
      {
        $ref: getSchemaPath(QnapUserAsLoginUserDataDto),
      },
      {
        $ref: getSchemaPath(QnapUserAsLoginSystemDataDto),
      },
    ],
    description:
      'The first item contains user information. The second item contains system and application information.',
  })
  declare data: [QnapUserAsLoginUserDataDto, QnapUserAsLoginSystemDataDto];
}
@ApiExtraModels(QnapUserAsLoginDatasDto, QnapUserAsLoginUserDataDto, QnapUserAsLoginSystemDataDto)
export class QnapUserAsLoginDto {
  @ApiProperty({
    type: QnapUserAsLoginDatasDto,
  })
  declare datas: QnapUserAsLoginDatasDto;
}
