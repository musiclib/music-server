import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import {
  AdminRegenerateUserSessionKeyNotFoundResponseDto,
  AdminRegenerateUserSessionKeyQueryDto,
  AdminRegenerateUserSessionKeyResponseDto,
} from './regenerate-user-session-key.dto';
import { AdminRegenerateUserSessionKeyService } from './regenerate-user-session-key.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminRegenerateUserSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: AdminRegenerateUserSessionKeyService) {}

  @Post('regenerate-user-session-key')
  @ApiOperation({
    summary: `Invalidate a user's sessions`,
    description: [
      'Regenerates the master session key for a specific user, invalidating all sessions for that user.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
