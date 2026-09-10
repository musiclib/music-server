import { QnapApi, createQnapApi } from '../../test-helper.qnap';
import { SortDirectionEnum, components } from '../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

type ListMediaQueryDto =
  | components['schemas']['QnapMediaListBucketQueryDto']
  | components['schemas']['QnapMediaListGeneralQueryDto']
  | components['schemas']['QnapMediaListRandomQueryDto'];

type RandomArtists = components['schemas']['QnapMediaListRandomArtistsResponseDto'];
type RandomAlbums = components['schemas']['QnapMediaListRandomAlbumsResponseDto'];
type ListArtists = components['schemas']['QnapMediaListArtistsResponseDto'];
type ListAlbums = components['schemas']['QnapMediaListAlbumsResponseDto'];
type ListGenres = components['schemas']['QnapMediaListGenresResponseDto'];
type ListFolders = components['schemas']['QnapMediaListFoldersResponseDto'];
type ListTracks = components['schemas']['QnapMediaListTracksResponseDto'];

describe('/musicstation/api/medialist_api.php', () => {
  let qnapApi: QnapApi;

  async function listMedia<R>(filter: ListMediaQueryDto, currpage = 0, pagesize = 100) {
    const paginated = filter as components['schemas']['QnapMediaListGeneralQueryDto'];
    const { data, error } = await qnapApi.listMedia(
      filter,
      paginated.currpage || currpage,
      paginated.pagesize || pagesize,
    );
    const typedData = data as R;
    return { data: typedData, error };
  }

  beforeAll(async () => {
    qnapApi = await createQnapApi();
  });

  it('should list recently-added', async () => {
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'get_spotlight_list',
      linkid: 'Mg-3D-3D',
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(27);
    // TODO: verify this
  });

  it('should list random albums', async () => {
    const { error, data } = await listMedia<RandomAlbums>({
      act: 'random',
      counts: 2,
      type: 'album',
    });
    expect(error).toBeUndefined();
    expect(data?.datas.length).toBe(2);
    // TODO: verify this
  });

  it('should list random artists', async () => {
    const { error, data } = await listMedia<RandomArtists>({
      act: 'random',
      counts: 2,
      type: 'artist',
    });
    expect(error).toBeUndefined();
    expect(data?.datas.length).toBe(2);
    // TODO: verify this
  });

  it('should list tracks', async () => {
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'songs',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(27);
  });

  it('should paginate tracks', async () => {
    const { data: page1 } = await listMedia<ListTracks>({
      act: 'list',
      type: 'songs',
      pagesize: 5,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(page1?.datas.data.length).toBe(5);
    const { data: page2 } = await listMedia<ListTracks>({
      act: 'list',
      type: 'songs',
      pagesize: 5,
      currpage: 2,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(page2?.datas.data.length).toBe(5);
    // check there are no collisions
    const page1Ids = page1?.datas.data.map((track) => track.LinkID) || [];
    const page2Ids = page2?.datas.data.map((track) => track.LinkID) || [];
    const collisions = page1Ids.filter((id) => page2Ids.includes(id));
    expect(collisions.length).toBe(0);
  });

  it('should list albums', async () => {
    const { error, data } = await listMedia<ListAlbums>({
      act: 'list',
      type: 'album',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(5);
    expect(data?.datas.data[0]?.Title).toBe('Album 1');
    expect(data?.datas.data[1]?.Title).toBe('Album 2');
    expect(data?.datas.data[2]?.Title).toBe('Album 3');
    expect(data?.datas.data[3]?.Title).toBe('Album 4');
    expect(data?.datas.data[4]?.Title).toBe('Album 5');
  });

  it('should paginate albums', async () => {
    const { data: page1 } = await listMedia<ListAlbums>({
      act: 'list',
      type: 'album',
      pagesize: 2,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(page1?.datas.data.length).toBe(2);
    const { data: page2 } = await listMedia<ListAlbums>({
      act: 'list',
      type: 'album',
      pagesize: 2,
      currpage: 2,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(page2?.datas.data.length).toBe(2);
    // check there are no collisions
    const page1Ids = page1?.datas.data.map((album) => album.LinkID) || [];
    const page2Ids = page2?.datas.data.map((album) => album.LinkID) || [];
    const collisions = page1Ids.filter((id) => page2Ids.includes(id));
    expect(collisions.length).toBe(0);
  });

  it('should list album tracks', async () => {
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'album',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
      linkid: 1,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(5);
    expect(data?.datas.data[0]?.Title).toBe('01 First Track');
    expect(data?.datas.data[1]?.Title).toBe('02 Second Track');
    expect(data?.datas.data[2]?.Title).toBe('03 Third Track');
    expect(data?.datas.data[3]?.Title).toBe('04 Fourth Track');
    expect(data?.datas.data[4]?.Title).toBe('05 Fifth Track');
    for (let i = 0, len = data?.datas.data.length || 0; i < len; i += 1) {
      expect(data?.datas.data[i]?.Album).toBe('Album 1');
    }
  });

  it('should list artists', async () => {
    const { error, data } = await listMedia<ListArtists>({
      act: 'list',
      type: 'artist',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(3);
    expect(data?.datas.data[0]?.Title).toBe('Artist 1');
    expect(data?.datas.data[1]?.Title).toBe('Artist 2');
    expect(data?.datas.data[2]?.Title).toBe('Artist 3');
  });

  it('should paginate artists', async () => {
    const { data: page1 } = await listMedia<ListArtists>({
      act: 'list',
      type: 'artist',
      pagesize: 2,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(page1?.datas.data.length).toBe(2);
    const { data: page2 } = await listMedia<ListArtists>({
      act: 'list',
      type: 'artist',
      pagesize: 2,
      currpage: 2,
      sortBy: 'title',
      desc: SortDirectionEnum.asc,
    });
    expect(page2?.datas.data.length).toBe(1);
    // check there are no collisions
    const page1Ids = page1?.datas.data.map((artist) => artist.LinkID) || [];
    const page2Ids = page2?.datas.data.map((artist) => artist.LinkID) || [];
    const collisions = page1Ids.filter((id) => page2Ids.includes(id));
    expect(collisions.length).toBe(0);
  });

  it('should list artist tracks', async () => {
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'artist',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      linkid: 1,
      desc: SortDirectionEnum.asc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(2);
    expect(data?.datas.data[0]?.Title).toBe('Album 1');
    expect(data?.datas.data[1]?.Title).toBe('Album 2');
    for (let i = 0, len = data?.datas.data.length || 0; i < len; i += 1) {
      expect(data?.datas.data[i]?.Artist).toBe('Artist 1');
    }
  });

  it('should list genres', async () => {
    const { error, data } = await listMedia<ListGenres>({
      act: 'list',
      type: 'genre',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(7);
    expect(data?.datas.data[0]?.Title).toBe('Chorus');
    expect(data?.datas.data[1]?.Title).toBe('Chanson');
    expect(data?.datas.data[2]?.Title).toBe('Bluegrass');
    expect(data?.datas.data[3]?.Title).toBe('Bebob');
    expect(data?.datas.data[4]?.Title).toBe('Acoustic');
    expect(data?.datas.data[5]?.Title).toBe('Acid Jazz');
    expect(data?.datas.data[6]?.Title).toBe('Acid');
  });

  it('should paginate genres', async () => {
    const { data: page1 } = await listMedia<ListGenres>({
      act: 'list',
      type: 'genre',
      pagesize: 2,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(page1?.datas.data.length).toBe(2);
    const { data: page2 } = await listMedia<ListGenres>({
      act: 'list',
      type: 'genre',
      pagesize: 2,
      currpage: 2,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(page2?.datas.data.length).toBe(2);
    // check there are no collisions
    const page1Ids = page1?.datas.data.map((genre) => genre.LinkID) || [];
    const page2Ids = page2?.datas.data.map((genre) => genre.LinkID) || [];
    const collisions = page1Ids.filter((id) => page2Ids.includes(id));
    expect(collisions.length).toBe(0);
  });

  it('should list genre tracks', async () => {
    const { data: genreData } = await listMedia<ListTracks>({
      act: 'list',
      type: 'genre',
      pagesize: 1,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'genre',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      linkid: genreData?.datas.data[0]?.LinkID || 0,
      desc: SortDirectionEnum.desc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(1);
    expect(data?.datas.data[0]?.Genre).toBe(genreData?.datas.data[0]?.Title);
  });

  it('should list folders', async () => {
    const { error, data } = await listMedia<ListFolders>({
      act: 'list',
      type: 'folder',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(2);
    expect(data?.datas.data[0]?.FileName).toBe('root-1');
    expect(data?.datas.data[1]?.FileName).toBe('root-2');
  });

  it('should list folder contents', async () => {
    const { data: foldersData } = await listMedia<ListFolders>({
      act: 'list',
      type: 'folder',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      desc: SortDirectionEnum.desc,
    });
    const { error, data } = await listMedia<ListTracks>({
      act: 'list',
      type: 'folder',
      pagesize: 250,
      currpage: 1,
      sortBy: 'title',
      linkid: foldersData?.datas.data[0]?.LinkID || 0,
      desc: SortDirectionEnum.desc,
    });
    expect(error).toBeUndefined();
    expect(data?.datas.data.length).toBe(2);
    expect(data?.datas.data[0]?.FileName).toBe('Artist 1');
    expect(data?.datas.data[1]?.FileName).toBe('Artist 2');
  });
});
