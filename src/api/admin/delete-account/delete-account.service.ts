import { AccountEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleEnum } from 'src/types/enums';

@Injectable()
export class AdminDeleteAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async deleteAccount(accountId: number, deleteAccountId: number): Promise<void> {
    // Prevent an admin from deleting their own account if there is no other
    // administrator
    if (accountId === deleteAccountId) {
      const userList = await this.accountEntity.findAll();
      const adminCount = userList.filter((user) => user.roles.indexOf(UserRoleEnum.ADMIN) !== -1).length;
      if (adminCount <= 1) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }

    const account = await this.accountEntity.findByPk(deleteAccountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR, `Account with ID ${deleteAccountId} not found.`);
    }
    await account.destroy();
  }
}
