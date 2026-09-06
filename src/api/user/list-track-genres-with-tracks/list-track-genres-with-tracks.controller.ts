import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListTrackGenresWithTracksBadRequestResponseDto,
  UserListTrackGenresWithTracksQueryDto,
  UserListTrackGenresWithTracksResponseDto,
} from './list-track-genres-with-tracks.dto';
import { UserListTrackGenresWithTracksService } from './list-track-genres-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListTrackGenresWithTracksController {
  constructor(private readonly listTrackGenresWithTracksService: UserListTrackGenresWithTracksService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('list-track-genres-with-tracks')
  @ApiOperation({
    summary: 'List genres',
    description: `Retrieves a list of genres for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of genres for the user.',
    type: UserListTrackGenresWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListTrackGenresWithTracksBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackGenresWithTracksQueryDto,
  ): Promise<UserListTrackGenresWithTracksResponseDto> {
    const data = await this.listTrackGenresWithTracksService.listGenresWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
