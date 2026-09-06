import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackArtistsWithTracksQueryDto } from './list-track-artists-with-tracks.dto';

@Injectable()
export class UserListTrackArtistsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtists(accountId: number, query: UserListTrackArtistsWithTracksQueryDto) {
    const data = await this.libraryService.listTrackArtistsWithTracks(
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
