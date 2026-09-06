import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackGenresQueryDto } from './list-track-genres.dto';

@Injectable()
export class UserListTrackGenresService {
  constructor(private readonly libraryService: LibraryService) {}

  async listGenres(accountId: number, query: UserListTrackGenresQueryDto) {
    const data = await this.libraryService.listTrackGenres(
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
