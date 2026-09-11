import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AdminListAccountsResponseDto } from './list-accounts.dto';
import { AdminListAccountsService } from './list-accounts.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminListAccountsController {
  constructor(private readonly listAccountsService: AdminListAccountsService) {}

  @Get('list-accounts')
  @ApiOperation({
    summary: 'List all accounts',
    description: [
      'Retrieves a list of all accounts in the system.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Accounts listed successfully',
    type: AdminListAccountsResponseDto,
  })
  async get(): Promise<AdminListAccountsResponseDto> {
    const accounts = await this.listAccountsService.listAccounts();
    return { accounts, success: true };
  }
}
