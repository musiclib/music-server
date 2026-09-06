import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumArtistsWithTracksQueryDto } from './list-album-artists-with-tracks.dto';

@Injectable()
export class UserListAlbumArtistsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtistsWithTracks(accountId: number, query: UserListAlbumArtistsWithTracksQueryDto) {
    const data = await this.libraryService.listAlbumArtistsWithTracks(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      artists: data.items,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
