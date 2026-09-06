import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserListRootPathsResponseDto } from './list-root-paths.dto';
import { UserListRootPathsService } from './list-root-paths.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
  scope: Scope.REQUEST,
})
@ApiTags(USER_APIS)
export class UserListRootPathsController {
  constructor(private readonly listRootPathsService: UserListRootPathsService) {}

  @Get('list-root-paths')
  @ApiOperation({
    summary: 'List all root paths',
    description: 'Retrieves a list of all root paths in the system.',
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
