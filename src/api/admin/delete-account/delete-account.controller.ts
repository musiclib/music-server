import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminDeleteAccountBadRequestResponseDto,
  AdminDeleteAccountNotFoundResponseDto,
  AdminDeleteAccountQueryDto,
  AdminDeleteAccountResponseDto,
} from './delete-account.dto';
import { AdminDeleteAccountService } from './delete-account.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Delete, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminDeleteAccountController {
  constructor(private readonly deleteAccountService: AdminDeleteAccountService) {}

  @Delete('delete-account')
  @ApiOperation({
    summary: 'Delete an account',
    // eslint-disable-next-line max-len
    description:
      'Deletes the specified account.  If it is the only admin account a new one account must be created first.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminDeleteAccountResponseDto,
    description: 'Account deleted successfully',
  })
  @ApiNotFoundResponse({
    type: AdminDeleteAccountNotFoundResponseDto,
    description: 'Account not found',
  })
  @ApiBadRequestResponse({
    type: AdminDeleteAccountBadRequestResponseDto,
    description: 'Invalid account ID or account does not exist',
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: AdminDeleteAccountQueryDto,
  ): Promise<AdminDeleteAccountResponseDto> {
    await this.deleteAccountService.deleteAccount(user.id, query.id);
    return {
      success: true,
    };
  }
}
