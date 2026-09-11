import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserCreateRootPathBadRequestResponseDto,
  UserCreateRootPathBodyDto,
  UserCreateRootPathResponseDto,
} from './create-root-path.dto';
import { UserCreateRootPathService } from './create-root-path.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserCreateRootPathController {
  constructor(private readonly createRootPathService: UserCreateRootPathService) {}

  @Post('create-root-path')
  @ApiOperation({
    summary: `Add a new source of music to the user's account`,
    description: [
      `Creates a new root path for the specified account, a folder containing music eg \`/home/<username>/music\`.`,
      `Users can have multiple root paths however indexing uses a single queue so the more paths the longer it takes.`,
      `Ensure that the specified path is accessible and has read access.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiCreatedResponse({
    description: 'Root path created successfully',
    type: UserCreateRootPathResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    type: UserCreateRootPathBadRequestResponseDto,
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: UserCreateRootPathBodyDto,
  ): Promise<UserCreateRootPathResponseDto> {
    await this.createRootPathService.createRootPath(user.id, body.rootPath);
    return {
      success: true,
    };
  }
}
