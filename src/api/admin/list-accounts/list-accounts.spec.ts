import { ADMIN_USERNAME, AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/list-accounts', () => {
  let adminApi: AdminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/admin/list-accounts`, {
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
      const { error } = await nonAdminApi.listAccounts();
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list accounts', async () => {
      const { error, data } = await adminApi.listAccounts();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.accounts.length).toBeGreaterThan(0);
      const admin = data?.accounts.find((user) => user.username === ADMIN_USERNAME);
      expect(admin).toBeDefined();
      expect(admin?.roles).toContain('admin');
      const normal = data?.accounts.find((user) => user.username === USER_USERNAME);
      expect(normal).toBeDefined();
      expect(normal?.roles).toContain('user');
    });
  });
});
