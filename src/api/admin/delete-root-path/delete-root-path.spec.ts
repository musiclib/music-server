import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/admin/delete-root-path', () => {
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
      const { error } = await api.DELETE(`/api/admin/delete-root-path`, {
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
      const { error } = await nonAdminApi.deleteRootPath(1);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid path id', async () => {
      const { error } = await adminApi.deleteRootPath(1234567890);
      expect(error?.message[0]).toBe(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should delete a root path', async () => {
      const originalRootPath = join(tmpdir(), `test-delete-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const account = await adminApi.createTestAccount();
      const { error: error2 } = await adminApi.createRootPath(account.id, originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await adminApi.listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // delete it
      const { error: error3, data } = await adminApi.deleteRootPath(rootPath.id);
      expect(error3).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await adminApi.listRootPaths();
      const deletedRootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(deletedRootPath).toBeUndefined();
      deleteAccounts.push(account.id);
    });
  });
});
