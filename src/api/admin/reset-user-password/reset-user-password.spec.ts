import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, api, createAdminApi, guestApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/reset-user-password', () => {
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
      const { error } = await api.POST(`/api/admin/reset-user-password`, {
        body: {
          newPassword: 'testpassword',
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
      const { error } = await nonAdminApi.resetUserPassword(1, 'test-123');
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.resetUserPassword(0, 'new-password');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject missing password', async () => {
      const { error } = await adminApi.resetUserPassword(1, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const { error } = await adminApi.resetUserPassword(1, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    it('should reset user password', async () => {
      const account = await adminApi.createTestAccount();
      // reset their password
      const { data } = await adminApi.resetUserPassword(account.id, 'newpassword');
      expect(data?.success).toBe(true);
      // verify it
      const newSession = await guestApi.createSession(account.username, 'newpassword');
      expect(newSession.data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
