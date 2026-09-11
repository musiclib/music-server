import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminUpdateUserRolesBadRequestResponseDto,
  AdminUpdateUserRolesBodyDto,
  AdminUpdateUserRolesNotFoundResponseDto,
  AdminUpdateUserRolesQueryDto,
  AdminUpdateUserRolesResponseDto,
} from './update-user-roles.dto';
import { AdminUpdateUserRolesService } from './update-user-roles.service';
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
export class AdminUpdateUserRolesController {
  constructor(private readonly updateRolesService: AdminUpdateUserRolesService) {}

  @Patch('update-user-roles')
  @ApiOperation({
    summary: 'Update user roles',
    description: [
      'Updates the roles of a specified user account',
      'There must always be at least one administrator account so you cannot remove the only `admin` role.',
      'To remove the only admin role, create a new administrator account first.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: AdminUpdateUserRolesResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    type: AdminUpdateUserRolesNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user role or account only admin error',
    type: AdminUpdateUserRolesBadRequestResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: AdminUpdateUserRolesQueryDto,
    @Body() body: AdminUpdateUserRolesBodyDto,
  ): Promise<AdminUpdateUserRolesResponseDto> {
    await this.updateRolesService.updateUserRoles(user.id, query.id, body.roles);
    return {
      success: true,
    };
  }
}
