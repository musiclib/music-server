import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/update-user-roles', () => {
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
      const { error } = await api.PATCH(`/api/admin/update-user-roles`, {
        body: {
          roles: [UserRoleEnum.admin],
        },
        params: {
          query: {
            accountId: 1,
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
      const { error } = await nonAdminApi.updateUserRoles(1, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.updateUserRoles(0, [UserRoleEnum.user]);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject no roles', async () => {
      const account = await adminApi.createTestAccount();
      const { error: updateError } = await adminApi.updateUserRoles(account.id, []);
      expect(updateError?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid roles', async () => {
      const { error } = await adminApi.updateUserRoles(1, ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it(`should reject revoking only admin's role`, async () => {
      await adminApi.extraAdminsCleared();
      const users = await adminApi.listAccounts();
      const adminUser = users.data?.accounts.find((a) => a.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin user found');
      }
      const { error } = await adminApi.updateUserRoles(adminUser.id, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });
  });

  describe('success', () => {
    it('should update user roles', async () => {
      const username = `username-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.admin];
      const account = await adminApi.createTestAccount({ username, password, roles });
      // update it
      await adminApi.updateUserRoles(account.id, [UserRoleEnum.user]);
      // verify it
      const { data: updatedData } = await adminApi.listAccounts();
      const updatedAccount = updatedData?.accounts.find((a) => a.id === account.id);
      expect(updatedAccount).toBeDefined();
      expect(updatedAccount?.roles.length).toBe(1);
      expect(updatedAccount?.roles[0]).toBe(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });
  });
});
