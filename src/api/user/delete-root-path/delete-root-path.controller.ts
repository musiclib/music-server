import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, Scope, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
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
@UseGuards(RoleGuard)
export class UserDeleteRootPathController {
  constructor(private readonly deleteRootPathService: UserDeleteRootPathService) {}

  @Delete('delete-root-path')
  @ApiOperation({
    summary: `Remove a music source from the user's account`,
    description: [
      `Deletes the specified root path and all associated information in the database immediately.`,
      `The songs and folders will no longer be present in your librariy but the files will remain on the file system.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
