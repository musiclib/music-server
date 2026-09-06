import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/folder-structure', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/folder-structure`, {
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
    it('should return all root paths', async () => {
      const { data: rootPathData } = await userApi.listRootPaths();
      const { data } = await userApi.folderStructure();
      expect(data?.items.length).toBe(rootPathData?.rootPaths.length);
    });

    it('should return nested folder list', async () => {
      const { data } = await userApi.folderStructure();
      const root1 = data?.items?.[0];
      const root2 = data?.items?.[1];
      expect(data?.items.length).toBe(2);
      expect(root1?.children?.length).toBe(2);
      expect(root1?.children?.[0]?.folder).toBe('Artist 1');
      expect(root1?.children?.[0]?.children?.[0]?.folder).toBe('Album 1');
      expect(root1?.children?.[1]?.folder).toBe('Artist 2');
      expect(root1?.children?.[1]?.children?.[0]?.folder).toBe('Album 3');
      expect(root2?.children?.length).toBe(1);
      expect(root2?.children?.[0]?.folder).toBe('Artist 3');
      expect(root2?.children?.[0]?.children?.[0]?.folder).toBe('Album 4');
      expect(root2?.children?.[0]?.children?.[1]?.folder).toBe('Album 5');
    });

    it('should return file list', async () => {
      const { data } = await userApi.folderStructure();
      const root1 = data?.items?.[0];
      const root2 = data?.items?.[1];
      expect(data?.items.length).toBe(2);
      expect(root1?.children?.length).toBe(2); // root 1
      expect(root1?.children?.[0]?.folder).toBe('Artist 1');
      expect(root1?.children?.[0]?.children?.[0]?.folder).toBe('Album 1');
      expect(root1?.children?.[0]?.children?.[0]?.children?.[0]?.file).toBe('01 First Track.flac');
      expect(root1?.children?.[1]?.folder).toBe('Artist 2');
      expect(root1?.children?.[1]?.children?.[0]?.folder).toBe('Album 3');
      expect(root1?.children?.[1]?.children?.[0]?.children?.[0]?.file).toBe('01 First Track.m4a');
      expect(root2?.children?.length).toBe(1);
      expect(root2?.children?.[0]?.children?.length).toBe(2);
      expect(root2?.children?.[0]?.folder).toBe('Artist 3');
      expect(root2?.children?.[0]?.children?.[0]?.folder).toBe('Album 4');
      expect(root2?.children?.[0]?.children?.[0]?.children?.[0]?.file).toBe('01 First Track.mp3');
      expect(root2?.children?.[0]?.children?.[1]?.folder).toBe('Album 5');
      expect(root2?.children?.[0]?.children?.[1]?.children?.[0]?.file).toBe('01 First Track.ogg');
    });
  });
});
