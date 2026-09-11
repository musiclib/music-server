import { AccountEntity } from 'src/database/entities';
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
  UserListTrackComposersWithTracksBadRequestResponseDto,
  UserListTrackComposersWithTracksQueryDto,
  UserListTrackComposersWithTracksResponseDto,
} from './list-track-composers-with-tracks.dto';
import { UserListTrackComposersWithTracksService } from './list-track-composers-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackComposersWithTracksController {
  constructor(private readonly listComposersWithTracksService: UserListTrackComposersWithTracksService) {}

  @Get('list-track-composers-with-tracks')
  @ApiOperation({
    summary: 'List composers credited to tracks and return album/track data',
    description: [
      `Track composers are attributed directly to the tracks, there can be many credited to a single track.`,
      'There are a variety of filtering options available for querying track composers.',
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
    type: UserListTrackComposersWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackComposersWithTracksBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackComposersWithTracksQueryDto,
  ): Promise<UserListTrackComposersWithTracksResponseDto> {
    const data = await this.listComposersWithTracksService.listComposersWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
