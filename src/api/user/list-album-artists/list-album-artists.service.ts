import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumArtistsQueryDto } from './list-album-artists.dto';

@Injectable()
export class UserListAlbumArtistsService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtists(accountId: number, query: UserListAlbumArtistsQueryDto) {
    const data = await this.libraryService.listAlbumArtists(
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
