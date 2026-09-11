import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  FILTERED_DATA_DESCRIPTION,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
  PAGINATED_DATA_DESCRIPTION,
  TRACK_INFORMATION_INCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListTrackArtistsWithTracksBadRequestResponseDto,
  UserListTrackArtistsWithTracksQueryDto,
  UserListTrackArtistsWithTracksResponseDto,
} from './list-track-artists-with-tracks.dto';
import { UserListTrackArtistsWithTracksService } from './list-track-artists-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackArtistsWithTracksController {
  constructor(private readonly listArtistsWithTracksService: UserListTrackArtistsWithTracksService) {}

  @Get('list-track-artists-with-tracks')
  @ApiOperation({
    summary: 'List artists credited to tracks and return album/track data',
    description: [
      `Track artists are attributed directly to the tracks, there can be many credited to a single track.`,
      FILTERED_DATA_DESCRIPTION,
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
    type: UserListTrackArtistsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackArtistsWithTracksBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackArtistsWithTracksQueryDto,
  ): Promise<UserListTrackArtistsWithTracksResponseDto> {
    const data = await this.listArtistsWithTracksService.listArtists(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
