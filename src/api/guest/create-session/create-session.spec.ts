import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createAdminApi, guestApi } from '../../../test-helper';

describe('/api/guest/create-session', () => {
  const deleteAccounts: number[] = [];
  let adminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  afterAll(async () => {
    await adminApi.deleteTestAccounts(deleteAccounts);
  });

  describe('errors', () => {
    it('should reject missing username', async () => {
      const { error } = await guestApi.createSession('', 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid username length', async () => {
      const { error } = await guestApi.createSession('x'.repeat(256), 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing password', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await guestApi.createSession(testUsername, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await guestApi.createSession(testUsername, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await guestApi.createSession(testUsername, 'password', 'invalid' as unknown as number);
      expect(error?.message).toContain(ErrorCodes.INVALID_EXPIRES_AT_ERROR);
    });

    it('should reject negative expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await guestApi.createSession(testUsername, 'password', -1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });

    it('should reject too-long expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await guestApi.createSession(testUsername, 'password', 65000);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });
  });

  describe('success', () => {
    it('should create session', async () => {
      const account = await adminApi.createTestAccount();
      const { error, data } = await guestApi.createSession(account.username, account.password);
      expect(error).toBeUndefined();
      expect(data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
