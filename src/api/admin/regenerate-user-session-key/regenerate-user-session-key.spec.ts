import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, api, createAdminApi, createUserApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/regenerate-user-session-key', () => {
  const deleteAccounts: number[] = [];
  let adminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  afterAll(async () => {
    await adminApi.deleteTestAccounts(deleteAccounts);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/admin/regenerate-user-session-key`, {
        params: {
          query: {
            id: 1,
          },
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
      const { error } = await nonAdminApi.regenerateUserSessionKey(2);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.regenerateUserSessionKey(0);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should generate new user session key', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error, data } = await adminApi.regenerateUserSessionKey(account.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify
      const { error: error2 } = await accountApi.listRootPaths();
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      deleteAccounts.push(account.id);
    });
  });
});
