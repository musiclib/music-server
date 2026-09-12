import { ADMIN_PASSWORD, AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/delete-account', () => {
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
      const { error } = await api.PATCH(`/api/admin/delete-account`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
        },
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
      const { error } = await nonAdminApi.deleteAccount(ADMIN_PASSWORD, 2);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.deleteAccount(ADMIN_PASSWORD, 0);
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
      const { error } = await adminApi.deleteAccount(ADMIN_PASSWORD, adminUser.id);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });

    it('should reject missing admin password', async () => {
      const account = await adminApi.createTestAccount();
      const { error } = await adminApi.deleteAccount('', account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid admin password length', async () => {
      const account = await adminApi.createTestAccount();
      const { error } = await adminApi.deleteAccount('x'.repeat(256), account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid admin password', async () => {
      const account = await adminApi.createTestAccount();
      const { error } = await adminApi.deleteAccount('wrong-password', account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
      deleteAccounts.push(account.id);
    });
  });

  describe('success', () => {
    it('should delete an account successfully', async () => {
      const account = await adminApi.createTestAccount();
      // delete it
      const { error, data } = await adminApi.deleteAccount(ADMIN_PASSWORD, account.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const users = await adminApi.listAccounts();
      const deletedAccount = users.data?.accounts.find((user) => user.username === account.username);
      expect(deletedAccount).toBeUndefined();
    });
  });
});
