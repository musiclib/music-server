import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AdminRegenerateMasterSessionKeyResponseDto } from './regenerate-master-session-key.dto';
import { AdminRegenerateMasterSessionKeyService } from './regenerate-master-session-key.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Scope, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminRegenerateMasterSessionKeyController {
  constructor(private readonly regenerateMasterSessionKeyService: AdminRegenerateMasterSessionKeyService) {}

  @Post('regenerate-master-session-key')
  @ApiOperation({
    summary: 'Invalidate all user sessions',
    description: [
      'Regenerates the master session key for the entire platform, invalidating all sessions for all users.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
