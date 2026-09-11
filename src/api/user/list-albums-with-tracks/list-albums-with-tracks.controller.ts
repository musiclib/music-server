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
@UseGuards(RoleGuard)
export class UserListAlbumsWithTracksController {
  constructor(private readonly listAlbumsWithTracksService: UserListAlbumsWithTracksService) {}

  @Get('list-albums-with-tracks')
  @ApiOperation({
    summary: 'List albums and include their track data',
    description: [
      `Albums can be filtered by an extensive set of criteria and search terms.`,
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
    type: UserListAlbumsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
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
