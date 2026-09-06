import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListTrackArtistsController {
  constructor(private readonly listArtistsService: UserListTrackArtistsService) {}

  @Get('list-track-artists')
  @ApiOperation({
    summary: 'List artists',
    description: `Retrieves a list of artists for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of artists for the user.',
    type: UserListTrackArtistsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
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
