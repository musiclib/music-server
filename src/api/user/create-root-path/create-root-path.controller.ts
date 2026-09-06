import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserCreateRootPathController {
  constructor(private readonly createRootPathService: UserCreateRootPathService) {}

  @Post('create-root-path')
  @ApiOperation({
    summary: 'Create a new root path',
    description: 'Creates a new root path for the specified account.',
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
