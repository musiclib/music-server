import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackComposersWithTracksQueryDto } from './list-track-composers-with-tracks.dto';

@Injectable()
export class UserListTrackComposersWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listComposersWithTracks(accountId: number, query: UserListTrackComposersWithTracksQueryDto) {
    const composers = await this.libraryService.listComposersWithTracks(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      composers: composers.items,
      offset: query.offset || 0,
      total: composers.total,
    };
  }
}
