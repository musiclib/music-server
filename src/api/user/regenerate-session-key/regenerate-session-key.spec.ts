import { AdminApi, api, createAdminApi, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/regenerate-session-key', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  afterAll(async () => {
    await adminApi.deleteTestAccounts(deleteAccounts);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/user/regenerate-session-key`, {
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
    it('should generate new user session key', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error, data } = await accountApi.regenerateSessionKey();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      const { error: error2 } = await accountApi.listRootPaths();
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      deleteAccounts.push(account.id);
    });
  });
});
