import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AdminListRootPathsResponseDto } from './list-root-paths.dto';
import { AdminListRootPathsService } from './list-root-paths.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminListRootPathsController {
  constructor(private readonly listRootPathsService: AdminListRootPathsService) {}

  @Get('list-root-paths')
  @ApiOperation({
    summary: 'List all root paths',
    description: 'Retrieves a list of all root paths in the system.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
