import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTracksQueryDto } from './list-tracks.dto';

@Injectable()
export class UserListTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listTracks(accountId: number, query: UserListTracksQueryDto) {
    const data = await this.libraryService.listTracks(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      tracks: data.items,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
