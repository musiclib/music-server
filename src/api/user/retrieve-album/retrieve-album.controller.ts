import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
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
@UseGuards(RoleGuard)
export class UserRetrieveAlbumController {
  constructor(private readonly retrieveAlbumService: UserRetrieveAlbumService) {}

  @Get('retrieve-album')
  @ApiOperation({
    summary: 'Retrieves single albums',
    description: [
      `Retrieves an album and its complete track list with all information necessary for viewing and playback.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
