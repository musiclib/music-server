import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminUpdateRootPathBadRequestResponseDto,
  AdminUpdateRootPathBodyDto,
  AdminUpdateRootPathNotFoundResponseDto,
  AdminUpdateRootPathQueryDto,
  AdminUpdateRootPathResponseDto,
} from './update-root-path.dto';
import { AdminUpdateRootPathService } from './update-root-path.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Patch, Query, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminUpdateRootPathController {
  constructor(private readonly updateRootPathService: AdminUpdateRootPathService) {}

  @Patch('update-root-path')
  @ApiOperation({
    summary: 'Update a root path',
    description:
      // eslint-disable-next-line max-len
      'Updates the specified root path with a new path. If the scanner is running then all previous data will be removed and recreated when it indexes the new path.  If the scanner is paued you may move the files to the new path and then resume the scanner to continue indexing.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminUpdateRootPathResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Root path not found',
    type: AdminUpdateRootPathNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid root path, either malformed or nonexistent',
    type: AdminUpdateRootPathBadRequestResponseDto,
  })
  async patch(
    @Query() query: AdminUpdateRootPathQueryDto,
    @Body() body: AdminUpdateRootPathBodyDto,
  ): Promise<AdminUpdateRootPathResponseDto> {
    await this.updateRootPathService.updateRootPath(query.id, body.newPath);
    return {
      success: true,
    };
  }
}
