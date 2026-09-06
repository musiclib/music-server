import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackComposersQueryDto } from './list-track-composers.dto';

@Injectable()
export class UserListTrackComposersService {
  constructor(private readonly libraryService: LibraryService) {}

  async listComposers(accountId: number, query: UserListTrackComposersQueryDto) {
    const composers = await this.libraryService.listComposers(
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
