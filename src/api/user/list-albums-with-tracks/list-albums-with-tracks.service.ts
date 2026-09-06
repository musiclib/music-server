import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumsWithTracksQueryDto } from './list-albums-with-tracks.dto';

@Injectable()
export class UserListAlbumsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAlbumsWithTracks(accountId: number, query: UserListAlbumsWithTracksQueryDto) {
    const albums = await this.libraryService.listAlbumsWithTracks(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      albums: albums.items,
      offset: query.offset || 0,
      total: albums.total,
    };
  }
}
