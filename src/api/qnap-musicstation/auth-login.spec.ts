import { api } from '../../test-helper.qnap';
import { components } from '../../types/api-schema';
import { describe, expect, it } from '@jest/globals';

describe('/cgi-bin/authLogin.cgi', () => {
  const clientId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  // let qnapApi: QnapApi;

  // beforeAll(async () => {
  //   qnapApi = await createQnapApi();
  // });

  describe('authentication', () => {
    it('should create session', async () => {
      const { error, data } = await api.GET(`/cgi-bin/authLogin.cgi`, {
        params: {
          query: {
            client_agent: 'jest test',
            client_app: 'Qmusic',
            client_id: clientId,
            force_to_check_2sv: 0,
            pwd: Buffer.from(process.env.DEFAULT_ADMIN_PASSWORD || 'admin').toString('base64'),
            remme: 1,
            serviceKey: 1,
            service: 1,
            user: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
          },
        },
      });
      expect(error).toBeUndefined();
      const typedData = data as components['schemas']['QnapAuthLoginDto'];
      expect(typedData?.authSid.length).toBeGreaterThan(0);
    });

    it('should reject invalid account username', async () => {
      const { data } = await api.GET(`/cgi-bin/authLogin.cgi`, {
        params: {
          query: {
            client_agent: 'jest test',
            client_app: 'Qmusic',
            client_id: clientId,
            force_to_check_2sv: 0,
            pwd: Buffer.from(process.env.DEFAULT_ADMIN_PASSWORD || 'admin').toString('base64'),
            remme: 1,
            serviceKey: 1,
            service: 1,
            user: 'invalid',
          },
        },
      });
      expect((data as unknown as { message: string[] }).message[0]).toBe('invalid-username-error');
    });

    it('should reject invalid account password', async () => {
      const { data } = await api.GET(`/cgi-bin/authLogin.cgi`, {
        params: {
          query: {
            client_agent: 'jest test',
            client_app: 'Qmusic',
            client_id: clientId,
            force_to_check_2sv: 0,
            pwd: Buffer.from('invalid').toString('base64'),
            remme: 1,
            serviceKey: 1,
            service: 1,
            user: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
          },
        },
      });
      expect((data as unknown as { message: string[] }).message[0]).toBe('invalid-password-error');
    });
  });
});
