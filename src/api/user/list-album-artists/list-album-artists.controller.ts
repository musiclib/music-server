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
  UserListAlbumArtistsBadRequestResponseDto,
  UserListAlbumArtistsQueryDto,
  UserListAlbumArtistsResponseDto,
} from './list-album-artists.dto';
import { UserListAlbumArtistsService } from './list-album-artists.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListAlbumArtistsController {
  constructor(private readonly listAlbumArtistsService: UserListAlbumArtistsService) {}

  @Get('list-album-artists')
  @ApiOperation({
    summary: 'List artists credited to albums',
    description: [
      `Album artists are the artists attributed directly to the album, usually a subset of artists credited to tracks.`,
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
    type: UserListAlbumArtistsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListAlbumArtistsBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumArtistsQueryDto,
  ): Promise<UserListAlbumArtistsResponseDto> {
    const data = await this.listAlbumArtistsService.listArtists(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
