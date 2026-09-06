import { ContentTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryAlbumDto, LibraryArtistDto, LibraryTrackDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { SynologySearchAlbumDto, SynologySearchArtistDto, SynologySearchDataDto, SynologySongDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function albumToRow(album: LibraryAlbumDto): SynologySearchAlbumDto {
  return {
    album_artist: replaceDoubleQuotes(album.artists.join(', ')),
    display_artist: replaceDoubleQuotes(album.artists.join(', ')),
    name: replaceDoubleQuotes(album.title),
    artist: replaceDoubleQuotes(album.artists.map((artist) => artist).join(', ') || ''),
    year: album.year,
  };
}

function artistToRow(artist: LibraryArtistDto): SynologySearchArtistDto {
  return {
    name: replaceDoubleQuotes(artist.name),
  };
}

function songToRow(song: LibraryTrackDto): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: song.fileBitRate,
        channel: song.fileChannels,
        codec: song.fileType,
        container: song.fileType,
        duration: song.duration,
        filesize: song.fileSize,
        frequency: song.fileFrequency,
      },
      song_tag: {
        album: song.albumTitle,
        album_artist: song.albumArtists.join(', '),
        artist: song.artists.map((artist) => artist.name).join(', '),
        comment: song.comment || '',
        composer: song.composers.map((composer) => composer.name).join(', '),
        disc: song.discNumber,
        genre: song.genres.map((genre) => genre.name).join(', '),
        track: song.trackNumber,
        year: song.year,
      },
      song_rating: {
        rating: 0,
      },
    },
    id: song.id.toString(),
    path: song.filePath,
    title: song.title,
    type: ContentTypeEnum.FILE,
  };
}

@Injectable()
export class SynologySearchService {
  constructor(private readonly libraryService: LibraryService) {}

  async listSearchResults(accountId: number, keyword: string): Promise<SynologySearchDataDto> {
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        filter: keyword,
      },
      0,
      100_000,
    );
    const artists = await this.libraryService.listTrackArtists(
      accountId,
      {
        filter: keyword,
      },
      0,
      100_000,
    );
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        filter: keyword,
      },
      0,
      100_000,
    );
    return {
      albumTotal: albums.total,
      albums: albums.items.map(albumToRow),
      artistTotal: artists.total,
      artists: artists.items.map(artistToRow),
      songTotal: tracks.total,
      songs: tracks.items.map(songToRow),
    };
  }
}
