import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminResetUserPasswordBadRequestResponseDto,
  AdminResetUserPasswordBodyDto,
  AdminResetUserPasswordNotFoundResponseDto,
  AdminResetUserPasswordQueryDto,
  AdminResetUserPasswordResponseDto,
} from './reset-user-password.dto';
import { AdminResetUserPasswordService } from './reset-user-password.service';
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
import { Body, Controller, Post, Query, Scope, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminResetUserPasswordController {
  constructor(private readonly resetPasswordService: AdminResetUserPasswordService) {}

  @Post('reset-user-password')
  @ApiOperation({
    summary: 'Reset user password',
    description: [
      `Resets the password for a specified user account and invalidates their prior sessions.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: AdminResetUserPasswordResponseDto,
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    type: AdminResetUserPasswordBadRequestResponseDto,
    description: 'Invalid request data or additional requirements not met',
  })
  @ApiNotFoundResponse({
    type: AdminResetUserPasswordNotFoundResponseDto,
    description: 'Account not found',
  })
  async post(
    @User() user: AccountEntity,
    @Query() query: AdminResetUserPasswordQueryDto,
    @Body() body: AdminResetUserPasswordBodyDto,
  ): Promise<AdminResetUserPasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(user.id, body.adminPassword, query.id, body.newPassword);
    return {
      success: true,
    };
  }
}
