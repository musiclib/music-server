import { SynologyApi, createSynologyApi } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { components } from 'src/types/api-schema';

describe('/webapi/AudioStation/composer.cgi', () => {
  let synologyApi: SynologyApi;

  async function listComposers(filters: Record<string, string>, offset?: number, limit?: number) {
    const { data, error } = await synologyApi.listComposers(filters, offset, limit);
    const typedData = data as components['schemas']['SynologyComposerResponseDto'];
    return {
      data: typedData,
      error,
      composers: typedData?.data.composers || [],
      total: typedData?.data.total || 0,
    };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
  });

  it('should list all composers with no filters', async () => {
    const { composers } = await listComposers({});
    expect(composers.length).toBe(10);
    expect(composers[0]?.name).toBe('Artist 1');
    expect(composers[1]?.name).toBe('Artist 2');
    expect(composers[2]?.name).toBe('Artist 3');
    expect(composers[3]?.name).toBe('Composer 1');
    expect(composers[4]?.name).toBe('Composer 2');
    expect(composers[5]?.name).toBe('Composer 3');
    expect(composers[6]?.name).toBe('Composer 4');
    expect(composers[7]?.name).toBe('Composer 5');
    expect(composers[8]?.name).toBe('Composer 6');
    expect(composers[9]?.name).toBe('Composer 7');
  });

  it('should paginate all composers with no filters', async () => {
    // page 1
    const { composers, total } = await listComposers({}, 0, 5);
    expect(total).toBe(10);
    expect(composers.length).toBe(5);
    expect(composers[0]?.name).toBe('Artist 1');
    expect(composers[1]?.name).toBe('Artist 2');
    expect(composers[2]?.name).toBe('Artist 3');
    expect(composers[3]?.name).toBe('Composer 1');
    expect(composers[4]?.name).toBe('Composer 2');
    // page 2
    const { composers: composers2, total: total2 } = await listComposers({}, 5, 5);
    expect(total2).toBe(10);
    expect(composers2.length).toBe(5);
    expect(composers2[0]?.name).toBe('Composer 3');
    expect(composers2[1]?.name).toBe('Composer 4');
    expect(composers2[2]?.name).toBe('Composer 5');
    expect(composers2[3]?.name).toBe('Composer 6');
    expect(composers2[4]?.name).toBe('Composer 7');
  });
});
