import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRegenerateSessionKeyResponseDto } from './regenerate-session-key.dto';
import { UserRegenerateSessionKeyService } from './regenerate-session-key.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserRegenerateSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: UserRegenerateSessionKeyService) {}

  @Post('regenerate-session-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: `Invalidate a user's sessions`,
    description: [
      'Regenerates the session key for the user.  This key is used to sign their session tokens.',
      'When a new key is generated any previous sessions of the user become invalid including their current session.',
      'The user will need to authenticate again to continue accessing protected APIs.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: UserRegenerateSessionKeyResponseDto,
    description: 'Session key regenerated successfully',
  })
  async post(@User() user: AccountEntity): Promise<UserRegenerateSessionKeyResponseDto> {
    await this.regenerateSessionKeyService.regenerateSessionKey(user.id);
    return {
      success: true,
    };
  }
}
