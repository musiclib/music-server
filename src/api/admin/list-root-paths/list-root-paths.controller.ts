import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AdminListRootPathsResponseDto } from './list-root-paths.dto';
import { AdminListRootPathsService } from './list-root-paths.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminListRootPathsController {
  constructor(private readonly listRootPathsService: AdminListRootPathsService) {}

  @Get('list-root-paths')
  @ApiOperation({
    summary: `List all sources of music for all users`,
    description: [
      `Retrieves a list of all root paths for all user accounts, eg \`/home/<username>/music\`.',
      'These paths are indexed periodically or when files are changed to build the music library.`,
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: AdminListRootPathsResponseDto,
  })
  async get(): Promise<AdminListRootPathsResponseDto> {
    const rootPaths = await this.listRootPathsService.listRootPaths();
    return {
      rootPaths,
      success: true,
    };
  }
}
