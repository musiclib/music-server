import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AdminListAccountsResponseDto } from './list-accounts.dto';
import { AdminListAccountsService } from './list-accounts.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminListAccountsController {
  constructor(private readonly listAccountsService: AdminListAccountsService) {}

  @Get('list-accounts')
  @ApiOperation({
    summary: 'List all accounts',
    description: 'Retrieves a list of all accounts in the system.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Accounts listed successfully',
    type: AdminListAccountsResponseDto,
  })
  async get(): Promise<AdminListAccountsResponseDto> {
    const accounts = await this.listAccountsService.listAccounts();
    return { accounts, success: true };
  }
}
