import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ComposerSortFieldEnum, SortDirectionEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-track-composers', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-track-composers`, {
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
      const { error } = await userApi.listTrackComposers({ addedAfter: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await userApi.listTrackComposers({ addedBefore: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await userApi.listTrackComposers({ filter: '' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listTrackComposers({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await userApi.listTrackComposers({ genre: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await userApi.listTrackComposers({ offset: 0, limit: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listTrackComposers({ offset: 0, limit: 1_000_000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listTrackComposers({ offset: 0, limit: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listTrackComposers({ offset: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listTrackComposers({ offset: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listTrackComposers({
        sortDirection: 'invalid-direction' as SortDirectionEnum,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listTrackComposers({
        sortField: 'invalid-field' as unknown as ComposerSortFieldEnum,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await userApi.listTrackComposers({ genre: ['Chanson'] });
        const { composers, total } = data || { composers: [], total: 0 };
        expect(total).toBe(3);
        expect(composers.length).toBe(3);
        expect(composers[0]?.name).toBe('Artist 3');
        expect(composers[1]?.name).toBe('Composer 4');
        expect(composers[2]?.name).toBe('Composer 5');
      });

      it('should filter by search term', async () => {
        const { data } = await userApi.listTrackComposers({ filter: '3' });
        const { composers, total } = data || { composers: [], total: 0 };
        expect(total).toBe(2);
        expect(composers.length).toBe(2);
        expect(composers[0]?.name).toBe('Artist 3');
        expect(composers[1]?.name).toBe('Composer 3');
      });
    });

    describe('sort', () => {
      it('should sort by composer ASC', async () => {
        const { data } = await userApi.listTrackComposers({
          sortField: ComposerSortFieldEnum.composer,
          sortDirection: SortDirectionEnum.asc,
        });
        const { composers, total } = data || { composers: [], total: 0 };
        expect(total).toBe(10);
        expect(composers.length).toBe(10);
        expect(composers[0]?.name).toBe('Artist 1');
        expect(composers[1]?.name).toBe('Artist 2');
        expect(composers[2]?.name).toBe('Artist 3');
        expect(composers[3]?.name).toBe('Composer 1');
        expect(composers[4]?.name).toBe('Composer 2');
        expect(composers[5]?.name).toBe('Composer 3');
        expect(composers[6]?.name).toBe('Composer 4');
        expect(composers[7]?.name).toBe('Composer 5');
        expect(composers[8]?.name).toBe('Composer 6');
        expect(composers[9]?.name).toBe('Composer 7');
      });

      it('should sort by composer DESC', async () => {
        const { data } = await userApi.listTrackComposers({
          sortField: ComposerSortFieldEnum.composer,
          sortDirection: SortDirectionEnum.desc,
        });
        const { composers, total } = data || { composers: [], total: 0 };
        expect(total).toBe(10);
        expect(composers.length).toBe(10);
        expect(composers[0]?.name).toBe('Composer 7');
        expect(composers[1]?.name).toBe('Composer 6');
        expect(composers[2]?.name).toBe('Composer 5');
        expect(composers[3]?.name).toBe('Composer 4');
        expect(composers[4]?.name).toBe('Composer 3');
        expect(composers[5]?.name).toBe('Composer 2');
        expect(composers[6]?.name).toBe('Composer 1');
        expect(composers[7]?.name).toBe('Artist 3');
        expect(composers[8]?.name).toBe('Artist 2');
        expect(composers[9]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all composers', async () => {
      const { data } = await userApi.listTrackComposers();
      const { composers, total } = data || { composers: [], total: 0 };
      expect(total).toBe(10);
      expect(composers.length).toBe(10);
    });

    it('should paginate results', async () => {
      const { data } = await userApi.listTrackComposers({ offset: 0, limit: 4 });
      const { composers, total } = data || { composers: [], total: 0 };
      expect(total).toBe(10);
      expect(composers.length).toBe(4);
      expect(composers[0]?.name).toBe('Artist 1');
      expect(composers[1]?.name).toBe('Artist 2');
      expect(composers[2]?.name).toBe('Artist 3');
      expect(composers[3]?.name).toBe('Composer 1');
      const { data: data2 } = await userApi.listTrackComposers({ offset: 4, limit: 4 });
      const { composers: composers2, total: total2 } = data2 || { composers: [], total: 0 };
      expect(total2).toBe(10);
      expect(composers2.length).toBe(4);
      expect(composers2[0]?.name).toBe('Composer 2');
      expect(composers2[1]?.name).toBe('Composer 3');
      expect(composers2[2]?.name).toBe('Composer 4');
      expect(composers2[3]?.name).toBe('Composer 5');
      const { data: data3 } = await userApi.listTrackComposers({ offset: 8, limit: 4 });
      const { composers: composers3, total: total3 } = data3 || { composers: [], total: 0 };
      expect(total3).toBe(10);
      expect(composers3.length).toBe(2);
      expect(composers3[0]?.name).toBe('Composer 6');
      expect(composers3[1]?.name).toBe('Composer 7');
    });
  });
});
