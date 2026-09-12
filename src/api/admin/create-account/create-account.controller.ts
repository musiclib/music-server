import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminCreateAccountBadRequestResponseDto,
  AdminCreateAccountBodyDto,
  AdminCreateAccountResponseDto,
} from './create-account.dto';
import { AdminCreateAccountService } from './create-account.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Scope, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminCreateAccountController {
  constructor(private readonly createAccountService: AdminCreateAccountService) {}

  @Post('create-account')
  @ApiOperation({
    summary: 'Create a new account',
    description: [
      'Add a user account with the specified roles.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiCreatedResponse({
    type: AdminCreateAccountResponseDto,
  })
  @ApiBadRequestResponse({
    type: AdminCreateAccountBadRequestResponseDto,
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: AdminCreateAccountBodyDto,
  ): Promise<AdminCreateAccountResponseDto> {
    await this.createAccountService.post(user.id, body.adminPassword, body.username, body.password, body.roles);
    return {
      success: true,
    };
  }
}
