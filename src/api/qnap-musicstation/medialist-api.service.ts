import {
  AlbumSortFieldEnum,
  ArtistSortFieldEnum,
  GenreSortFieldEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class QnapMediaListApiService {
  constructor(private readonly libraryService: LibraryService) {}

  async listRandomArtists(accountId: number, limit: number) {
    const artists = await this.libraryService.listAlbumArtists(accountId, {}, 0, limit, ArtistSortFieldEnum.RANDOM);
    return {
      datas: artists.items.map((artist) => ({
        FileName: artist.name,
        FileType: 'artist',
        Title: artist.name,
        LinkID: artist.id.toString(),
        ImagePath: `artist_${artist.id}`,
        Albumartist: artist.name,
      })),
    };
  }

  async listRandomAlbums(accountId: number, limit: number) {
    const albums = await this.libraryService.listAlbums(accountId, {}, 0, limit, AlbumSortFieldEnum.RANDOM);
    return {
      datas: albums.items.map((album) => ({
        FileName: album.title,
        FileType: 'album',
        Title: album.title,
        LinkID: album.id.toString(),
        ImagePath: `album_${album.id}`,
        Albumartist: album.artists.map((artist) => artist.name).join(', '),
      })),
    };
  }

  async listArtists(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const artists = await this.libraryService.listAlbumArtists(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as ArtistSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: artists.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: artists.items.map((artist) => {
          return {
            FileName: artist.name,
            FileType: 'artist',
            Title: artist.name,
            LinkID: artist.id.toString(),
            ImagePath: `artist_${artist.id}`,
            Albumartist: artist.name,
          };
        }),
      },
    };
  }

  async listAlbums(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const albums = await this.libraryService.listAlbums(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as AlbumSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: albums.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: albums.items.map((album) => {
          return {
            FileName: album.title,
            FileType: 'album',
            Title: album.title,
            LinkID: album.id.toString(),
            ImagePath: `album_${album.id}`,
            Albumartist: album.artists.map((artist) => artist.name).join(', '),
          };
        }),
      },
    };
  }

  async listGenres(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const genres = await this.libraryService.listTrackGenres(
      accountId,
      offset,
      pageSize,
      sortBy.toLowerCase() as GenreSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: genres.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: genres.items.map((genre) => {
          return {
            FileName: genre.name,
            FileType: 'genre',
            Title: genre.name,
            LinkID: genre.id.toString(),
          };
        }),
      },
    };
  }

  async listTracks(
    accountId: number,
    pageSize: number,
    currentPage: number,
    sortBy: string,
    sortDirection: SortDirectionEnum,
  ) {
    const offset = (currentPage - 1) * pageSize;
    const tracks = await this.libraryService.listTracks(
      accountId,
      {},
      offset,
      pageSize,
      sortBy.toLowerCase() as TrackSortFieldEnum,
      sortDirection,
    );
    return {
      datas: {
        TotalCounts: tracks.total,
        CurrPage: currentPage,
        PageSize: pageSize,
        data: tracks.items.map((track) => {
          return {
            SongId: track.id,
            FileName: track.filePath,
            FileType: 'music',
            FileSize: track.fileSize,
            Extension: track.filePath.split('.').pop(),
            LinkId: '',
            ImagePath: `album_${track.albumId}`,
            audio_playtime: track.duration * 1000,
            Title: track.title,
            Artist: track.artists.map((artist) => artist.name).join(', '),
            Album: track.albumTitle,
            Tracknumber: track.trackNumber,
            Disc: track.discNumber,
            Genre: track.genres.map((genre) => genre.name).join(', '),
            Year: track.year,
            UseCount: 0,
            Formatid: 3, // TODO: may refer to MP3, FLAC etc not sure
            MediaType: 0, // TODO: may refer to MP3, FLAC etc not sure
            FilePath: track.filePath,
            iOrderNr: '',
            did: '',
            favorite: 0,
            Rating: track.rating,
            Order: '',
          };
        }),
      },
    };
  }
}
