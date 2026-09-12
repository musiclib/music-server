import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminResetUserPasswordService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async resetUserPassword(
    adminAccountId: number,
    adminPassword: string,
    userAccountId: number,
    userPassword: string,
  ): Promise<void> {
    // verify own password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new NotFoundException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    // apply new password
    const userAccount = await this.accountEntity.findByPk(userAccountId);
    if (!userAccount) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    const passwordHash = await this.authenticationService.generatePasswordHash(userPassword);
    await this.accountEntity.update({ passwordHash }, { where: { id: userAccountId } });
  }
}
