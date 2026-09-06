import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumArtistsWithTracksBadRequestResponseDto,
  UserListAlbumArtistsWithTracksQueryDto,
  UserListAlbumArtistsWithTracksResponseDto,
} from './list-album-artists-with-tracks.dto';
import { UserListAlbumArtistsWithTracksService } from './list-album-artists-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListAlbumArtistsWithTracksController {
  constructor(private readonly listAlbumArtistsWithTracksService: UserListAlbumArtistsWithTracksService) {}

  @Get('list-album-artists-with-tracks')
  @ApiOperation({
    summary: 'List album artists with tracks',
    description: [
      'Retrieves a list of album artists for the user with their tracks for the user',
      'based on the provided query parameters.',
    ].join(' '),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of album artists with tracks for the user.',
    type: UserListAlbumArtistsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListAlbumArtistsWithTracksBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumArtistsWithTracksQueryDto,
  ): Promise<UserListAlbumArtistsWithTracksResponseDto> {
    const data = await this.listAlbumArtistsWithTracksService.listArtistsWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
