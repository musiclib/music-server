import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryAlbumDto } from 'src/library/dtos/library.album.dto';
import { LibraryService } from 'src/library/library.service';
import { SynologyAlbumDataDto, SynologyAlbumDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function albumToRow(album: LibraryAlbumDto): SynologyAlbumDto {
  return {
    additional: {
      avg_rating: {
        rating: 0,
      },
    },
    album_artist: replaceDoubleQuotes(album.artists.map((artist) => artist.name).join(', ')),
    artist: '',
    display_artist: album.artists.map((artist) => artist.name).join(', '),
    name: replaceDoubleQuotes(album.title),
    year: album.year,
  };
}

@Injectable()
export class SynologyAlbumService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAlbums(accountId: number, offset: number, limit: number) {
    const albums = await this.libraryService.listAlbums(accountId, {}, offset, limit);
    return {
      albums: albums.items.map(albumToRow),
      offset,
      total: albums.total,
    };
  }

  async listArtistAlbums(
    accountId: number,
    artistName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        artist: [artistName],
      },
      offset,
      limit,
      AlbumSortFieldEnum.ALBUM,
      SortDirectionEnum.ASC,
    );
    return {
      albums: albums.items.map(albumToRow),
      offset,
      total: albums.total,
    };
  }

  async listArtistGenreAlbums(
    accountId: number,
    artistName: string,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        artist: [artistName],
        genre: genreName.split('/'),
      },
      offset,
      limit,
      AlbumSortFieldEnum.ALBUM,
      SortDirectionEnum.ASC,
    );
    return {
      albums: albums.items.map(albumToRow),
      offset,
      total: albums.total,
    };
  }

  async listComposerAlbums(
    accountId: number,
    composerName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        composer: [composerName],
      },
      offset,
      limit,
      AlbumSortFieldEnum.ALBUM,
      SortDirectionEnum.ASC,
    );
    return {
      albums: albums.items.map(albumToRow),
      offset,
      total: albums.total,
    };
  }

  async listGenreAlbums(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        genre: genreName.split('/'),
      },
      offset,
      limit,
      AlbumSortFieldEnum.ALBUM,
      SortDirectionEnum.ASC,
    );
    return {
      albums: albums.items.map(albumToRow),
      offset,
      total: albums.total,
    };
  }
}
