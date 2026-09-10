/* eslint-disable max-classes-per-file */
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QnapAuthLoginPreAuthQueryDto {}

class BaseLoginQueryDto {
  /**
   * The client browser or app user agent
   */
  @IsString()
  declare client_agent: string;

  /**
   * The client app
   */
  @IsString()
  @IsEnum(['Qmusic'])
  declare client_app: string;

  /**
   * An ID value sent by the client, probably randomly-generated or a fingerprint
   */
  @IsString()
  declare client_id: string;

  @IsInt()
  declare force_to_check_2sv: number;

  /**
   * Flag for remembering signin
   */
  @IsInt()
  declare remme: number;

  @IsInt()
  declare serviceKey: number;

  @IsInt()
  declare service: number;
}

export class QnapAuthLoginAuthenticateQueryDto extends BaseLoginQueryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => Buffer.from(value, 'base64').toString())
  declare pwd: string;

  @IsString()
  @IsNotEmpty()
  declare user: string;
}

export class QnapAuthLoginExistingLoginQueryDto extends BaseLoginQueryDto {
  @IsString()
  @IsNotEmpty()
  declare qtoken: string;

  @IsString()
  declare user: string;
}

export class QnapAuthLoginResumeSessionQueryDto extends BaseLoginQueryDto {
  /**
   * On a QNAP NAS this value is a 8-digit short string that authenticates the user
   * session.  In this software the JWT token is used instead.
   */
  @IsString()
  @IsNotEmpty()
  declare sid: string;
}

export class QnapAuthShutdownInfoDto {
  @ApiProperty()
  declare type: number;

  @ApiProperty()
  declare timestamp: number;

  @ApiProperty()
  declare duration: number;
}

export class QnapAuthPasswordConstraintsDto {
  @ApiProperty()
  declare passwdConstraint01: number;

  @ApiProperty()
  declare passwdConstraint02: number;

  @ApiProperty()
  declare passwdConstraint03: number;

  @ApiProperty()
  declare passwdConstraint04: number;

  @ApiProperty()
  declare pw_constraint01_opt: number;

  @ApiProperty()
  declare pw_constraint01_letter: number;

  @ApiProperty()
  declare pw_min_limit_en: number;

  @ApiProperty()
  declare pw_min_limit: number;
}

export class QnapAuthModelDto {
  @ApiProperty()
  declare modelName: string;

  @ApiProperty()
  declare internalModelName: string;

  @ApiProperty()
  declare platform: string;

  @ApiProperty()
  declare platform_ex: string;

  @ApiProperty()
  declare customModelName: string;

  @ApiProperty()
  declare displayModelName: string;

  @ApiProperty()
  declare sas_model: number;

  @ApiProperty()
  declare storage_v2: number;

  @ApiProperty()
  declare encryptfsSupported: number;

  @ApiProperty()
  declare is_zfs: number;

  @ApiProperty()
  declare vqts: string;

  @ApiProperty()
  declare node: string;

  @ApiProperty()
  declare dual_node: string;
}

export class QnapAuthFirmwareDto {
  @ApiProperty()
  declare name: string;

  @ApiProperty()
  declare version: string;

  @ApiProperty()
  declare number: number;

  @ApiProperty()
  declare build: number;

  @ApiProperty()
  declare patch: number;

  @ApiProperty()
  declare buildTime: string;
}

export class QnapAuthCustomLogoDto {
  @ApiProperty()
  declare customFrontLogo: string;

  @ApiProperty()
  declare customLoginLogo: string;
}

export class QnapAuthConnectionInfoDto {
  @ApiProperty()
  declare connet_ip: string;
}

export class QnapAuthBaseDto {
  @ApiProperty()
  declare doQuick: string;

  @ApiProperty()
  declare is_booting: number;

  @ApiProperty()
  declare mediaReady: number;

  @ApiProperty({ type: QnapAuthShutdownInfoDto })
  declare shutdown_info: QnapAuthShutdownInfoDto;

  @ApiProperty()
  declare authPassed: number;

  @ApiProperty()
  declare SMBFW: number;

  @ApiProperty()
  declare hero_model: number;

  @ApiProperty()
  declare qts_mode_type: number;

  @ApiProperty()
  declare isAdmin: number;

  @ApiProperty({ type: QnapAuthModelDto })
  declare model: QnapAuthModelDto;

  @ApiProperty({ type: QnapAuthFirmwareDto })
  declare firmware: QnapAuthFirmwareDto;

  @ApiProperty()
  declare rfs_bits: number;

  @ApiProperty()
  declare specVersion: string;

  @ApiProperty()
  declare hostname: string;

  @ApiProperty()
  declare DemoSiteSuppurt: string;

  @ApiProperty({ type: QnapAuthCustomLogoDto })
  declare customLogo: QnapAuthCustomLogoDto;

  @ApiProperty()
  declare webAccessPort: number;

  @ApiProperty()
  declare HTTPHost: string;

  @ApiProperty()
  declare QWebPort: number;

  @ApiProperty()
  declare webFSEnabled: number;

  @ApiProperty()
  declare QMultimediaEnabled: number;

  @ApiProperty()
  declare MSV2Supported: number;

  @ApiProperty()
  declare MSV2WebEnabled: number;

  @ApiProperty()
  declare MSV2URL: string;

  @ApiProperty()
  declare QDownloadEnabled: number;

  @ApiProperty()
  declare DSV2Supported: number;

  @ApiProperty()
  declare DSV3Supported: number;

  @ApiProperty()
  declare DSV2URL: string;

  @ApiProperty()
  declare QWebEnabled: number;

  @ApiProperty()
  declare QWebSSLEnabled: number;

  @ApiProperty()
  declare QWebSSLPort: number;

  @ApiProperty()
  declare NVREnabled: number;

  @ApiProperty()
  declare NVRURL: string;

  @ApiProperty()
  declare NVRVER: number;

  @ApiProperty()
  declare WFM2: number;

  @ApiProperty()
  declare wfmPortEnabled: number;

  @ApiProperty()
  declare wfmPort: number;

  @ApiProperty()
  declare wfmSSLEnabled: number;

  @ApiProperty()
  declare wfmSSLPort: number;

  @ApiProperty()
  declare wfmURL: string;

  @ApiProperty()
  declare QMusicsEnabled: number;

  @ApiProperty()
  declare QMusicsURL: string;

  @ApiProperty()
  declare QVideosEnabled: number;

  @ApiProperty()
  declare QVideosURL: string;

  @ApiProperty()
  declare QPhotosEnabled: number;

  @ApiProperty()
  declare QPhotosURL: string;

  @ApiProperty()
  declare HDAROOT_ALMOST_FULL: number;

  @ApiProperty()
  declare forceSSL: number;

  @ApiProperty()
  declare stunnelEnabled: number;

  @ApiProperty()
  declare stunnelPort: number;

  @ApiProperty()
  declare support_ksmbd: string;

  @ApiProperty({ type: QnapAuthPasswordConstraintsDto })
  declare passwdConstraints: QnapAuthPasswordConstraintsDto;

  @ApiProperty()
  declare ts: number;

  @ApiProperty()
  declare fwNotice: number;

  @ApiProperty()
  declare title: string;

  @ApiProperty()
  declare content: string;

  @ApiProperty()
  declare psType: number;

  @ApiProperty()
  declare standard_massage: string;

  @ApiProperty()
  declare standard_color: string;

  @ApiProperty()
  declare standard_size: string;

  @ApiProperty()
  declare standard_bg_style: string;

  @ApiProperty()
  declare showVersion: number;

  @ApiProperty()
  declare show_link: number;

  @ApiProperty()
  declare cuid: string;

  @ApiProperty()
  declare auth_method: string;

  @ApiProperty()
  declare mfa_support: string;

  @ApiProperty()
  declare function_support: string;
}

export class QnapPreauthenticateDto {
  @ApiProperty()
  declare doQuick: string;

  @ApiProperty()
  declare is_booting: number;

  @ApiProperty()
  declare mediaReady: number;

  @ApiProperty({ type: QnapAuthShutdownInfoDto })
  declare shutdown_info: QnapAuthShutdownInfoDto;

  @ApiProperty()
  declare hostname: string;

  @ApiProperty()
  declare DemoSiteSuppurt: string;

  @ApiProperty()
  declare webAccessPort: number;

  @ApiProperty()
  declare stunnelEnabled: number;

  @ApiProperty()
  declare stunnelPort: number;

  @ApiProperty()
  declare support_ksmbd: string;

  @ApiProperty({ type: QnapAuthPasswordConstraintsDto })
  declare passwdConstraints: QnapAuthPasswordConstraintsDto;

  @ApiProperty()
  declare ts: number;

  @ApiProperty()
  declare fwNotice: number;

  @ApiProperty()
  declare title: string;

  @ApiProperty()
  declare content: string;

  @ApiProperty()
  declare psType: number;

  @ApiProperty()
  declare standard_massage: string;

  @ApiProperty()
  declare standard_color: string;

  @ApiProperty()
  declare standard_size: string;

  @ApiProperty()
  declare standard_bg_style: string;

  @ApiProperty()
  declare showVersion: number;

  @ApiProperty()
  declare show_link: number;

  @ApiProperty()
  declare cuid: string;

  @ApiProperty()
  declare auth_method: string;

  @ApiProperty()
  declare mfa_support: string;

  @ApiProperty()
  declare function_support: string;
}

export class QnapAuthLoginDto extends QnapAuthBaseDto {
  @ApiProperty()
  declare pw_status: number;

  @ApiProperty()
  declare qtoken: string;

  @ApiProperty()
  declare user_enable: number;

  @ApiProperty()
  declare user_account_expiry: number;

  @ApiProperty()
  declare authSid: string;

  @ApiProperty()
  declare username: string;

  @ApiProperty()
  declare groupname: string;

  @ApiProperty()
  declare SUID: string;

  @ApiProperty()
  declare serviceURL: string;
}

export class QnapAuthLoginFailedDto extends PickType(QnapAuthBaseDto, [
  'doQuick',
  'is_booting',
  'mediaReady',
  'shutdown_info',
  'authPassed',
  'ts',
  'fwNotice',
  'title',
  'content',
  'psType',
  'standard_massage',
  'standard_color',
  'standard_size',
  'standard_bg_style',
  'showVersion',
  'show_link',
  'cuid',
  'auth_method',
  'mfa_support',
  'function_support',
] as const) {
  @IsInt()
  declare errorValue: number;

  @IsInt()
  declare authPassed: number;

  @IsString()
  declare username: '';
}

export class QnapAuthResumeSessionDto extends QnapAuthBaseDto {
  @ApiProperty()
  declare user: string;

  @ApiProperty()
  declare username: string;

  @ApiProperty()
  declare groupname: string;

  @ApiProperty()
  declare userid: number;

  @ApiProperty()
  declare force_2sv: number;

  @ApiProperty()
  declare userType: string;

  @ApiProperty()
  declare gqMaster: number;

  @ApiProperty()
  declare quickStart: number;

  @ApiProperty({ type: QnapAuthConnectionInfoDto })
  declare connet_info: QnapAuthConnectionInfoDto;

  @ApiProperty()
  declare SUID: string;

  @ApiProperty()
  declare _version: string;
}
