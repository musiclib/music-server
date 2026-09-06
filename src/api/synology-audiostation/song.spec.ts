import { SynologyApi, createSynologyApi } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/song.cgi', () => {
  let synologyApi: SynologyApi;

  async function listSongs(filter: Record<string, string>, offset = 0, limit = 100) {
    const { data, error } = await synologyApi.listSongs(filter, offset, limit);
    return { data, error, songs: data?.data.songs || [], total: data?.data.total || 0 };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
  });

  it('should list album songs', async () => {
    const { songs, total } = await listSongs({
      album: 'Album 5',
      album_artist: 'Artist 3',
    });
    expect(total).toBe(4);
    expect(songs.length).toBe(4);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate album songs', async () => {
    const filter = { album: 'Album 5', album_artist: 'Artist 3' };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 2);
    expect(total).toBe(4);
    expect(songs.length).toBe(2);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 5');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 2, 2);
    expect(total2).toBe(4);
    expect(songs2.length).toBe(2);
    expect(songs2[0]?.title).toBe('03 Third Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs2[1]?.title).toBe('04 Fourth Track');
    expect(songs2[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[1]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list composer songs', async () => {
    const { songs, total } = await listSongs({
      composer: 'Composer 4',
    });
    expect(total).toBe(7);
    expect(songs.length).toBe(7);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[4]?.title).toBe('05 Fifth Track');
    expect(songs[4]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[4]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[5]?.title).toBe('05 Fifth Track');
    expect(songs[5]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[5]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[6]?.title).toBe('06 Sixth Track');
    expect(songs[6]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[6]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should paginate composer songs', async () => {
    const filter = { composer: 'Composer 4' };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 2);
    expect(total).toBe(7);
    expect(songs.length).toBe(2);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 3');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 2, 2);
    expect(total2).toBe(7);
    expect(songs2.length).toBe(2);
    expect(songs2[0]?.title).toBe('03 Third Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[1]?.title).toBe('04 Fourth Track');
    expect(songs2[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[1]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should list composer album songs', async () => {
    const { songs, total } = await listSongs({
      album: 'Album 3',
      album_artist: 'Artist 2',
      composer: 'Composer 4',
    });
    expect(total).toBe(5);
    expect(songs.length).toBe(5);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[4]?.title).toBe('05 Fifth Track');
    expect(songs[4]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[4]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should paginate composer album songs', async () => {
    const filter = {
      album: 'Album 3',
      album_artist: 'Artist 2',
      composer: 'Composer 4',
    };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(5);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 3');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 1);
    expect(total2).toBe(5);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('02 Second Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 3');
    // page 3
    const { songs: songs3, total: total3 } = await listSongs(filter, 2, 1);
    expect(total3).toBe(5);
    expect(songs3.length).toBe(1);
    expect(songs3[0]?.title).toBe('03 Third Track');
    expect(songs3[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs3[0]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should list genre songs', async () => {
    const { songs, total } = await listSongs({
      genre: 'Chanson',
    });
    expect(total).toBe(4);
    expect(songs.length).toBe(4);
    expect(songs[0]?.title).toBe('05 Fifth Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[1]?.title).toBe('01 First Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[2]?.title).toBe('02 Second Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[3]?.title).toBe('03 Third Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate genre songs', async () => {
    const filter = { genre: 'Chanson' };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(4);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('05 Fifth Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 4');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 2);
    expect(total2).toBe(4);
    expect(songs2.length).toBe(2);
    expect(songs2[0]?.title).toBe('01 First Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs2[1]?.title).toBe('02 Second Track');
    expect(songs2[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[1]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list genre album songs', async () => {
    const { songs, total } = await listSongs({
      album: 'Album 5',
      album_artist: 'Artist 3',
      genre: 'Chanson',
    });
    expect(total).toBe(3);
    expect(songs.length).toBe(3);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate genre album songs', async () => {
    const filter = {
      album: 'Album 5',
      album_artist: 'Artist 3',
      genre: 'Chanson',
    };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 2);
    expect(total).toBe(3);
    expect(songs.length).toBe(2);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 5');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 2, 2);
    expect(total2).toBe(3);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('03 Third Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list default genre songs', async () => {
    const { songs, total } = await listSongs({
      genre_filter: 'Ballad',
    });
    expect(total).toBe(2);
    expect(songs.length).toBe(2);
    expect(songs[0]?.title).toBe('05 Fifth Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[1]?.title).toBe('05 Fifth Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should paginate default genre songs', async () => {
    const filter = { genre_filter: 'Ballad' };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(2);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('05 Fifth Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 1);
    expect(total2).toBe(2);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('05 Fifth Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should list multi-genre songs', async () => {
    const { songs, total } = await listSongs({
      genre_filter: 'EDM/Dance',
    });
    expect(total).toBe(2);
    expect(songs.length).toBe(2);
    expect(songs[0]?.title).toBe('03 Third Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[1]?.title).toBe('06 Sixth Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should paginate multi-genre songs', async () => {
    const filter = { genre_filter: 'EDM/Dance' };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(2);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('03 Third Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 2');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 1);
    expect(total2).toBe(2);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('06 Sixth Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should list default genre album songs', async () => {
    const { songs, total } = await listSongs({
      album: 'Album 1',
      album_artist: 'Artist 1',
      genre_filter: 'Ballad',
    });
    expect(total).toBe(1);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('05 Fifth Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
  });

  it('should paginate default genre album songs', async () => {
    const filter = {
      album: 'Album 2',
      album_artist: 'Artist 1',
      genre_filter: 'Rock/Metal',
    };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(6);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 2');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 1);
    expect(total2).toBe(6);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('02 Second Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 2');
  });

  it('should list multi-genre album songs', async () => {
    const { songs, total } = await listSongs({
      genre_filter: 'Ballad/Acid',
    });
    expect(total).toBe(6);
    expect(songs.length).toBe(6);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[4]?.title).toBe('05 Fifth Track');
    expect(songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[4]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[5]?.title).toBe('05 Fifth Track');
    expect(songs[5]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[5]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should paginate multi-genre album songs', async () => {
    const filter = {
      genre_filter: 'Ballad/Acid',
    };
    // page 1
    const { songs, total } = await listSongs(filter, 0, 1);
    expect(total).toBe(6);
    expect(songs.length).toBe(1);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs(filter, 1, 1);
    expect(total2).toBe(6);
    expect(songs2.length).toBe(1);
    expect(songs2[0]?.title).toBe('02 Second Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 1');
  });

  it('should list all songs with no filters', async () => {
    const { songs, total } = await listSongs({});
    expect(total).toBe(27);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[4]?.title).toBe('05 Fifth Track');
    expect(songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[4]?.additional.song_tag.album).toBe('Album 1');

    expect(songs[5]?.title).toBe('01 First Track');
    expect(songs[5]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[5]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[6]?.title).toBe('02 Second Track');
    expect(songs[6]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[6]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[7]?.title).toBe('03 Third Track');
    expect(songs[7]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[7]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[8]?.title).toBe('04 Fourth Track');
    expect(songs[8]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[8]?.additional.song_tag.album).toBe('Album 2');

    expect(songs[9]?.title).toBe('01 First Track');
    expect(songs[9]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[9]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[10]?.title).toBe('02 Second Track');
    expect(songs[10]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[10]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[11]?.title).toBe('03 Third Track');
    expect(songs[11]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[11]?.additional.song_tag.album).toBe('Album 2');

    expect(songs[12]?.title).toBe('01 First Track');
    expect(songs[12]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[12]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[13]?.title).toBe('02 Second Track');
    expect(songs[13]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[13]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[14]?.title).toBe('03 Third Track');
    expect(songs[14]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[14]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[15]?.title).toBe('04 Fourth Track');
    expect(songs[15]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[15]?.additional.song_tag.album).toBe('Album 3');
    expect(songs[16]?.title).toBe('05 Fifth Track');
    expect(songs[16]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs[16]?.additional.song_tag.album).toBe('Album 3');

    expect(songs[17]?.title).toBe('01 First Track');
    expect(songs[17]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[17]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[18]?.title).toBe('02 Second Track');
    expect(songs[18]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[18]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[19]?.title).toBe('03 Third Track');
    expect(songs[19]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[19]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[20]?.title).toBe('04 Fourth Track');
    expect(songs[20]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[20]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[21]?.title).toBe('05 Fifth Track');
    expect(songs[21]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs[21]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[22]?.title).toBe('06 Sixth Track');
    expect(songs[22]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');

    expect(songs[22]?.additional.song_tag.album).toBe('Album 4');
    expect(songs[23]?.title).toBe('01 First Track');
    expect(songs[23]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs[23]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[24]?.title).toBe('02 Second Track');
    expect(songs[24]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[24]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[25]?.title).toBe('03 Third Track');
    expect(songs[25]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[25]?.additional.song_tag.album).toBe('Album 5');
    expect(songs[26]?.title).toBe('04 Fourth Track');
    expect(songs[26]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs[26]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate all songs with no filter', async () => {
    // page 1
    const { songs, total } = await listSongs({}, 0, 10);
    expect(total).toBe(27);
    expect(songs.length).toBe(10);
    expect(songs[0]?.title).toBe('01 First Track');
    expect(songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[1]?.title).toBe('02 Second Track');
    expect(songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[2]?.title).toBe('03 Third Track');
    expect(songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[3]?.title).toBe('04 Fourth Track');
    expect(songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(songs[4]?.title).toBe('05 Fifth Track');
    expect(songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[4]?.additional.song_tag.album).toBe('Album 1');

    expect(songs[5]?.title).toBe('01 First Track');
    expect(songs[5]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[5]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[6]?.title).toBe('02 Second Track');
    expect(songs[6]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[6]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[7]?.title).toBe('03 Third Track');
    expect(songs[7]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[7]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[8]?.title).toBe('04 Fourth Track');
    expect(songs[8]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[8]?.additional.song_tag.album).toBe('Album 2');
    expect(songs[9]?.title).toBe('01 First Track');
    expect(songs[9]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs[9]?.additional.song_tag.album).toBe('Album 2');
    // page 2
    const { songs: songs2, total: total2 } = await listSongs({}, 10, 10);
    expect(total2).toBe(27);
    expect(songs2[0]?.title).toBe('02 Second Track');
    expect(songs2[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs2[0]?.additional.song_tag.album).toBe('Album 2');
    expect(songs2[1]?.title).toBe('03 Third Track');
    expect(songs2[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(songs2[1]?.additional.song_tag.album).toBe('Album 2');
    expect(songs2[2]?.title).toBe('01 First Track');
    expect(songs2[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[2]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[3]?.title).toBe('02 Second Track');
    expect(songs2[3]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[3]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[4]?.title).toBe('03 Third Track');
    expect(songs2[4]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[4]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[5]?.title).toBe('04 Fourth Track');
    expect(songs2[5]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[5]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[6]?.title).toBe('05 Fifth Track');
    expect(songs2[6]?.additional.song_tag.artist).toBe('Artist 2');
    expect(songs2[6]?.additional.song_tag.album).toBe('Album 3');
    expect(songs2[7]?.title).toBe('01 First Track');
    expect(songs2[7]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[7]?.additional.song_tag.album).toBe('Album 4');
    expect(songs2[8]?.title).toBe('02 Second Track');
    expect(songs2[8]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs2[8]?.additional.song_tag.album).toBe('Album 4');
    expect(songs2[9]?.title).toBe('03 Third Track');
    expect(songs2[9]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs2[9]?.additional.song_tag.album).toBe('Album 4');
    // page 3
    const { songs: songs3, total: total3 } = await listSongs({}, 20, 10);
    expect(total3).toBe(27);
    expect(songs3.length).toBe(7);
    expect(songs3[0]?.title).toBe('04 Fourth Track');
    expect(songs3[0]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs3[0]?.additional.song_tag.album).toBe('Album 4');
    expect(songs3[1]?.title).toBe('05 Fifth Track');
    expect(songs3[1]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs3[1]?.additional.song_tag.album).toBe('Album 4');
    expect(songs3[2]?.title).toBe('06 Sixth Track');
    expect(songs3[2]?.additional.song_tag.artist).toBe('Artist 3, Artist 2');
    expect(songs3[2]?.additional.song_tag.album).toBe('Album 4');

    expect(songs3[3]?.title).toBe('01 First Track');
    expect(songs3[3]?.additional.song_tag.artist).toBe('Artist 3 ft. Artist 2');
    expect(songs3[3]?.additional.song_tag.album).toBe('Album 5');
    expect(songs3[4]?.title).toBe('02 Second Track');
    expect(songs3[4]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs3[4]?.additional.song_tag.album).toBe('Album 5');
    expect(songs3[5]?.title).toBe('03 Third Track');
    expect(songs3[5]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs3[5]?.additional.song_tag.album).toBe('Album 5');
    expect(songs3[6]?.title).toBe('04 Fourth Track');
    expect(songs3[6]?.additional.song_tag.artist).toBe('Artist 3');
    expect(songs3[6]?.additional.song_tag.album).toBe('Album 5');
  });
});
