import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import {
  AdminDeleteRootPathNotFoundResponseDto,
  AdminDeleteRootPathQueryDto,
  AdminDeleteRootPathResponseDto,
} from './delete-root-path.dto';
import { AdminDeleteRootPathService } from './delete-root-path.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, Scope, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminDeleteRootPathController {
  constructor(private readonly deleteRootPathService: AdminDeleteRootPathService) {}

  @Delete('delete-root-path')
  @ApiOperation({
    summary: 'Delete a root path',
    description: [
      'Deletes the specified root path for a user and immediately deletes all associated information in the database.',
      `This will not affect any files on the file system but they will no longer be present in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
