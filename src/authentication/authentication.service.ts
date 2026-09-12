import * as bcrypt from 'bcryptjs';
import { AccountEntity, SessionEntity } from 'src/database/entities';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @InjectModel(SessionEntity)
    private readonly sessionEntity: typeof SessionEntity,
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  async getMasterSessionKey(): Promise<Guid> {
    const systemConfiguration = await this.systemConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    if (!systemConfiguration) {
      throw new NotFoundException(ErrorCodes.SYSTEM_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return systemConfiguration.sessionMasterKey;
  }

  async getAccountSessionKey(accountId: number): Promise<Guid> {
    const account = await this.accountEntity.findByPk(accountId, {
      attributes: ['sessionKey'],
    });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return account.sessionKey;
  }

  async getAccountSessionKeyByUsername(username: string): Promise<Guid> {
    const account = await this.accountEntity.findOne({
      where: {
        username,
      },
      attributes: ['sessionKey'],
    });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return account.sessionKey;
  }

  /**
   * Creates a user session used for access APIs requiring authentication
   * @param {string} username The username of the account the session is being created for
   * @param {string} password The password of the account the session is being created for
   * @param {string} userAgent The user agent of the client creating the session
   * @param {string} [restrictSession] Optional string to restrict the session to a specific app or API.
   * @param {number} [expiresDays] Optional number of days until the session expires.  Defaults to 1 day.
   * @returns {Promise<string>} The JWT session token
   */
  async createSession(
    username: string,
    password: string,
    userAgent: string,
    restrictSession?: string,
    expiresDays?: number,
  ): Promise<string> {
    const account = await this.accountEntity.findOne({
      where: {
        username,
      },
      attributes: ['id', 'passwordHash', 'sessionKey', 'roles'],
    });
    if (!account?.id) {
      throw new NotFoundException(ErrorCodes.INVALID_USERNAME_ERROR);
    }
    if (!bcrypt.compareSync(password, account.passwordHash)) {
      throw new BadRequestException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + (expiresDays || 1));
    const session = await this.sessionEntity.create({
      accountId: account.id,
      createdAt: now,
      expiresAt,
      userAgent,
      restrictSession,
      sessionToken: Guid.create(),
    } as SessionEntity);
    return this.generateSignedToken(account, session, expiresAt);
  }

  async endSession(accountId: number, sessionId: number): Promise<void> {
    const updatedSession = await this.sessionEntity.update(
      { expiresAt: new Date() },
      {
        where: {
          id: sessionId,
          accountId,
        },
      },
    );
    if (!updatedSession[0]) {
      throw new NotFoundException(ErrorCodes.SESSION_NOT_FOUND_ERROR);
    }
  }

  /**
   * Generates a device token by hashing the session information with the account session key and a master
   * key.  This is used as part of session authentication to bind a session to a specific device user agent.
   * @param {Guid} sessionMasterKey The master session key for the system
   * @param {Guid} accountSessionKey The session key of the account
   * @param {string} userAgent The user agent of the client creating the session
   * @returns {string} The generated session token
   */
  // eslint-disable-next-line class-methods-use-this
  private generateDeviceToken(sessionMasterKey: Guid, accountSessionKey: Guid, userAgent: string) {
    return [sessionMasterKey.toString(), accountSessionKey.toString(), userAgent].join('-');
  }

  /**
   * Generates a session token by hashing the session information with the account session key and a master
   * key and the user's current password hash.  This allows sessions to be terminated for a user by changing
   * their password, rotating their session key, or for all users by rotating the master key.
   * @param {Guid} accountSessionKey The session key of the account
   * @param {string} passwordHash The password hash of the account
   * @param {SessionEntity} session The session entity
   * @returns {string} The generated session token
   */
  // eslint-disable-next-line class-methods-use-this
  private generateSessionToken(
    sessionMasterKey: Guid,
    accountSessionKey: Guid,
    passwordHash: string,
    session: SessionEntity,
  ) {
    return [
      sessionMasterKey.toString(),
      accountSessionKey.toString(),
      passwordHash,
      session.sessionToken.toString(),
      session.createdAt.toUTCString(),
    ].join('-');
  }

  async generateDeviceHash(username: string, userAgent: string) {
    const sessionMasterKey = await this.getMasterSessionKey();
    const accountSessionKey = await this.getAccountSessionKeyByUsername(username);
    const token = this.generateDeviceToken(sessionMasterKey, accountSessionKey, userAgent);
    return bcrypt.hashSync(token, 10);
  }

  // eslint-disable-next-line class-methods-use-this
  async generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Hashes a new session token from the session information and account session key and password hash.  This token
   * becomes part of the JWT session information and is used to verify that the session is valid and has not been
   * tampered with.
   * @parma {Guid} sessionMasterKey The master session key for the system
   * @param {Guid} accountSessionKey The session key of the account
   * @param {string} passwordHash The password hash of the account
   * @param {SessionEntity} session The session entity
   * @returns {string} The hashed session token
   */
  generateSessionTokenHash(
    sessionMasterKey: Guid,
    accountSessionKey: Guid,
    passwordHash: string,
    session: SessionEntity,
  ) {
    const token = this.generateSessionToken(sessionMasterKey, accountSessionKey, passwordHash, session);
    return bcrypt.hashSync(token, 10);
  }

  /**
   * Generates a JWT session token from a user session by hashing the session information with the account session key
   * and a master key and signing it with a secret signing key
   * @param {AccountEntity} account The account entity
   * @param {SessionEntity} session The session entity
   * @returns {Promise<string>} The JWT session token
   */
  async generateSignedToken(account: AccountEntity, session: SessionEntity, expires: Date): Promise<string> {
    const sessionMasterKey = await this.getMasterSessionKey();
    return this.jwtService.signAsync({
      accountId: account.id,
      sessionId: session.id,
      roles: account.roles,
      tokenHash: this.generateSessionTokenHash(sessionMasterKey, account.sessionKey, account.passwordHash, session),
      exp: Math.floor(expires.getTime() / 1000),
    });
  }

  async getAccount(id: number): Promise<AccountEntity> {
    const account = await this.accountEntity.findByPk(id);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return account;
  }

  async getSession(id: number): Promise<SessionEntity> {
    const session = await this.sessionEntity.findByPk(id);
    if (!session) {
      throw new NotFoundException(ErrorCodes.SESSION_NOT_FOUND_ERROR);
    }
    return session;
  }

  async verifyDeviceToken(accountId: number, userAgent: string, deviceToken: string): Promise<boolean> {
    const sessionMasterKey = await this.getMasterSessionKey();
    const accountSessionKey = await this.getAccountSessionKey(accountId);
    const token = this.generateDeviceToken(sessionMasterKey, accountSessionKey, userAgent);
    return bcrypt.compareSync(token, deviceToken);
  }

  async verifyPassword(accountId: number, password: string): Promise<boolean> {
    const account = await this.getAccount(accountId);
    return bcrypt.compareSync(password, account.passwordHash);
  }

  /**
   * Verifies a session token by comparing its hashed secret to the original secret string it was from
   * @param {AccountEntity} account The account entity the session belongs to.
   * @param {SessionEntity} session The session entity
   * @param {string} tokenHash The hashed session token to compare against
   * @returns {boolean} Whether the session token is valid
   */
  async verifySessionToken(account: AccountEntity, session: SessionEntity, tokenHash: string): Promise<boolean> {
    const sessionMasterKey = await this.getMasterSessionKey();
    const token = this.generateSessionToken(sessionMasterKey, account.sessionKey, account.passwordHash, session);
    return bcrypt.compareSync(token, tokenHash);
  }
}
