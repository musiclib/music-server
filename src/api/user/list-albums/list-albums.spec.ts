import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { AlbumSortFieldEnum, SortDirectionEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-albums', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-albums`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid addedAfter date', async () => {
      const { error } = await userApi.listAlbums({ addedAfter: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await userApi.listAlbums({ addedBefore: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    // it('should reject invalid artist', async () => {
    //   const { error } = await userApi.listAlbums({ artist: [true as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTIST_ERROR);
    // });

    it('should reject invalid artist length', async () => {
      const { error } = await userApi.listAlbums({ artist: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTIST_LENGTH_ERROR);
    });

    // it('should reject invalid composer', async () => {
    //   const { error } = await userApi.listAlbums({ composer: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR);
    // });

    it('should reject invalid composer length', async () => {
      const { error } = await userApi.listAlbums({ composer: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await userApi.listAlbums({ filter: '' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listAlbums({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await userApi.listAlbums({ genre: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await userApi.listAlbums({ offset: 0, limit: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listAlbums({ offset: 0, limit: 1_000_000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listAlbums({ offset: 0, limit: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid maxRating', async () => {
      const { error } = await userApi.listAlbums({ maxRating: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_MAX_RATING_ERROR);
    });

    it('should reject invalid minRating', async () => {
      const { error } = await userApi.listAlbums({ minRating: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_MIN_RATING_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listAlbums({ offset: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listAlbums({ offset: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid releasedAfter date', async () => {
      const { error } = await userApi.listAlbums({ releasedAfter: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_RELEASED_AFTER_ERROR);
    });

    it('should reject invalid releasedBefore date', async () => {
      const { error } = await userApi.listAlbums({ releasedBefore: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_RELEASED_BEFORE_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listAlbums({ sortDirection: 'invalid-direction' as SortDirectionEnum });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listAlbums({ sortField: 'invalid-field' as unknown as AlbumSortFieldEnum });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });

    it('should reject invalid year', async () => {
      const { error } = await userApi.listAlbums({ year: 'never' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_YEAR_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await userApi.listAlbums({ genre: ['Rock'] });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(2);
        expect(albums.length).toBe(2);
        expect(albums[0]?.title).toBe('Album 2');
        expect(albums[1]?.title).toBe('Album 4');
      });

      it('should filter by artist', async () => {
        const { data } = await userApi.listAlbums({ artist: ['Artist 3'] });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(2);
        expect(albums.length).toBe(2);
        expect(albums[0]?.title).toBe('Album 4');
        expect(albums[1]?.title).toBe('Album 5');
      });

      it('should filter by composer', async () => {
        const { data } = await userApi.listAlbums({ composer: ['Composer 4'] });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(2);
        expect(albums.length).toBe(2);
        expect(albums[0]?.title).toBe('Album 3');
        expect(albums[1]?.title).toBe('Album 4');
      });

      it('should filter by search term', async () => {
        const { data } = await userApi.listAlbums({ filter: 'Album 4' });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(1);
        expect(albums.length).toBe(1);
        expect(albums[0]?.title).toBe('Album 4');
      });

      it('should filter by year', async () => {
        const { data } = await userApi.listAlbums({ year: 2004 });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(1);
        expect(albums.length).toBe(1);
        expect(albums[0]?.title).toBe('Album 5');
      });
    });

    describe('sort', () => {
      it('should sort by album name ASC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.album,
          sortDirection: SortDirectionEnum.asc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[0]?.title).toBe('Album 1');
        expect(albums[1]?.title).toBe('Album 2');
        expect(albums[2]?.title).toBe('Album 3');
        expect(albums[3]?.title).toBe('Album 4');
        expect(albums[4]?.title).toBe('Album 5');
      });

      it('should sort by album name DESC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.album,
          sortDirection: SortDirectionEnum.desc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[4]?.title).toBe('Album 1');
        expect(albums[3]?.title).toBe('Album 2');
        expect(albums[2]?.title).toBe('Album 3');
        expect(albums[1]?.title).toBe('Album 4');
        expect(albums[0]?.title).toBe('Album 5');
      });

      it('should sort by year ASC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.year,
          sortDirection: SortDirectionEnum.asc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[0]?.title).toBe('Album 1');
        expect(albums[1]?.title).toBe('Album 2');
        expect(albums[2]?.title).toBe('Album 4');
        expect(albums[3]?.title).toBe('Album 5');
        expect(albums[4]?.title).toBe('Album 3');
      });

      it('should sort by year DESC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.year,
          sortDirection: SortDirectionEnum.desc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[0]?.title).toBe('Album 3');
        expect(albums[1]?.title).toBe('Album 5');
        expect(albums[2]?.title).toBe('Album 4');
        expect(albums[3]?.title).toBe('Album 2');
        expect(albums[4]?.title).toBe('Album 1');
      });

      it('should sort by album artist ASC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.album_artist,
          sortDirection: SortDirectionEnum.asc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[0]?.artists[0]?.name).toBe('Artist 1');
        expect(albums[1]?.artists[0]?.name).toBe('Artist 1');
        expect(albums[2]?.artists[0]?.name).toBe('Artist 2');
        expect(albums[3]?.artists[0]?.name).toBe('Artist 3');
        expect(albums[4]?.artists[0]?.name).toBe('Artist 3');
      });

      it('should sort by album artist DESC', async () => {
        const { data } = await userApi.listAlbums({
          sortField: AlbumSortFieldEnum.album_artist,
          sortDirection: SortDirectionEnum.desc,
        });
        const { albums, total } = data || { albums: [], total: 0 };
        expect(total).toBe(5);
        expect(albums.length).toBe(5);
        expect(albums[0]?.artists[0]?.name).toBe('Artist 3');
        expect(albums[1]?.artists[0]?.name).toBe('Artist 3');
        expect(albums[2]?.artists[0]?.name).toBe('Artist 2');
        expect(albums[3]?.artists[0]?.name).toBe('Artist 1');
        expect(albums[4]?.artists[0]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all albums', async () => {
      const { data } = await userApi.listAlbums();
      const { albums, total } = data || { albums: [], total: 0 };
      expect(total).toBe(5);
      expect(albums.length).toBe(5);
    });

    it('should paginate results', async () => {
      const { data } = await userApi.listAlbums({ offset: 0, limit: 2 });
      const { albums, total } = data || { albums: [], total: 0 };
      expect(total).toBe(5);
      expect(albums.length).toBe(2);
      expect(albums[0]?.title).toBe('Album 1');
      expect(albums[1]?.title).toBe('Album 2');
      const { data: data2 } = await userApi.listAlbums({ offset: 2, limit: 2 });
      const { albums: albums2, total: total2 } = data2 || { albums: [], total: 0 };
      expect(total2).toBe(5);
      expect(albums2.length).toBe(2);
      expect(albums2[0]?.title).toBe('Album 3');
      expect(albums2[1]?.title).toBe('Album 4');
      const { data: data3 } = await userApi.listAlbums({ offset: 4, limit: 2 });
      const { albums: albums3, total: total3 } = data3 || { albums: [], total: 0 };
      expect(total3).toBe(5);
      expect(albums3.length).toBe(1);
      expect(albums3[0]?.title).toBe('Album 5');
    });
  });
});
