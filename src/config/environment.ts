import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Structure of the environment configuration variables.
 */
export class Environment {
  /**
   * Flag for running database migrations and seeders on application startup. The
   * only time you would not set this is if you are running the server directly and
   * have manually run the migration/seed scripts as required.
   */
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  declare BUILD_DATABASE?: boolean;

  /**
   * The SQLite database file path
   */
  @IsUrl()
  @IsNotEmpty()
  declare DATABASE_PATH: string;

  /**
   * The JWT secret for signing and verifying tokens. This should be a long, random string for security purposes.
   */
  @IsString()
  @IsNotEmpty()
  declare JWT_SECRET: string;

  /**
   * The environment the application is running in. This can be 'development', 'production', or 'test'.
   */
  @IsString()
  @IsIn(['development', 'production', 'test'])
  @IsNotEmpty()
  declare NODE_ENV: 'development' | 'production' | 'test';

  /**
   * The session expiration time in seconds. This should be a positive integer.
   */
  @IsString()
  @IsNotEmpty()
  declare SESSION_EXPIRES: string;

  /**
   * The port for the server
   */
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  declare SERVER_PORT: number;

  /**
   * The address for the server
   */
  @IsString()
  declare SERVER_ADDRESS: string;

  /**
   * The LAN address to report for the server
   */
  @IsString()
  declare LAN_SERVER_ADDRESS?: string;

  /**
   * The LAN address port to report for the server
   */
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  declare LAN_SERVER_PORT?: number;

  /**
   * The WAN address to report for the server
   */
  @IsString()
  declare WAN_SERVER_ADDRESS?: string;

  /**
   * The WAN address port to report for the server
   */
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  declare WAN_SERVER_PORT?: number;

  /**
   * ------------------------------------------------------
   * QNAP Music Station / QMusic configuration
   * ------------------------------------------------------
   */
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  declare QNAP_MUSICSTATION_ENABLED?: boolean;

  /**
   * A server-wide and persistent unique identifier that poses as a secret passed
   * to QMusic app and posted to the server to verify their access.
   */
  @IsString()
  declare QNAP_CUID?: string;

  /**
   * ------------------------------------------------------
   * SYNOLOGY AudioStation / DS Audio configuration
   * ------------------------------------------------------
   */

  /**
   * Optional flag for enabling the endpoints required to use Synology DS Audio apps
   */
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  declare SYNOLOGY_AUDIOSTATION_ENABLED?: boolean;

  /**
   * The public key is passed to Synology mobile apps to encrypt credentials
   */
  @IsString()
  declare SYNOLOGY_PUBLIC_KEY_PATH: string;

  /**
   * The private key is used by the application to decrypt credentials encrypted with the public key.
   */
  @IsString()
  declare SYNOLOGY_PRIVATE_KEY_PATH: string;
}
