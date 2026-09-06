import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListTracksBadRequestResponseDto,
  UserListTracksQueryDto,
  UserListTracksResponseDto,
} from './list-tracks.dto';
import { UserListTracksService } from './list-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListTracksController {
  constructor(private readonly listTracksService: UserListTracksService) {}

  @Get('list-tracks')
  @ApiOperation({
    summary: 'List tracks',
    description: `Retrieves a list of tracks for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of tracks for the user.',
    type: UserListTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListTracksBadRequestResponseDto,
  })
  async get(@User() user: AccountEntity, @Query() query: UserListTracksQueryDto) {
    const data = await this.listTracksService.listTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
