import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListTrackGenresController {
  constructor(private readonly listTrackGenresService: UserListTrackGenresService) {}

  @Get('list-track-genres')
  @ApiOperation({
    summary: 'List genres',
    description: `Retrieves a list of genres for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of genres for the user.',
    type: UserListTrackGenresResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
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
