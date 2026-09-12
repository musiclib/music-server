import { AdminApi, api, createAdminApi, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/user/list-root-paths', () => {
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
      const { error } = await api.GET(`/api/user/list-root-paths`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list root paths', async () => {
      const testPath1 = join(tmpdir(), `test-list-root-paths-1-${Date.now()}`);
      const testPath2 = join(tmpdir(), `test-list-root-paths-2-${Date.now()}`);
      mkdirSync(testPath1);
      mkdirSync(testPath2);
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      await accountApi.createRootPath(testPath1);
      await accountApi.createRootPath(testPath2);
      const { error, data } = await accountApi.listRootPaths();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.rootPaths.length).toBe(2);
      const expectedRootPaths = [testPath1, testPath2];
      for (let i = 0; i < expectedRootPaths.length; i += 1) {
        const expectedRootPath = expectedRootPaths[i];
        const match = data?.rootPaths.find((rootPath) => rootPath.rootPath === expectedRootPath);
        expect(match).toBeDefined();
      }
      deleteAccounts.push(account.id);
    });
  });
});
