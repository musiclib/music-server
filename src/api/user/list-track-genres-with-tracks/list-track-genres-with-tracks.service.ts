import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackGenresWithTracksQueryDto } from './list-track-genres-with-tracks.dto';

@Injectable()
export class UserListTrackGenresWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listGenresWithTracks(accountId: number, query: UserListTrackGenresWithTracksQueryDto) {
    const data = await this.libraryService.listTrackGenresWithTracks(
      accountId,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      genres: data.items,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
