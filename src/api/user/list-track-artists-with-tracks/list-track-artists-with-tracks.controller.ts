import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListTrackArtistsWithTracksController {
  constructor(private readonly listArtistsWithTracksService: UserListTrackArtistsWithTracksService) {}

  @Get('list-track-artists-with-tracks')
  @ApiOperation({
    summary: 'List artists with tracks',
    description: `Retrieves a list of artists along with their tracks for the user based on the 
    provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of artists along with their tracks for the user.',
    type: UserListTrackArtistsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
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
