import { ADMIN_PASSWORD, AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/update-user-roles', () => {
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
      const { error } = await api.PATCH(`/api/admin/update-user-roles`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
          roles: [UserRoleEnum.admin],
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
      const { error } = await nonAdminApi.updateUserRoles(1, ADMIN_PASSWORD, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.updateUserRoles(0, ADMIN_PASSWORD, [UserRoleEnum.user]);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject no roles', async () => {
      const account = await adminApi.createTestAccount();
      const { error: updateError } = await adminApi.updateUserRoles(account.id, ADMIN_PASSWORD, []);
      expect(updateError?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid roles', async () => {
      const { error } = await adminApi.updateUserRoles(1, ADMIN_PASSWORD, ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it(`should reject revoking only admin's role`, async () => {
      await adminApi.extraAdminsCleared();
      const users = await adminApi.listAccounts();
      const adminUser = users.data?.accounts.find((a) => a.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin user found');
      }
      const { error } = await adminApi.updateUserRoles(adminUser.id, ADMIN_PASSWORD, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });

    it('should reject missing admin password', async () => {
      const { error } = await adminApi.updateUserRoles(1, '', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid admin password length', async () => {
      const { error } = await adminApi.updateUserRoles(1, 'x'.repeat(256), [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid admin password', async () => {
      const { error } = await adminApi.updateUserRoles(1, 'wrong-password', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });
  });

  describe('success', () => {
    it('should update user roles', async () => {
      const username = `username-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.admin];
      const account = await adminApi.createTestAccount({ username, password, roles });
      // update it
      await adminApi.updateUserRoles(account.id, ADMIN_PASSWORD, [UserRoleEnum.user]);
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
