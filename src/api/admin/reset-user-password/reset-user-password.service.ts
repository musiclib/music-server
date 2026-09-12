import { AccountEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class AdminResetUserPasswordService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async resetUserPassword(
    adminAccountId: number,
    adminPassword: string,
    userAccountId: number,
    userPassword: string,
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
    // apply new password
    const userAccount = await this.accountEntity.findByPk(userAccountId);
    if (!userAccount) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userPassword, salt);
    await this.accountEntity.update({ passwordHash }, { where: { id: userAccountId } });
  }
}
