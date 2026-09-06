import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumsQueryDto } from './list-albums.dto';

@Injectable()
export class UserListAlbumsService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAlbums(accountId: number, query: UserListAlbumsQueryDto) {
    const albums = await this.libraryService.listAlbums(
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
