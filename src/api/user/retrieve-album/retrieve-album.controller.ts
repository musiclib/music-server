import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserRetrieveAlbumNotFoundResponseDto,
  UserRetrieveAlbumQueryDto,
  UserRetrieveAlbumResponseDto,
} from './retrieve-album.dto';
import { UserRetrieveAlbumService } from './retrieve-album.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserRetrieveAlbumController {
  constructor(private readonly retrieveAlbumService: UserRetrieveAlbumService) {}

  @Get('retrieve-album')
  @ApiOperation({
    summary: 'Retrieve album',
    description: `Retrieves an album with all of its information necessary for viewing and playing-back the tracks.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the album data for the user.',
    type: UserRetrieveAlbumResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Album not found',
    type: UserRetrieveAlbumNotFoundResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserRetrieveAlbumQueryDto,
  ): Promise<UserRetrieveAlbumResponseDto> {
    const album = await this.retrieveAlbumService.retrieveAlbum(user.id, query.id);
    return {
      album,
      success: true,
    };
  }
}
