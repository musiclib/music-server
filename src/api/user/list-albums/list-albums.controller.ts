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
  TRACK_INFORMATION_EXCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumsBadRequestResponseDto,
  UserListAlbumsQueryDto,
  UserListAlbumsResponseDto,
} from './list-albums.dto';
import { UserListAlbumsService } from './list-albums.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListAlbumsController {
  constructor(private readonly listAlbumsService: UserListAlbumsService) {}

  @Get('list-albums')
  @ApiOperation({
    summary: 'List albums',
    description: [
      `Albums can be filtered by an extensive set of criteria and search terms.`,
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
    type: UserListAlbumsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListAlbumsBadRequestResponseDto,
  })
  async get(@User() user: AccountEntity, @Query() query: UserListAlbumsQueryDto): Promise<UserListAlbumsResponseDto> {
    const data = await this.listAlbumsService.listAlbums(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
