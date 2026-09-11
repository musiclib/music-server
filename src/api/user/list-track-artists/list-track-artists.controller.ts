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
  TRACK_INFORMATION_EXCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListTrackArtistsBadRequestResponseDto,
  UserListTrackArtistsQueryDto,
  UserListTrackArtistsResponseDto,
} from './list-track-artists.dto';
import { UserListTrackArtistsService } from './list-track-artists.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackArtistsController {
  constructor(private readonly listArtistsService: UserListTrackArtistsService) {}

  @Get('list-track-artists')
  @ApiOperation({
    summary: 'List artists credited to tracks',
    description: [
      `Track artists are attributed directly to the tracks, there can be many credited to a single track.`,
      FILTERED_DATA_DESCRIPTION,
      TRACK_INFORMATION_EXCLUDED,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListTrackArtistsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackArtistsBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackArtistsQueryDto,
  ): Promise<UserListTrackArtistsResponseDto> {
    const data = await this.listArtistsService.listArtists(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
