import { AdminApi, USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/admin/create-root-path', () => {
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
      const newRootPath = join(tmpdir(), `test-guest-create-unauthorized-access-${Date.now()}`);
      const { error } = await api.POST(`/api/admin/create-root-path`, {
        body: {
          rootPath: newRootPath,
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
      const newRootPath = join(tmpdir(), `test-user-create-unauthorized-access-${Date.now()}`);
      const nonAdminApi = await createAdminApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAdminApi.createRootPath(1, newRootPath);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await adminApi.createRootPath(0, tmpdir());
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject invalid path', async () => {
      const invalidPath = join(tmpdir(), `test-create-invalid-${Date.now()}`);
      const { error } = await adminApi.createRootPath(1, invalidPath);
      expect(error?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    });
  });

  describe('success', () => {
    it('should create a new root path for an account', async () => {
      const account = await adminApi.createTestAccount();
      const originalRootPath = join(tmpdir(), `test-new-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { data } = await adminApi.createRootPath(account.id, originalRootPath);
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await adminApi.listRootPaths();
      const rootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(rootPath).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
