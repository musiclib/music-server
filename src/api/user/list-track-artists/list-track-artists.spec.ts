import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ArtistSortFieldEnum, SortDirectionEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-track-artists', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-track-artists`, {
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
      const { error } = await userApi.listTrackArtists({ addedAfter: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await userApi.listTrackArtists({ addedBefore: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await userApi.listTrackArtists({ filter: '' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listAlbumArtists({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await userApi.listTrackArtists({ genre: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await userApi.listTrackArtists({ offset: 0, limit: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listTrackArtists({ offset: 0, limit: 1_000_000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listTrackArtists({ offset: 0, limit: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listTrackArtists({ offset: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listTrackArtists({ offset: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listTrackArtists({ sortDirection: 'invalid-direction' as SortDirectionEnum });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listTrackArtists({
        sortField: 'invalid-field' as unknown as ArtistSortFieldEnum,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await userApi.listTrackArtists({ genre: ['Rock'] });
        const { artists, total } = data || { artists: [], total: 0 };
        expect(total).toBe(2);
        expect(artists.length).toBe(2);
        expect(artists[0]?.name).toBe('Artist 1');
        expect(artists[1]?.name).toBe('Artist 3, Artist 2');
      });

      it('should filter by search term', async () => {
        const { data } = await userApi.listTrackArtists({ filter: '3' });
        const { artists, total } = data || { artists: [], total: 0 };
        expect(total).toBe(3);
        expect(artists.length).toBe(3);
        expect(artists[0]?.name).toBe('Artist 3');
        expect(artists[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(artists[2]?.name).toBe('Artist 3, Artist 2');
      });
    });

    describe('sort', () => {
      it('should sort by artist ASC', async () => {
        const { data } = await userApi.listTrackArtists({
          sortField: ArtistSortFieldEnum.artist,
          sortDirection: SortDirectionEnum.asc,
        });
        const { artists, total } = data || { artists: [], total: 0 };
        expect(total).toBe(5);
        expect(artists.length).toBe(5);
        expect(artists[0]?.name).toBe('Artist 1');
        expect(artists[1]?.name).toBe('Artist 2');
        expect(artists[2]?.name).toBe('Artist 3');
        expect(artists[3]?.name).toBe('Artist 3 ft. Artist 2');
        expect(artists[4]?.name).toBe('Artist 3, Artist 2');
      });

      it('should sort by artist DESC', async () => {
        const { data } = await userApi.listTrackArtists({
          sortField: ArtistSortFieldEnum.artist,
          sortDirection: SortDirectionEnum.desc,
        });
        const { artists, total } = data || { artists: [], total: 0 };
        expect(total).toBe(5);
        expect(artists.length).toBe(5);
        expect(artists[0]?.name).toBe('Artist 3, Artist 2');
        expect(artists[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(artists[2]?.name).toBe('Artist 3');
        expect(artists[3]?.name).toBe('Artist 2');
        expect(artists[4]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all artists', async () => {
      const { data } = await userApi.listTrackArtists();
      const { artists, total } = data || { artists: [], total: 0 };
      expect(total).toBe(5);
      expect(artists.length).toBe(5);
    });

    it('should paginate results', async () => {
      const { data } = await userApi.listTrackArtists({ offset: 0, limit: 2 });
      const { artists, total } = data || { artists: [], total: 0 };
      expect(total).toBe(5);
      expect(artists.length).toBe(2);
      expect(artists[0]?.name).toBe('Artist 1');
      expect(artists[1]?.name).toBe('Artist 2');
      const { data: data2 } = await userApi.listTrackArtists({ offset: 1, limit: 2 });
      const { artists: artists2, total: total2 } = data2 || { artists: [], total: 0 };
      expect(total2).toBe(5);
      expect(artists2.length).toBe(2);
      expect(artists2[0]?.name).toBe('Artist 2');
      expect(artists2[1]?.name).toBe('Artist 3');
      const { data: data3 } = await userApi.listTrackArtists({ offset: 2, limit: 2 });
      const { artists: artists3, total: total3 } = data3 || { artists: [], total: 0 };
      expect(total3).toBe(5);
      expect(artists3.length).toBe(2);
      expect(artists3[0]?.name).toBe('Artist 3');
      expect(artists3[0]?.name).toBe('Artist 3');
      expect(artists3[1]?.name).toBe('Artist 3 ft. Artist 2');
    });
  });
});
