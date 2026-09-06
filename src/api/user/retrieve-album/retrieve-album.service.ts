import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserRetrieveAlbumService {
  constructor(private readonly libraryService: LibraryService) {}

  async retrieveAlbum(accountId: number, albumId: number) {
    const album = await this.libraryService.retrieveAlbum(accountId, albumId);
    return album;
  }
}
