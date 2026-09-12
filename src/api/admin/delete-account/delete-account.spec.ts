import { AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/delete-account', () => {
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/admin/delete-account`, {
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAdminApi = await createAdminApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAdminApi.deleteAccount(2);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.deleteAccount(0);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject only administrator', async () => {
      await adminApi.extraAdminsCleared();
      const users = await adminApi.listAccounts();
      const adminUser = users.data?.accounts.find((user) => user.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin account found');
      }
      const { error } = await adminApi.deleteAccount(adminUser.id);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });
  });

  describe('success', () => {
    it('should delete an account successfully', async () => {
      const account = await adminApi.createTestAccount();
      // delete it
      const { error, data } = await adminApi.deleteAccount(account.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const users = await adminApi.listAccounts();
      const deletedAccount = users.data?.accounts.find((user) => user.username === account.username);
      expect(deletedAccount).toBeUndefined();
    });
  });
});
