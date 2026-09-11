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
  USER_APIS,
} from 'src/constants/swagger';
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
@UseGuards(RoleGuard)
export class UserListTracksController {
  constructor(private readonly listTracksService: UserListTracksService) {}

  @Get('list-tracks')
  @ApiOperation({
    summary: 'List tracks',
    description: [FILTERED_DATA_DESCRIPTION, PAGINATED_DATA_DESCRIPTION, JWT_AUTHENTICATED_REQUEST_DESCRIPTION].join(
      '\n',
    ),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
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
