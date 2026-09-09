import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from '../role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapMediaListApiListQueryDto, QnapMediaListApiRandomQueryDto } from './dtos/medialist.dto';
import { QnapMediaListApiService } from './medialist.service';
import { User } from '../user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';
import { plainToInstance } from 'class-transformer';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaListApiController {
  constructor(private readonly mediaListApiService: QnapMediaListApiService) {}

  @Post('medialist_api.php')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  async post(
    @User() user: AccountEntity,
    @Query() variousQueries: QnapMediaListApiRandomQueryDto | QnapMediaListApiListQueryDto,
  ) {
    if (variousQueries.act === 'random') {
      const query = plainToInstance(QnapMediaListApiRandomQueryDto, variousQueries);
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
      const query = plainToInstance(QnapMediaListApiListQueryDto, variousQueries);
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
    }
    throw new NotFoundException('Resource not found');
  }
}
