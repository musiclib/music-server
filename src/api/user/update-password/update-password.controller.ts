import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Scope } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserUpdatePasswordBadRequestResponseDto,
  UserUpdatePasswordBodyDto,
  UserUpdatePasswordResponseDto,
} from './update-password.dto';
import { UserUpdatePasswordService } from './update-password.service';

@Controller({
  path: '/api/user',
  scope: Scope.REQUEST,
})
@ApiTags(USER_APIS)
export class UserUpdatePasswordController {
  constructor(private readonly resetPasswordService: UserUpdatePasswordService) {}

  @Post('update-password')
  @ApiOperation({
    summary: 'Reset password',
    description: `Resets the user's password to a new value.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: UserUpdatePasswordResponseDto,
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    type: UserUpdatePasswordBadRequestResponseDto,
    description: 'Invalid request data or additional requirements not met',
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: UserUpdatePasswordBodyDto,
  ): Promise<UserUpdatePasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(user.id, body.newPassword);
    return {
      success: true,
    };
  }
}
