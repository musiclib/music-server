import { AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/list-indexer-logs', () => {
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/admin/list-indexer-logs`, {
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
      const { error } = await nonAdminApi.listIndexerLogs();
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list indexer logs', async () => {
      const { error, data } = await adminApi.listIndexerLogs();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.logs.length).toBeGreaterThan(0);
    });
  });
});
