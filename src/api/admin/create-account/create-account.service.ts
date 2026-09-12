import * as bcrypt from 'bcryptjs';
import { AccountEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleEnum } from 'src/types/enums';

@Injectable()
export class AdminCreateAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async post(
    adminAccountId: number,
    adminPassword: string,
    username: string,
    password: string,
    roles: UserRoleEnum[],
  ): Promise<void> {
    // verify own password
    const adminAccount = await this.accountEntity.findByPk(adminAccountId);
    if (!adminAccount) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    const isAdminPasswordValid = await bcrypt.compare(adminPassword, adminAccount.passwordHash);
    if (!isAdminPasswordValid) {
      throw new NotFoundException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    // verify roles are provided
    if (!roles.length) {
      throw new BadRequestException(ErrorCodes.INVALID_USER_ROLE_ERROR);
    }
    // verify username is unique
    const exists = await this.accountEntity.findOne({
      attributes: ['id'],
      where: {
        username,
      },
    });
    if (exists?.id) {
      throw new BadRequestException(ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR);
    }
    // create account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await this.accountEntity.create({
      username,
      passwordHash,
      roles,
      sessionKey: Guid.create(),
    } as AccountEntity);
  }
}
