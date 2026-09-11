import { ADMIN_PASSWORD, ADMIN_USERNAME } from './test-helper';
import { components, paths } from './types/api-schema';
import createClient, { Middleware } from 'openapi-fetch';
import xml2js from 'xml2js';

const xmlInterceptor: Middleware = {
  async onResponse({ response }) {
    if (!response.body) {
      return response;
    }
    const bodyBuffer = await response.arrayBuffer();
    const bodyText = new TextDecoder('utf-8').decode(bodyBuffer);
    const isXml = /^\uFEFF?\s*<\?xml\b/i.test(bodyText);
    if (!isXml) {
      return new Response(bodyBuffer, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    const parsedBody = await xml2js.parseStringPromise(bodyText, {
      explicitArray: false,
    });
    // Single-item responses are parsed as objects.
    if (parsedBody?.QDocRoot?.datas?.data && !Array.isArray(parsedBody.QDocRoot.datas.data)) {
      parsedBody.QDocRoot.datas.data = [parsedBody.QDocRoot.datas.data];
    }
    const jsonBody = parsedBody?.QDocRoot ? JSON.stringify(parsedBody.QDocRoot) : '';
    const headers = new Headers(response.headers);
    headers.set('content-type', 'application/json');
    return new Response(jsonBody, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
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

type ListMediaQueryDto =
  | components['schemas']['QnapMediaListBucketQueryDto']
  | components['schemas']['QnapMediaListGeneralQueryDto']
  | components['schemas']['QnapMediaListRandomQueryDto'];

async function listMedia(params: RequestParams, filters: ListMediaQueryDto, currpage?: number, pagesize?: number) {
  return api.POST('/musicstation/api/medialist_api.php', {
    params: {
      query: {
        ...filters,
        ...params.query,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkid: (filters as any)?.linkid?.toString(),
        currpage: currpage || 1,
        pagesize: pagesize || 100000,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
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
  const clientId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const signinResponse = await api.GET(`/cgi-bin/authLogin.cgi`, {
    params: {
      query: {
        client_agent: 'jest test',
        client_app: 'Qmusic',
        client_id: clientId,
        force_to_check_2sv: 0,
        pwd: Buffer.from(password || ADMIN_PASSWORD).toString('base64'),
        remme: 1,
        serviceKey: 1,
        service: 1,
        user: username || ADMIN_USERNAME,
      },
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
