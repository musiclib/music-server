/* eslint-disable max-classes-per-file */
import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from '../role.guard';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  IntersectionType,
  PartialType,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import {
  QnapMediaListAlbumsResponseDto,
  QnapMediaListArtistsResponseDto,
  QnapMediaListBucketQueryDto,
  QnapMediaListFoldersResponseDto,
  QnapMediaListGeneralQueryDto,
  QnapMediaListGenresResponseDto,
  QnapMediaListRandomAlbumsResponseDto,
  QnapMediaListRandomArtistsResponseDto,
  QnapMediaListRandomQueryDto,
  QnapMediaListTracksResponseDto,
} from './dtos/media-list.dto';
import { QnapMediaListService } from './media-list.service';
import { SortDirectionEnum, UserRoleEnum } from 'src/types/enums';
import { User } from '../user.decorator';
import { objectToXml } from 'src/utils/xml';
import { plainToInstance } from 'class-transformer';

class QnapMediaListQueryDto extends PartialType(
  IntersectionType(QnapMediaListRandomQueryDto, QnapMediaListGeneralQueryDto, QnapMediaListBucketQueryDto),
) {}

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
  @ApiProduces('text/xml')
  @Header('Content-Type', 'text/xml')
  @ApiOperation({ summary: 'Handle QNAP Music Station media-list API requests' })
  @ApiOkResponse({
    description: 'List of songs, artists, albums, genres, folders, or tracks',
    content: {
      'application/xml': {
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
            {
              $ref: getSchemaPath(QnapMediaListRandomArtistsResponseDto),
            },
            {
              $ref: getSchemaPath(QnapMediaListRandomAlbumsResponseDto),
            },
          ],
        },
      },
    },
  })
  @ApiExtraModels(
    QnapMediaListRandomQueryDto,
    QnapMediaListGeneralQueryDto,
    QnapMediaListBucketQueryDto,
    QnapMediaListRandomArtistsResponseDto,
    QnapMediaListRandomAlbumsResponseDto,
    QnapMediaListArtistsResponseDto,
    QnapMediaListAlbumsResponseDto,
    QnapMediaListGenresResponseDto,
    QnapMediaListFoldersResponseDto,
    QnapMediaListTracksResponseDto,
  )
  async post(
    @User() user: AccountEntity,
    @Query() variousQueries: QnapMediaListQueryDto | Record<string, unknown>,
    @Body() variousBodies: QnapMediaListQueryDto | Record<string, unknown>,
  ) {
    const data = {
      ...variousQueries,
      ...variousBodies,
    };
    console.log('medialist', 'query', variousQueries, 'body', variousBodies, 'data', data);
    if (data.act === 'random') {
      const query = plainToInstance(QnapMediaListRandomQueryDto, data, {
        enableImplicitConversion: true,
      });
      if (query.type === 'artist') {
        const randomList = await this.mediaListApiService.listRandomArtists(user.id, query.counts || 250);
        return objectToXml({ status: 1, ...randomList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'album') {
        const randomList = await this.mediaListApiService.listRandomAlbums(user.id, query.counts || 250);
        return objectToXml({ status: 1, ...randomList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
    }
    if (data.act === 'list') {
      const query = plainToInstance(QnapMediaListGeneralQueryDto, data, {
        enableImplicitConversion: true,
      });
      // Route #1:  song list
      if (query.type === 'songs') {
        const songList = await this.mediaListApiService.listTracks(
          user.id,
          query.pagesize || 250,
          query.currpage || 1,
          query.sortBy || 'title',
          query.desc || SortDirectionEnum.ASC,
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
          query.pagesize || 250,
          query.currpage || 1,
          query.sortBy || 'title',
          query.desc || SortDirectionEnum.ASC,
        );
        return objectToXml({ status: 1, ...albumList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'artist') {
        // Route #4:  artist's song list
        if (query.linkid) {
          const albumList = await this.mediaListApiService.listAlbumsByArtist(
            user.id,
            query.linkid,
            query.pagesize || 250,
            query.currpage || 1,
            query.sortBy || 'title',
            query.desc || SortDirectionEnum.ASC,
          );
          return objectToXml({ status: 1, ...albumList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #5:  artist list
        const artistList = await this.mediaListApiService.listArtists(
          user.id,
          query.pagesize || 250,
          query.currpage || 1,
          query.sortBy || 'title',
          query.desc || SortDirectionEnum.ASC,
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
          query.pagesize || 250,
          query.currpage || 1,
          query.sortBy || 'title',
          query.desc || SortDirectionEnum.ASC,
        );
        return objectToXml({ status: 1, ...genreList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      // Route #8:  list of songs information
      if (query.type === 'songs_info') {
        const trackList = await this.mediaListApiService.listTracksById(user.id, query.linkidlist || []);
        return objectToXml({ status: 1, ...trackList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
      if (query.type === 'folder') {
        // Route #9:  list folders
        if (query.linkid) {
          const folderList = await this.mediaListApiService.listFolders(user.id, query.linkid);
          console.log('nested folders', query.linkid, folderList.datas.data);
          return objectToXml({ status: 1, ...folderList }, 'QDocRoot version="1.0"', 'QDocRoot');
        }
        // Route #10:  list root folders
        const folderList = await this.mediaListApiService.listRootFolders(user.id);
        console.log('folders', folderList);
        return objectToXml({ status: 1, ...folderList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
    }
    if (data.linkid) {
      const query = plainToInstance(QnapMediaListBucketQueryDto, data, {
        enableImplicitConversion: true,
      });
      // Route #11:  list recently added
      if (query.type === 'get_spotlight_list' && query.linkid === 'Mg-3D-3D') {
        const spotlightList = await this.mediaListApiService.listTracksRecentlyAdded(user.id);
        return objectToXml({ status: 1, ...spotlightList }, 'QDocRoot version="1.0"', 'QDocRoot');
      }
    }
    // return an empty list for unsupported routes including:
    // Route #12:  list frequently played
    // Route #13:  list favorites
    // Route #14:  list trash
    return objectToXml(
      {
        status: 1,
        datas: {
          data: [],
        },
      },
      'QDocRoot version="1.0"',
      'QDocRoot',
    );
  }
}
