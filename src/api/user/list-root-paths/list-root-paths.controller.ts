import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserListRootPathsResponseDto } from './list-root-paths.dto';
import { UserListRootPathsService } from './list-root-paths.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
  scope: Scope.REQUEST,
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListRootPathsController {
  constructor(private readonly listRootPathsService: UserListRootPathsService) {}

  @Get('list-root-paths')
  @ApiOperation({
    summary: `List all sources of music for the user's account`,
    description: [
      `Retrieves a list of all root paths associated with the user's account, eg \`/home/<username>/music\`.',
      'These paths are indexed periodically or when files are changed to build the music library.`,
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: UserListRootPathsResponseDto,
  })
  async get(@User() user: AccountEntity): Promise<UserListRootPathsResponseDto> {
    const rootPaths = await this.listRootPathsService.listRootPaths(user.id);
    return {
      rootPaths,
      success: true,
    };
  }
}
