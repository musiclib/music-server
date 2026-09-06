import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, Scope } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserDeleteRootPathNotFoundResponseDto,
  UserDeleteRootPathQueryDto,
  UserDeleteRootPathResponseDto,
} from './delete-root-path.dto';
import { UserDeleteRootPathService } from './delete-root-path.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
  scope: Scope.REQUEST,
})
@ApiTags(USER_APIS)
export class UserDeleteRootPathController {
  constructor(private readonly deleteRootPathService: UserDeleteRootPathService) {}

  @Delete('delete-root-path')
  @ApiOperation({
    summary: 'Delete a root path',
    description:
      // eslint-disable-next-line max-len
      'Deletes the specified root path.  This will delete all associated information in the database immediately, the songs and folders will no longer be present in their data.  This will not affect any files on the file system.',
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Root path deleted successfully',
    type: UserDeleteRootPathResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Root path not found',
    type: UserDeleteRootPathNotFoundResponseDto,
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: UserDeleteRootPathQueryDto,
  ): Promise<UserDeleteRootPathResponseDto> {
    await this.deleteRootPathService.delete(user.id, query.id);
    return {
      success: true,
    };
  }
}
