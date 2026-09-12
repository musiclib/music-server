import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminDeleteAccountBadRequestResponseDto,
  AdminDeleteAccountBodyDto,
  AdminDeleteAccountNotFoundResponseDto,
  AdminDeleteAccountQueryDto,
  AdminDeleteAccountResponseDto,
} from './delete-account.dto';
import { AdminDeleteAccountService } from './delete-account.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Patch, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminDeleteAccountController {
  constructor(private readonly deleteAccountService: AdminDeleteAccountService) {}

  @Patch('delete-account')
  @ApiOperation({
    summary: 'Delete an account',
    description: [
      'Deletes the specified account.  If it is the only admin account a new one account must be created first.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
    @Body() body: AdminDeleteAccountBodyDto,
  ): Promise<AdminDeleteAccountResponseDto> {
    await this.deleteAccountService.deleteAccount(user.id, body.adminPassword, query.id);
    return {
      success: true,
    };
  }
}
