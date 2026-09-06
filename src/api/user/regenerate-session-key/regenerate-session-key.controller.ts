import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRegenerateSessionKeyResponseDto } from './regenerate-session-key.dto';
import { UserRegenerateSessionKeyService } from './regenerate-session-key.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserRegenerateSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: UserRegenerateSessionKeyService) {}

  @Post('regenerate-session-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: `Invalidate a user's sessions`,
    description:
      // eslint-disable-next-line max-len
      'Regenerates the session key for the user invalidating all existing sessions for their account.',
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
