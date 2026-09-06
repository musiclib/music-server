import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumsWithTracksBadRequestResponseDto,
  UserListAlbumsWithTracksQueryDto,
  UserListAlbumsWithTracksResponseDto,
} from './list-albums-with-tracks.dto';
import { UserListAlbumsWithTracksService } from './list-albums-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListAlbumsWithTracksController {
  constructor(private readonly listAlbumsWithTracksService: UserListAlbumsWithTracksService) {}

  @Get('list-albums-with-tracks')
  @ApiOperation({
    summary: 'List albums with tracks',
    description: `Retrieves a list of albums with their tracks for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of albums with their tracks for the user.',
    type: UserListAlbumsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListAlbumsWithTracksBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumsWithTracksQueryDto,
  ): Promise<UserListAlbumsWithTracksResponseDto> {
    const data = await this.listAlbumsWithTracksService.listAlbumsWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
