import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackArtistsQueryDto } from './list-track-artists.dto';

@Injectable()
export class UserListTrackArtistsService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtists(accountId: number, query: UserListTrackArtistsQueryDto) {
    const data = await this.libraryService.listTrackArtists(
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
