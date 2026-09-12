import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleEnum } from 'src/types/enums';

@Injectable()
export class AdminDeleteAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async deleteAccount(adminAccountId: number, adminPassword: string, deleteAccountId: number): Promise<void> {
    // verify own password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new BadRequestException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    // Prevent an admin from deleting their own account if there is no other
    // administrator
    if (adminAccountId === deleteAccountId) {
      const userList = await this.accountEntity.findAll();
      const adminCount = userList.filter((user) => user.roles.indexOf(UserRoleEnum.ADMIN) !== -1).length;
      if (adminCount <= 1) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }

    const account = await this.accountEntity.findByPk(deleteAccountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await account.destroy();
  }
}
