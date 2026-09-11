/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class QnapSysRequestQueryDto {
  @IsString()
  @IsNotEmpty()
  declare sid: string;
}

class QnapSysRequestModelDto {
  @IsString()
  declare modelName: string;

  @IsString()
  declare customModelName: string;

  @IsString()
  declare displayModelName: string;

  @IsString()
  declare dual_node: string;

  @IsInt()
  declare encryptfsSupported: number;

  @IsString()
  declare internalModelName: string;

  @IsInt()
  declare is_zfs: number;

  @IsString()
  declare node: string;

  @IsString()
  declare platform: string;

  @IsString()
  declare platform_ex: string;

  @IsInt()
  declare sas_model: number;

  @IsInt()
  declare storage_v2: number;

  @IsString()
  declare vqts: string;
}

class QnapSysRequestFirmwareDto {
  @IsInt()
  declare build: number;

  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  @IsDate()
  declare buildTime: string;

  @IsString()
  declare name: string;

  @IsInt()
  declare number: number;

  @IsInt()
  declare patch: number;

  @IsString()
  declare version: string;
}

class QnapSysRequestCustomLogoDto {
  @IsString()
  declare customFrontLogo: string;

  @IsString()
  declare customLoginLogo: string;
}

class QnapSysRequestFuncOwnContentConsoleDto {
  @IsInt()
  declare auto_launch: number;
}

class QnapSysRequestFuncOwnContentPopUpDto {
  @IsInt()
  declare raid_scrubbing_enabled: number;
}

class QnapSysRequestFuncOwnContentRegionDto {
  @IsString()
  declare account_myqnapcloud: string;

  @IsString()
  declare download_qnap: string;

  @IsString()
  declare license_myqnapcloud: string;

  @IsString()
  declare sys_region: string;

  @IsString()
  declare update_qnap: string;

  @IsString()
  declare www_myqnapcloud: string;
}

class QnapSysRequestFuncOwnContentDateAndTimeNtpDto {
  @IsString()
  declare DSTfrom: string;

  @IsString()
  declare DSToffset: string;

  @IsString()
  declare DSTto: string;

  @IsInt()
  declare enable: number;

  @IsString()
  declare enableAdjDST: string;

  @IsString()
  declare enableDSTtable: string;

  @IsString()
  declare ntpServer: string;

  @IsNumber()
  declare timeInterval: number;

  @IsString()
  declare type: string;
}

class QnapSysRequestFuncOwnContentDateAndTimeDto {
  @IsInt()
  declare codepage: number;

  @IsInt()
  declare dateformatindex: number;

  @IsInt()
  declare day: number;

  @IsInt()
  declare dn: number;

  @IsInt()
  declare hour: number;

  @IsInt()
  declare minute: number;

  @IsInt()
  declare month: number;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentDateAndTimeNtpDto,
  })
  declare NTP: QnapSysRequestFuncOwnContentDateAndTimeNtpDto;

  @IsInt()
  declare second: number;

  @IsInt()
  declare timeformat: number;

  @IsString()
  declare timezone: string;

  @IsInt()
  declare year: number;
}

export class QnapSysRequestFuncOwnContentSystemDto {
  @IsString()
  declare serverName: string;

  @IsInt()
  declare port: number;

  @IsInt()
  declare optionHF: number;

  @IsInt()
  declare hideHF: number;

  @IsInt()
  declare SSL: number;

  @IsInt()
  declare SSLPort: number;

  @IsInt()
  declare SSLForce: number;

  @IsInt()
  declare HSTS: number;

  @IsInt()
  declare iframe: number;

  @IsString()
  declare iframeurl: string;

  @IsInt()
  declare HTTPCompress: number;

  @IsInt()
  declare XContentType: number;

  @IsNumber()
  declare SSLProtocol: number;

  @IsNumber()
  declare MaxSSLProtocol: number;

  @IsInt()
  declare ServerHeaderEnable: number;

  @IsString()
  declare ServerHeader: string;

  @IsInt()
  declare SSLHighCipherEnable: number;

  @IsInt()
  declare CSPEnable: number;

  @IsInt()
  declare RedirectSystem: number;
}

class QnapSysRequestFuncOwnContentDto {
  @ApiProperty({
    type: QnapSysRequestFuncOwnContentConsoleDto,
  })
  declare console_mgmt: QnapSysRequestFuncOwnContentConsoleDto;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentDateAndTimeDto,
  })
  declare dateandtime: QnapSysRequestFuncOwnContentDateAndTimeDto;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentPopUpDto,
  })
  declare Popup: QnapSysRequestFuncOwnContentPopUpDto;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentRegionDto,
  })
  declare Region: QnapSysRequestFuncOwnContentRegionDto;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentSystemDto,
  })
  declare system: QnapSysRequestFuncOwnContentSystemDto;
}

class QnapSysRequestFuncDto {
  @IsString()
  declare name: string;

  @ApiProperty({
    type: QnapSysRequestFuncOwnContentDto,
  })
  declare ownContent: QnapSysRequestFuncOwnContentDto;
}

export class QnapSysRequestDto {
  @IsInt()
  declare authPassed: number;

  @ApiProperty({
    type: QnapSysRequestCustomLogoDto,
  })
  declare customLogo: QnapSysRequestCustomLogoDto;

  @IsString()
  @IsEnum(['yes', 'no'])
  declare DemoSiteSuppurt: 'yes' | 'no';

  @ApiProperty({
    type: QnapSysRequestFirmwareDto,
  })
  declare firmware: QnapSysRequestFirmwareDto;

  @ApiProperty({
    type: QnapSysRequestFuncDto,
  })
  declare func: QnapSysRequestFuncDto;

  @IsString()
  declare hostname: string;

  @ApiProperty({
    type: QnapSysRequestModelDto,
  })
  declare model: QnapSysRequestModelDto;

  @IsInt()
  declare rfs_bits: number;

  @IsInt()
  declare sleepSupport: number;

  @IsString()
  declare specVersion: string;
}
