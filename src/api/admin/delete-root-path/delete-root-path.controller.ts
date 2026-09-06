import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminDeleteRootPathNotFoundResponseDto,
  AdminDeleteRootPathQueryDto,
  AdminDeleteRootPathResponseDto,
} from './delete-root-path.dto';
import { AdminDeleteRootPathService } from './delete-root-path.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminDeleteRootPathController {
  constructor(private readonly deleteRootPathService: AdminDeleteRootPathService) {}

  @Delete('delete-root-path')
  @ApiOperation({
    summary: 'Delete a root path',
    description:
      // eslint-disable-next-line max-len
      'Deletes the specified root path.  This will delete all associated information in the database immediately, the songs and folders will no longer be present in their data.  This will not affect any files on the file system.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Root path deleted successfully',
    type: AdminDeleteRootPathResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Root path not found',
    type: AdminDeleteRootPathNotFoundResponseDto,
  })
  async delete(@Query() query: AdminDeleteRootPathQueryDto): Promise<AdminDeleteRootPathResponseDto> {
    await this.deleteRootPathService.delete(query.id);
    return {
      success: true,
    };
  }
}
