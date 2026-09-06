import { AccountEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleEnum } from 'src/types/enums';

@Injectable()
export class AdminUpdateUserRolesService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async updateUserRoles(accountId: number, updateAccountId: number, roles: UserRoleEnum[]): Promise<void> {
    if (roles.length === 0) {
      throw new BadRequestException(ErrorCodes.INVALID_USER_ROLE_ERROR);
    }
    const account = await this.accountEntity.findByPk(updateAccountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR, `Account with ID ${updateAccountId} not found`);
    }
    // Prevent an administrator from removing their own admin role if there is no other administrator
    if (accountId === updateAccountId && !roles.includes(UserRoleEnum.ADMIN)) {
      const userList = await this.accountEntity.findAll();
      const adminCount = userList.filter((user) => user.roles.indexOf(UserRoleEnum.ADMIN) !== -1).length;
      if (adminCount <= 1) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    await this.accountEntity.update({ roles }, { where: { id: updateAccountId } });
  }
}
