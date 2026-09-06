import { ContentTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SynologySongDataDto, SynologySongDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';
import type { LibraryTrackDto } from 'src/library/dtos';

function songToRow(track: LibraryTrackDto): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: track.fileBitRate,
        channel: track.fileChannels,
        codec: track.fileType,
        container: track.fileType,
        duration: track.duration,
        filesize: track.fileSize,
        frequency: track.fileFrequency,
      },
      song_rating: {
        rating: 0,
      },
      song_tag: {
        album: replaceDoubleQuotes(track.albumTitle || ''),
        album_artist: replaceDoubleQuotes(replaceDoubleQuotes(track.artists.map((artist) => artist.name).join(', '))),
        artist: replaceDoubleQuotes(track.artists.map((artist) => artist.name).join(', ')),
        comment: replaceDoubleQuotes(track.comment || ''),
        composer: track.composers.map((composer) => composer.name).join(', '),
        disc: track.discNumber,
        genre: track.genres.join(', '),
        track: track.trackNumber,
        year: track.year,
      },
    },
    id: `music_${track.id}`,
    path: track.filePath,
    title: replaceDoubleQuotes(track.title),
    type: ContentTypeEnum.FILE,
  };
}

@Injectable()
export class SynologySongService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtistTracks(
    accountId: number,
    artistName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        albumArtist: [artistName],
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listArtistAlbumTracks(
    accountId: number,
    artistName: string,
    albumTitle: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        album: albumTitle,
        albumArtist: [artistName],
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listComposerTracks(
    accountId: number,
    composerName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    // note: there is a discrepancy here with this API vs Synology where a track
    // that has multiple composers including <composerName> will be returned
    // but Synology will return a direct match only where only <composerName>
    // is attributed.
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        composer: [composerName],
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listComposerAlbumTracks(
    accountId: number,
    composerName: string,
    albumTitle: string,
    albumArtist: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    // note: there is a discrepancy here with this API vs Synology where a track
    // that has multiple composers including <composerName> will be returned
    // but Synology will return a direct match only where only <composerName>
    // is attributed.
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        album: albumTitle,
        albumArtist: [albumArtist],
        composer: [composerName],
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listGenreAlbumTracks(
    accountId: number,
    albumTitle: string,
    albumArtist: string,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        album: albumTitle,
        albumArtist: [albumArtist],
        genre: genreName.split('/'),
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listGenreTracks(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        genre: genreName.split('/'),
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listAlbumTracks(
    accountId: number,
    albumTitle: string,
    albumArtist: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(
      accountId,
      {
        album: albumTitle,
        albumArtist: [albumArtist],
      },
      offset,
      limit,
    );
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async listTracks(accountId: number, offset: number, limit: number): Promise<SynologySongDataDto> {
    const tracks = await this.libraryService.listTracks(accountId, {}, offset, limit);
    return {
      songs: tracks.items.map(songToRow),
      offset,
      total: tracks.total,
    };
  }

  async rateTracks(accountId: number, fileIds: number[], rating: number): Promise<void> {
    await this.libraryService.rateTracks(accountId, fileIds, rating);
  }
}
