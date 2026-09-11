import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
  PAGINATED_DATA_DESCRIPTION,
  TRACK_INFORMATION_INCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
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
@UseGuards(RoleGuard)
export class UserListTrackGenresWithTracksController {
  constructor(private readonly listTrackGenresWithTracksService: UserListTrackGenresWithTracksService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('list-track-genres-with-tracks')
  @ApiOperation({
    summary: 'List genres associated with tracks and return album/track data',
    description: [
      `Track genres are attributed directly to the tracks, there can be many credited to a single track.`,
      TRACK_INFORMATION_INCLUDED,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListTrackGenresWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
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
