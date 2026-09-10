import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from '../role.guard';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import {
  QnapMediaListAlbumsResponseDto,
  QnapMediaListArtistsResponseDto,
  QnapMediaListFoldersResponseDto,
  QnapMediaListGenresResponseDto,
  QnapMediaListQueryDto,
  QnapMediaListRandomQueryDto,
  QnapMediaListTracksResponseDto,
} from './dtos/medialist.dto';
import { QnapMediaListService } from './medialist.service';
import { User } from '../user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';
import { plainToInstance } from 'class-transformer';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaListController {
  constructor(private readonly mediaListApiService: QnapMediaListService) {}

  @Post('medialist_api.php')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  @ApiOperation({ summary: 'Handle QNAP Music Station media-list API requests' })
  @ApiOkResponse({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(QnapMediaListArtistsResponseDto),
        },
        {
          $ref: getSchemaPath(QnapMediaListAlbumsResponseDto),
        },
        {
          $ref: getSchemaPath(QnapMediaListGenresResponseDto),
        },
        {
          $ref: getSchemaPath(QnapMediaListFoldersResponseDto),
        },
        {
          $ref: getSchemaPath(QnapMediaListTracksResponseDto),
        },
      ],
    },
  })
  @ApiExtraModels(
    QnapMediaListRandomQueryDto,
    QnapMediaListQueryDto,
    QnapMediaListArtistsResponseDto,
    QnapMediaListAlbumsResponseDto,
    QnapMediaListGenresResponseDto,
    QnapMediaListFoldersResponseDto,
    QnapMediaListTracksResponseDto,
  )
  async post(
    @User() user: AccountEntity,
    @Query() variousQueries: QnapMediaListRandomQueryDto | QnapMediaListQueryDto,
  ) {
    if (variousQueries.act === 'random') {
      const query = plainToInstance(QnapMediaListRandomQueryDto, variousQueries);
      if (query.type === 'artist') {
        const randomList = await this.mediaListApiService.listRandomArtists(user.id, query.counts);
        return objectToXml({ status: 1, ...randomList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'album') {
        const randomList = await this.mediaListApiService.listRandomAlbums(user.id, query.counts);
        return objectToXml({ status: 1, ...randomList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
    }
    if (variousQueries.act === 'list') {
      const query = plainToInstance(QnapMediaListQueryDto, variousQueries);
      // Route #1:  song list
      if (query.type === 'songs') {
        const songList = await this.mediaListApiService.listTracks(
          user.id,
          query.pagesize,
          query.currpage,
          query.sortBy,
          query.desc,
        );
        return objectToXml({ status: 1, ...songList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'album') {
        // Route #2:  album's song list
        if (query.linkid) {
          const trackList = await this.mediaListApiService.listTracksByAlbum(user.id, query.linkid);
          return objectToXml({ status: 1, ...trackList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #3:  album list
        const albumList = await this.mediaListApiService.listAlbums(
          user.id,
          query.pagesize,
          query.currpage,
          query.sortBy,
          query.desc,
        );
        return objectToXml({ status: 1, ...albumList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'artist') {
        // Route #4:  artist's song list
        if (query.linkid) {
          const albumList = await this.mediaListApiService.listAlbumsByArtist(
            user.id,
            query.linkid,
            query.pagesize,
            query.currpage,
            query.sortBy,
            query.desc,
          );
          return objectToXml({ status: 1, ...albumList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #5:  artist list
        const artistList = await this.mediaListApiService.listArtists(
          user.id,
          query.pagesize,
          query.currpage,
          query.sortBy,
          query.desc,
        );
        return objectToXml({ status: 1, ...artistList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'genre') {
        // Route #6:  genre's song list
        if (query.linkid) {
          const trackList = await this.mediaListApiService.listTracksByGenre(user.id, query.linkid);
          return objectToXml({ status: 1, ...trackList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #7:  genre list
        const genreList = await this.mediaListApiService.listGenres(
          user.id,
          query.pagesize,
          query.currpage,
          query.sortBy,
          query.desc,
        );
        return objectToXml({ status: 1, ...genreList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      // Route #8:  list of songs information
      if (query.type === 'songs_info') {
        const trackList = await this.mediaListApiService.listTracksById(user.id, query.linkidlist);
        return objectToXml({ status: 1, ...trackList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'folder') {
        // Route #9:  list folders
        if (query.linkid) {
          const folderList = await this.mediaListApiService.listFolders(user.id, query.linkid);
          return objectToXml({ status: 1, ...folderList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #10:  list root folders
        const folderList = await this.mediaListApiService.listRootFolders(user.id);
        return objectToXml({ status: 1, ...folderList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
    }
    throw new NotFoundException('Resource not found');
  }
}
