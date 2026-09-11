import { AccountEntity } from 'src/database/entities/account.entity';
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
  UserListTrackComposersBadRequestResponseDto,
  UserListTrackComposersQueryDto,
  UserListTrackComposersResponseDto,
} from './list-track-composers.dto';
import { UserListTrackComposersService } from './list-track-composers.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackComposersController {
  constructor(private readonly listComposersService: UserListTrackComposersService) {}

  @Get('list-track-composers')
  @ApiOperation({
    summary: 'List composers credited to tracks',
    description: [
      `Track composers are attributed directly to the tracks, there can be many credited to a single track.`,
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
    type: UserListTrackComposersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackComposersBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackComposersQueryDto,
  ): Promise<UserListTrackComposersResponseDto> {
    const data = await this.listComposersService.listComposers(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
