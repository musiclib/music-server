import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AdminRegenerateMasterSessionKeyResponseDto } from './regenerate-master-session-key.dto';
import { AdminRegenerateMasterSessionKeyService } from './regenerate-master-session-key.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Scope } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminRegenerateMasterSessionKeyController {
  constructor(private readonly regenerateMasterSessionKeyService: AdminRegenerateMasterSessionKeyService) {}

  @Post('regenerate-master-session-key')
  @ApiOperation({
    summary: 'Invalidate all user sessions',
    description:
      // eslint-disable-next-line max-len
      'Regenerates the master session key for the platform.  This will invalidate all existing sessions and require users to log in again.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiCreatedResponse({
    type: AdminRegenerateMasterSessionKeyResponseDto,
    description: 'Master session key regenerated successfully',
  })
  async post(@User() user: AccountEntity): Promise<AdminRegenerateMasterSessionKeyResponseDto> {
    await this.regenerateMasterSessionKeyService.regenerate(user.id);
    return {
      success: true,
    };
  }
}
