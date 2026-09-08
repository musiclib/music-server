/* eslint-disable max-classes-per-file */
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

export class QnapAuthLoginQueryDto extends BaseLoginQueryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => Buffer.from(value, 'base64').toString())
  declare pwd: string;

  @IsString()
  @IsNotEmpty()
  declare user: string;
}

export class QnapAuthExistingLoginQueryDto extends BaseLoginQueryDto {
  @IsString()
  @IsNotEmpty()
  declare qtoken: string;

  @IsString()
  declare user: string;
}

export class QnapAuthResumeSessionQueryDto extends BaseLoginQueryDto {
  /**
   * On a QNAP NAS this value is a 8-digit short string that authenticates the user
   * session.  In this software the JWT token is used instead.
   */
  @IsString()
  @IsNotEmpty()
  declare sid: string;
}
