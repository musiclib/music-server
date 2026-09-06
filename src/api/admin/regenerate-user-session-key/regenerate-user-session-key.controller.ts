import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminRegenerateUserSessionKeyNotFoundResponseDto,
  AdminRegenerateUserSessionKeyQueryDto,
  AdminRegenerateUserSessionKeyResponseDto,
} from './regenerate-user-session-key.dto';
import { AdminRegenerateUserSessionKeyService } from './regenerate-user-session-key.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Query } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminRegenerateUserSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: AdminRegenerateUserSessionKeyService) {}

  @Post('regenerate-user-session-key')
  @ApiOperation({
    summary: `Invalidate a user's sessions`,
    description:
      // eslint-disable-next-line max-len
      'Regenerates the session key for a specified user account. This operation is typically used when a user needs to reset their session key for security reasons.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminRegenerateUserSessionKeyResponseDto,
    description: 'Session key regenerated successfully',
  })
  @ApiNotFoundResponse({
    type: AdminRegenerateUserSessionKeyNotFoundResponseDto,
    description: 'Account not found',
  })
  async post(@Query() query: AdminRegenerateUserSessionKeyQueryDto): Promise<AdminRegenerateUserSessionKeyResponseDto> {
    await this.regenerateSessionKeyService.regenerateSessionKey(query.id);
    return {
      success: true,
    };
  }
}
