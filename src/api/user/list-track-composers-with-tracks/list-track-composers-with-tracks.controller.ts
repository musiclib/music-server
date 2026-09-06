import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListTrackComposersWithTracksController {
  constructor(private readonly listComposersWithTracksService: UserListTrackComposersWithTracksService) {}

  @Get('list-track-composers-with-tracks')
  @ApiOperation({
    summary: 'List composers',
    description: `Retrieves a list of composers for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of composers for the user.',
    type: UserListTrackComposersWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
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
