import { AccountEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoleEnum } from 'src/types/enums';
import bcrypt from 'bcryptjs';

@Injectable()
export class AdminUpdateUserRolesService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async updateUserRoles(
    adminAccountId: number,
    adminPassword: string,
    updateAccountId: number,
    roles: UserRoleEnum[],
  ): Promise<void> {
    // verify own password
    const adminAccount = await this.accountEntity.findByPk(adminAccountId);
    if (!adminAccount) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    const isAdminPasswordValid = await bcrypt.compare(adminPassword, adminAccount.passwordHash);
    if (!isAdminPasswordValid) {
      throw new BadRequestException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    // verify roles are provided
    if (roles.length === 0) {
      throw new BadRequestException(ErrorCodes.INVALID_USER_ROLE_ERROR);
    }
    // verify user account exists
    const account = await this.accountEntity.findByPk(updateAccountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    // verify there will still be an administrator after this change
    if (adminAccountId === updateAccountId && !roles.includes(UserRoleEnum.ADMIN)) {
      const userList = await this.accountEntity.findAll();
      const adminCount = userList.filter((user) => user.roles.indexOf(UserRoleEnum.ADMIN) !== -1).length;
      if (adminCount <= 1) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    // update the account
    await this.accountEntity.update({ roles }, { where: { id: updateAccountId } });
  }
}
