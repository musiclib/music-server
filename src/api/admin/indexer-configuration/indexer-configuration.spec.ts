import { AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/indexer-configuration', () => {
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/admin/indexer-configuration`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAdminApi = await createAdminApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAdminApi.getIndexerConfiguration();
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should get the indexer configuration', async () => {
      const { error, data } = await adminApi.getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });

    it('should get the latest indexer configuration', async () => {
      const { error, data } = await adminApi.getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      await adminApi.setIndexerStatus(false);
      const { data: data2 } = await adminApi.getIndexerConfiguration();
      expect(data2?.success).toBe(true);
      expect(data2?.configuration.id).toBeGreaterThan(data?.configuration.id ?? 0);
      await adminApi.setIndexerStatus(true);
    });
  });
});
