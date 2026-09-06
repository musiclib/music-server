import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumsBadRequestResponseDto,
  UserListAlbumsQueryDto,
  UserListAlbumsResponseDto,
} from './list-albums.dto';
import { UserListAlbumsService } from './list-albums.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListAlbumsController {
  constructor(private readonly listAlbumsService: UserListAlbumsService) {}

  @Get('list-albums')
  @ApiOperation({
    summary: 'List albums',
    description: `Retrieves a list of albums for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of albums for the user.',
    type: UserListAlbumsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListAlbumsBadRequestResponseDto,
  })
  async get(@User() user: AccountEntity, @Query() query: UserListAlbumsQueryDto): Promise<UserListAlbumsResponseDto> {
    const data = await this.listAlbumsService.listAlbums(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
