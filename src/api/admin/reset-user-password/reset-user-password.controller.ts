import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminResetUserPasswordBadRequestResponseDto,
  AdminResetUserPasswordBodyDto,
  AdminResetUserPasswordNotFoundResponseDto,
  AdminResetUserPasswordQueryDto,
  AdminResetUserPasswordResponseDto,
} from './reset-user-password.dto';
import { AdminResetUserPasswordService } from './reset-user-password.service';
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
import { Body, Controller, Post, Query, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminResetUserPasswordController {
  constructor(private readonly resetPasswordService: AdminResetUserPasswordService) {}

  @Post('reset-user-password')
  @ApiOperation({
    summary: 'Reset user password',
    description:
      // eslint-disable-next-line max-len
      `Resets the password for a specified user account. This operation is typically used when an administrator needs to reset a user's password for security or account recovery purposes.`,
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
    @Query() query: AdminResetUserPasswordQueryDto,
    @Body() body: AdminResetUserPasswordBodyDto,
  ): Promise<AdminResetUserPasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(query.id, body.newPassword);
    return {
      success: true,
    };
  }
}
