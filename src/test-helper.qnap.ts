import { ADMIN_PASSWORD, ADMIN_USERNAME } from './test-helper';
import { components, paths } from './types/api-schema';
import createClient, { Middleware } from 'openapi-fetch';
import xml2js from 'xml2js';

const xmlInterceptor: Middleware = {
  async onResponse({ response }) {
    const { body, ...resOptions } = response;
    const bodyData = await body?.getReader().read();
    const bodyText = bodyData ? new TextDecoder('utf-8').decode(bodyData.value) : '';
    if (bodyText.startsWith('<?xml')) {
      const parsedBody = bodyText ? await xml2js.parseStringPromise(bodyText, { explicitArray: false }) : null;
      return new Response(parsedBody ? JSON.stringify(parsedBody.QDocRoot) : body, { ...resOptions, status: 200 });
    }
    return new Response(bodyText, { ...resOptions, status: 200 });
  },
  async onError({ error }) {
    // wrap errors thrown by fetch
    return new Error('Oops, fetch failed', { cause: error });
  },
};

export const api: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});
api.use(xmlInterceptor);

type RequestParams = {
  query: {
    sid: string;
  };
};

type ListMediaQueryDto = components['schemas']['QnapMediaListQueryDto'];

async function listMedia(params: RequestParams, filters: ListMediaQueryDto, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/musicstation/api/medialist_api.php', {
    query: {
      ...filters,
      offset: offset || 0,
      limit: limit || 100000,
      ...params.query,
    },
  });
  const xml = data ? await xml2js.parseStringPromise(data) : null;
  return {
    error,
    data: xml,
  };
}

export type QnapApi = {
  listMedia(filters: ListMediaQueryDto, offset?: number, limit?: number): ReturnType<typeof listMedia>;
};

/**
 * Creates an authenticated QNAP API client with the provided username and password or the default admin user.
 * @param {string | undefined} username Optional username for the account. Defaults to the default admin username.
 * @param {string | undefined} password Optional password for the account. Defaults to the default admin password.
 * @returns {Promise<QnapApi>} Object with shortcut and helper functions for QNAP
 * APIs using a session token of the provided credentials.
 */
export async function createQnapApi(username?: string, password?: string): Promise<QnapApi> {
  // do the sign in
  type QnapAuthLoginDto = components['schemas']['QnapAuthLoginDto'];

  const signinResponse = await api.GET(`/cgi-bin/authLogin.cgi`, {
    query: {
      user: username || ADMIN_USERNAME,
      password: Buffer.from(password || ADMIN_PASSWORD).toString('base64'),
    },
  });
  if (!signinResponse?.data) {
    throw new Error('Failed to sign in to QNAP API');
  }
  const data = signinResponse.data as QnapAuthLoginDto;
  const sid = data.authSid;
  const authParams = {
    query: {
      sid,
    },
  };
  return {
    async listMedia(filters: ListMediaQueryDto, offset?: number, limit?: number) {
      return listMedia(authParams, filters, offset, limit);
    },
  };
}
