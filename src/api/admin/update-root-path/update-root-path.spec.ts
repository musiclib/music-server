import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, api, createAdminApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/admin/update-root-path', () => {
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
      const { error } = await api.PATCH(`/api/admin/update-root-path`, {
        body: {
          newPath: tmpdir(),
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
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAdminApi = await createAdminApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAdminApi.updateRootPath(1, tmpdir());
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid root path id', async () => {
      const { error } = await adminApi.updateRootPath(0, tmpdir());
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR);
    });

    it('should reject missing root path', async () => {
      const { error } = await adminApi.updateRootPath(1, '');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ROOT_PATH_ERROR);
    });

    it('should reject invalid root path', async () => {
      const invalidPath = join(tmpdir(), `test-update-invalid-${Date.now()}`);
      const nonexistentPath = join(tmpdir(), invalidPath);
      const { error } = await adminApi.updateRootPath(1, nonexistentPath);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    });
  });

  describe('success', () => {
    it('should update root path', async () => {
      const account = await adminApi.createTestAccount();
      const originalRootPath = join(tmpdir(), `test-update-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { error: error2 } = await adminApi.createRootPath(account.id, originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await adminApi.listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // update it
      const newRootPath = join(tmpdir(), `test-updated-root-path-${Date.now()}`);
      mkdirSync(newRootPath, { recursive: true });
      const { error: error3 } = await adminApi.updateRootPath(rootPath.id, newRootPath);
      expect(error3).toBeUndefined();
      // verify it
      const rootPathList2 = await adminApi.listRootPaths();
      const rootPath2 = rootPathList2.data?.rootPaths.find((path) => path.rootPath === newRootPath);
      expect(rootPath2).toBeDefined();
      expect(rootPath2?.id).toBe(rootPath?.id);
      expect(rootPath2?.rootPath).toBe(newRootPath);
      deleteAccounts.push(account.id);
    });
  });
});
