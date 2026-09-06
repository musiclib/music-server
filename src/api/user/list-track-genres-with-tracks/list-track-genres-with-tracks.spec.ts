import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { GenreSortFieldEnum, SortDirectionEnum } from '../../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-track-genres-with-tracks', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-track-genres-with-tracks`, {
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
    it('should reject negative limit', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({ offset: 0, limit: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({ offset: 0, limit: 1_000_000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({ offset: 0, limit: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({ offset: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({ offset: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({
        sortDirection: 'invalid-direction' as SortDirectionEnum,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listTrackGenresWithTracks({
        sortField: 'invalid-field' as unknown as GenreSortFieldEnum,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('sort', () => {
      it('should sort by genre ASC', async () => {
        const { data } = await userApi.listTrackGenresWithTracks({
          sortField: GenreSortFieldEnum.genre,
          sortDirection: SortDirectionEnum.asc,
        });
        const { genres, total } = data || { genres: [], total: 0 };
        expect(total).toBe(7);
        expect(genres.length).toBe(7);
        expect(genres[0]?.name).toBe('Acid');
        expect(genres[1]?.name).toBe('Acid Jazz');
        expect(genres[2]?.name).toBe('Acoustic');
        expect(genres[3]?.name).toBe('Bebob');
        expect(genres[4]?.name).toBe('Bluegrass');
        expect(genres[5]?.name).toBe('Chanson');
        expect(genres[6]?.name).toBe('Chorus');
      });

      it('should sort by genre DESC', async () => {
        const { data } = await userApi.listTrackGenresWithTracks({
          sortField: GenreSortFieldEnum.genre,
          sortDirection: SortDirectionEnum.desc,
        });
        const { genres, total } = data || { genres: [], total: 0 };
        expect(total).toBe(7);
        expect(genres.length).toBe(7);
        expect(genres[0]?.name).toBe('Chorus');
        expect(genres[1]?.name).toBe('Chanson');
        expect(genres[2]?.name).toBe('Bluegrass');
        expect(genres[3]?.name).toBe('Bebob');
        expect(genres[4]?.name).toBe('Acoustic');
        expect(genres[5]?.name).toBe('Acid Jazz');
        expect(genres[6]?.name).toBe('Acid');
      });
    });
  });

  describe('success', () => {
    it('should return all genres', async () => {
      const { data } = await userApi.listTrackGenresWithTracks();
      const { genres, total } = data || { genres: [], total: 0 };
      expect(total).toBe(7);
      expect(genres.length).toBe(7);
      for (let i = 0; i < genres.length; i += 1) {
        const genre = genres[i];
        expect(genre).toBeDefined();
        expect(genre?.albums).toBeDefined();
        expect(genre?.albums.length).toBeGreaterThan(0);
        for (let j = 0; j < (genre?.albums || []).length; j += 1) {
          const album = genre?.albums[j];
          expect(album).toBeDefined();
          expect(album?.tracks).toBeDefined();
          expect(album?.tracks.length).toBeGreaterThan(0);
        }
      }
    });

    it('should paginate results', async () => {
      const { data } = await userApi.listTrackGenresWithTracks({ offset: 0, limit: 4 });
      const { genres, total } = data || { genres: [], total: 0 };
      expect(total).toBe(7);
      expect(genres.length).toBe(4);
      expect(genres[0]?.name).toBe('Acid');
      expect(genres[1]?.name).toBe('Acid Jazz');
      expect(genres[2]?.name).toBe('Acoustic');
      expect(genres[3]?.name).toBe('Bebob');
      const { data: data2 } = await userApi.listTrackGenresWithTracks({ offset: 4, limit: 4 });
      const { genres: genres2, total: total2 } = data2 || { genres: [], total: 0 };
      expect(total2).toBe(7);
      expect(genres2.length).toBe(3);
      expect(genres2[0]?.name).toBe('Bluegrass');
      expect(genres2[1]?.name).toBe('Chanson');
      expect(genres2[2]?.name).toBe('Chorus');
    });
  });
});
