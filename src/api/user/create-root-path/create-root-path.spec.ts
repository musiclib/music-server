import { AdminApi, api, createAdminApi, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/user/create-root-path', () => {
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
      const { error } = await api.POST(`/api/user/create-root-path`, {
        body: {
          rootPath: newRootPath,
        },
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid path', async () => {
      const invalidPath = join(tmpdir(), `test-create-invalid-${Date.now()}`);
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error } = await accountApi.createRootPath(invalidPath);
      expect(error?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
      deleteAccounts.push(account.id);
    });
  });

  describe('success', () => {
    it('should create a new root path for the account', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      // create the path
      const originalRootPath = join(tmpdir(), `test-new-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { data } = await accountApi.createRootPath(originalRootPath);
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await accountApi.listRootPaths();
      const rootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(rootPath).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
