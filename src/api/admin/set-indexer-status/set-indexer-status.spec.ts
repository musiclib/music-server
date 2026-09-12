import { AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/set-indexer-status', () => {
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PATCH(`/api/admin/set-indexer-status`, {
        body: {
          enabled: true,
        },
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
      const { error } = await nonAdminApi.setIndexerStatus(true);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing enabled value', async () => {
      const { error } = await adminApi.setIndexerStatus(undefined as unknown as boolean);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ENABLED_ERROR);
    });
  });

  describe('success', () => {
    it('should change status', async () => {
      const before = await adminApi.getIndexerConfiguration();
      await adminApi.setIndexerStatus(!before.data?.configuration.isEnabled);
      const after = await adminApi.getIndexerConfiguration();
      expect(after.data?.configuration.isEnabled).toBe(!before.data?.configuration.isEnabled);
      await adminApi.setIndexerStatus(true);
    });
  });
});
