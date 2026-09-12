import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/list-indexer-logs', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-indexer-logs`, {
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

  describe('success', () => {
    it('should list indexer logs', async () => {
      const { error, data } = await userApi.listIndexerLogs();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.logs.length).toBeGreaterThan(0);
    });
  });
});
