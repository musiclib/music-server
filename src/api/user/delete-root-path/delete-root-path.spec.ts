import { AdminApi, api, createAdminApi, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/user/delete-root-path', () => {
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
      const { error } = await api.DELETE(`/api/user/delete-root-path`, {
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
  });

  describe('errors', () => {
    it('should reject invalid path id', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error } = await accountApi.deleteRootPath(1234567890);
      expect(error?.message[0]).toBe(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
      deleteAccounts.push(account.id);
    });
  });

  describe('success', () => {
    it('should delete a root path', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      // create a root path
      const originalRootPath = join(tmpdir(), `test-delete-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { error: error2 } = await accountApi.createRootPath(originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await accountApi.listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // delete it
      const { error: error3, data } = await accountApi.deleteRootPath(rootPath.id);
      expect(error3).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await accountApi.listRootPaths();
      const deletedRootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(deletedRootPath).toBeUndefined();
      deleteAccounts.push(account.id);
    });
  });
});
