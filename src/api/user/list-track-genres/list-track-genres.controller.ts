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
  UserListTrackGenresBadRequestResponseDto,
  UserListTrackGenresQueryDto,
  UserListTrackGenresResponseDto,
} from './list-track-genres.dto';
import { UserListTrackGenresService } from './list-track-genres.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackGenresController {
  constructor(private readonly listTrackGenresService: UserListTrackGenresService) {}

  @Get('list-track-genres')
  @ApiOperation({
    summary: 'List genres associated with tracks',
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
    type: UserListTrackGenresResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackGenresBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackGenresQueryDto,
  ): Promise<UserListTrackGenresResponseDto> {
    const data = await this.listTrackGenresService.listGenres(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
