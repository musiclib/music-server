import { SynologyApi, createSynologyApi } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/search.cgi', () => {
  let synologyApi: SynologyApi;

  async function search(keyword: string) {
    const { data, error } = await synologyApi.search(keyword);
    return {
      data,
      error,
      albums: data?.data.albums || [],
      albumTotal: data?.data.albumTotal || 0,
      artists: data?.data.artists || [],
      artistTotal: data?.data.artistTotal || 0,
      songs: data?.data.songs || [],
      songTotal: data?.data.songTotal || 0,
    };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
  });

  it('should return artists', async () => {
    const { artists } = await search('artist');
    expect(artists.length).toBe(5);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(artists[1]?.name).toBe('Artist 2');
    expect(artists[2]?.name).toBe('Artist 3');
    expect(artists[3]?.name).toBe('Artist 3 ft. Artist 2');
    expect(artists[4]?.name).toBe('Artist 3, Artist 2');
  });

  it('should return albums', async () => {
    const { albums } = await search('album');
    expect(albums.length).toBe(5);
    expect(albums[0]?.name).toBe('Album 1');
    expect(albums[1]?.name).toBe('Album 2');
    expect(albums[2]?.name).toBe('Album 3');
    expect(albums[3]?.name).toBe('Album 4');
    expect(albums[4]?.name).toBe('Album 5');
  });

  it('should return songs', async () => {
    const { songs } = await search('track');
    expect(songs.length).toBe(27);
  });

  it('should return all types', async () => {
    const { artists, albums, songs, artistTotal, albumTotal, songTotal } = await search('1');
    expect(artistTotal).toBe(1);
    expect(artists.length).toBe(1);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(albumTotal).toBe(1);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 1');
    expect(songTotal).toBe(6);
    expect(songs.length).toBe(6);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[1]?.title).toBe('01 First Track');
    expect(songs[2]?.title).toBe('01 First Track');
    expect(songs[3]?.title).toBe('01 First Track');
    expect(songs[4]?.title).toBe('01 First Track');
    expect(songs[5]?.title).toBe('01 First Track');
  });
});
