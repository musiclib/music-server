import { ADMIN_PASSWORD, ADMIN_USERNAME, api } from './test-helper';
import { UserRoleEnum } from './types/api-schema';
import { expect } from '@jest/globals';
import { guestApi } from './test-helper.api.guest';

type RequestParams = {
  header: {
    Authorization: string;
  };
};

async function createAccount(params: RequestParams, newUsername: string, newPassword: string, roles: UserRoleEnum[]) {
  return api.POST(`/api/admin/create-account`, {
    body: {
      username: newUsername,
      password: newPassword,
      roles,
    },
    params,
  });
}

async function createRootPath(params: RequestParams, accountId: number, rootPath: string) {
  return api.POST(`/api/admin/create-root-path`, {
    body: {
      rootPath,
    },
    params: {
      ...params,
      query: {
        id: accountId,
      },
    },
  });
}

async function deleteAccount(params: RequestParams, accountId: number) {
  return api.DELETE(`/api/admin/delete-account`, {
    params: {
      ...params,
      query: {
        id: accountId,
      },
    },
  });
}

async function deleteRootPath(params: RequestParams, rootPathId: number) {
  return api.DELETE(`/api/admin/delete-root-path`, {
    params: {
      ...params,
      query: {
        id: rootPathId,
      },
    },
  });
}

async function getIndexerConfiguration(params: RequestParams) {
  return api.GET(`/api/admin/indexer-configuration`, {
    params,
  });
}

async function listAccounts(params: RequestParams) {
  return api.GET(`/api/admin/list-accounts`, {
    params,
  });
}

async function listIndexerLogs(params: RequestParams) {
  return api.GET(`/api/admin/list-indexer-logs`, {
    params,
  });
}

async function listRootPaths(params: RequestParams) {
  return api.GET(`/api/admin/list-root-paths`, {
    params,
  });
}

async function regenerateMasterSessionKey(params: RequestParams) {
  return api.POST(`/api/admin/regenerate-master-session-key`, {
    params,
  });
}

async function regenerateUserSessionKey(params: RequestParams, accountId: number) {
  return api.POST(`/api/admin/regenerate-user-session-key`, {
    params: {
      ...params,
      query: {
        id: accountId,
      },
    },
  });
}

async function resetUserPassword(params: RequestParams, accountId: number, newPassword: string) {
  return api.POST(`/api/admin/reset-user-password`, {
    body: {
      newPassword,
    },
    params: {
      ...params,
      query: {
        id: accountId,
      },
    },
  });
}

async function setIndexerStatus(params: RequestParams, enabled: boolean) {
  return api.PATCH(`/api/admin/set-indexer-status`, {
    body: {
      enabled,
    },
    params,
  });
}

async function updateRootPath(params: RequestParams, rootPathId: number, newPath: string) {
  return api.PATCH(`/api/admin/update-root-path`, {
    body: {
      newPath,
    },
    params: {
      ...params,
      query: {
        id: rootPathId,
      },
    },
  });
}

async function updateUserRoles(params: RequestParams, accountId: number, roles: UserRoleEnum[]) {
  return api.PATCH(`/api/admin/update-user-roles`, {
    body: {
      roles,
    },
    params: {
      ...params,
      query: {
        id: accountId,
      },
    },
  });
}

export type AdminApi = {
  createAccount: (newUsername: string, newPassword: string, roles: UserRoleEnum[]) => ReturnType<typeof createAccount>;
  createRootPath: (accountId: number, rootPath: string) => ReturnType<typeof createRootPath>;
  deleteAccount: (accountId: number) => ReturnType<typeof deleteAccount>;
  deleteRootPath: (rootPathId: number) => ReturnType<typeof deleteRootPath>;
  getIndexerConfiguration: () => ReturnType<typeof getIndexerConfiguration>;
  listAccounts: () => ReturnType<typeof listAccounts>;
  listIndexerLogs: () => ReturnType<typeof listIndexerLogs>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  regenerateMasterSessionKey: () => ReturnType<typeof regenerateMasterSessionKey>;
  regenerateUserSessionKey: (accountId: number) => ReturnType<typeof regenerateUserSessionKey>;
  resetUserPassword: (accountId: number, newPassword: string) => ReturnType<typeof resetUserPassword>;
  setIndexerStatus: (enabled: boolean) => ReturnType<typeof setIndexerStatus>;
  updateRootPath: (rootPathId: number, newPath: string) => ReturnType<typeof updateRootPath>;
  updateUserRoles: (accountId: number, roles: UserRoleEnum[]) => ReturnType<typeof updateUserRoles>;
};

/**
 * Creates an authenticated admin API client with the provided username and password or
 * the default admin user.
 * @param {string | undefined} username Optional username for the admin account. Defaults to the default admin username.
 * @param {string | undefined} password Optional password for the admin account. Defaults to the default admin password.
 * @returns {Promise<AdminApi>} Object with shortcut and helper functions for Admin APIs using a session
 * token of the provided credentials.
 */
export async function createAdminApi(username?: string, password?: string): Promise<AdminApi> {
  const session = await guestApi.createSession(username || ADMIN_USERNAME, password || ADMIN_PASSWORD);
  expect(session.error).toBeUndefined();
  expect(session.data?.success).toBe(true);
  expect(session.data?.jwtToken).toBeDefined();
  const jwtToken = session.data?.jwtToken;
  const params = {
    header: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  const adminApis = {
    async createAccount(newUsername: string, newPassword: string, roles: UserRoleEnum[]) {
      return createAccount(params, newUsername, newPassword, roles);
    },
    async createRootPath(accountId: number, rootPath: string) {
      return createRootPath(params, accountId, rootPath);
    },
    async deleteAccount(accountId: number) {
      return deleteAccount(params, accountId);
    },
    async deleteRootPath(rootPathId: number) {
      return deleteRootPath(params, rootPathId);
    },
    async getIndexerConfiguration() {
      return getIndexerConfiguration(params);
    },
    async listAccounts() {
      return listAccounts(params);
    },
    async listIndexerLogs() {
      return listIndexerLogs(params);
    },
    async listRootPaths() {
      return listRootPaths(params);
    },
    async regenerateMasterSessionKey() {
      return regenerateMasterSessionKey(params);
    },
    async regenerateUserSessionKey(accountId: number) {
      return regenerateUserSessionKey(params, accountId);
    },
    async resetUserPassword(accountId: number, newPassword: string) {
      return resetUserPassword(params, accountId, newPassword);
    },
    async setIndexerStatus(enabled: boolean) {
      return setIndexerStatus(params, enabled);
    },
    async updateRootPath(rootPathId: number, newPath: string) {
      return updateRootPath(params, rootPathId, newPath);
    },
    async updateUserRoles(accountId: number, roles: UserRoleEnum[]) {
      return updateUserRoles(params, accountId, roles);
    },
  };

  const helpers = {
    async createTestAccount(credentials?: { username?: string; password?: string; roles: UserRoleEnum[] }) {
      const accountUsername = credentials?.username || `testuser-${Date.now()}`;
      const accountPassword = credentials?.password || `testpassword-${Date.now()}`;
      const accountRoles = credentials?.roles || [UserRoleEnum.user];
      await adminApis.createAccount(accountUsername, accountPassword, accountRoles);
      const { data } = await adminApis.listAccounts();
      const account = data?.accounts.find((user) => user.username === accountUsername);
      if (!account) {
        throw new Error('No account found');
      }
      return {
        id: account.id,
        username: accountUsername,
        password: accountPassword,
        roles: accountRoles,
      };
    },
    async deleteTestAccounts(accountIds: number[]) {
      for (let i = 0; i < accountIds.length; i += 1) {
        const accountId = accountIds[i];
        if (accountId) {
          // eslint-disable-next-line no-await-in-loop
          await adminApis.deleteAccount(accountId);
        }
      }
    },
    async extraAdminsCleared() {
      const accounts = await adminApis.listAccounts();
      const adminUsers = accounts.data?.accounts.filter((user) => user.roles.includes(UserRoleEnum.admin));
      if (adminUsers?.length === 1) {
        return true;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      return helpers.extraAdminsCleared();
    },
  };
  return {
    ...adminApis,
    ...helpers,
  };
}
