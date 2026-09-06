import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListAlbumArtistsController {
  constructor(private readonly listAlbumArtistsService: UserListAlbumArtistsService) {}

  @Get('list-album-artists')
  @ApiOperation({
    summary: 'List album artists',
    description: `Retrieves a list of album artists for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of album artists for the user.',
    type: UserListAlbumArtistsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
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
