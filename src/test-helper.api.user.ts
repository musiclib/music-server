import { USER_PASSWORD, USER_USERNAME, api } from './test-helper';
import { guestApi } from './test-helper.api.guest';
import { paths } from './types/api-schema';

type RequestParams = {
  header: {
    Authorization: string;
  };
};

async function createRootPath(params: RequestParams, rootPath: string) {
  return api.POST(`/api/user/create-root-path`, {
    body: {
      rootPath,
    },
    params,
  });
}

async function deleteRootPath(params: RequestParams, rootPathId: number) {
  return api.DELETE(`/api/user/delete-root-path`, {
    params: {
      ...params,
      query: {
        id: rootPathId,
      },
    },
  });
}

async function endSession(params: RequestParams) {
  return api.DELETE(`/api/user/end-session`, {
    params,
  });
}

type ListAlbumsQueryDto = paths['/api/user/list-albums']['get']['parameters']['query'];

async function listAlbums(params: RequestParams, query?: ListAlbumsQueryDto) {
  return api.GET(`/api/user/list-albums`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumsWithTracksQueryDto = paths['/api/user/list-albums-with-tracks']['get']['parameters']['query'];

async function listAlbumsWithTracks(params: RequestParams, query?: ListAlbumsWithTracksQueryDto) {
  return api.GET(`/api/user/list-albums-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumArtistsQueryDto = paths['/api/user/list-album-artists']['get']['parameters']['query'];

async function listAlbumArtists(params: RequestParams, query?: ListAlbumArtistsQueryDto) {
  return api.GET(`/api/user/list-album-artists`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumArtistsWithTracksQueryDto =
  paths['/api/user/list-album-artists-with-tracks']['get']['parameters']['query'];

async function listAlbumArtistsWithTracks(params: RequestParams, query?: ListAlbumArtistsWithTracksQueryDto) {
  return api.GET(`/api/user/list-album-artists-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

async function folderStructure(params: RequestParams) {
  return api.GET(`/api/user/folder-structure`, {
    params,
  });
}

async function listIndexerLogs(params: RequestParams) {
  return api.GET(`/api/user/list-indexer-logs`, {
    params,
  });
}

async function listRootPaths(params: RequestParams) {
  return api.GET(`/api/user/list-root-paths`, {
    params,
  });
}

type ListTrackArtistsQueryDto = paths['/api/user/list-track-artists']['get']['parameters']['query'];

async function listTrackArtists(params: RequestParams, query?: ListTrackArtistsQueryDto) {
  return api.GET(`/api/user/list-track-artists`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackArtistsWithTracksQueryDto =
  paths['/api/user/list-track-artists-with-tracks']['get']['parameters']['query'];

async function listTrackArtistsWithTracks(params: RequestParams, query?: ListTrackArtistsWithTracksQueryDto) {
  return api.GET(`/api/user/list-track-artists-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackComposersQueryDto = paths['/api/user/list-track-composers']['get']['parameters']['query'];

async function listTrackComposers(params: RequestParams, query?: ListTrackComposersQueryDto) {
  return api.GET(`/api/user/list-track-composers`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackComposersWithTracksQueryDto =
  paths['/api/user/list-track-composers-with-tracks']['get']['parameters']['query'];

async function listTrackComposersWithTracks(params: RequestParams, query?: ListTrackComposersWithTracksQueryDto) {
  return api.GET(`/api/user/list-track-composers-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackGenresQueryDto = paths['/api/user/list-track-genres']['get']['parameters']['query'];

async function listTrackGenres(params: RequestParams, query?: ListTrackGenresQueryDto) {
  return api.GET(`/api/user/list-track-genres`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackGenresWithTracksQueryDto = paths['/api/user/list-track-genres-with-tracks']['get']['parameters']['query'];

async function listTrackGenresWithTracks(params: RequestParams, query?: ListTrackGenresWithTracksQueryDto) {
  return api.GET(`/api/user/list-track-genres-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTracksQueryDto = paths['/api/user/list-tracks']['get']['parameters']['query'];

async function listTracks(params: RequestParams, query?: ListTracksQueryDto) {
  return api.GET(`/api/user/list-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

async function regenerateSessionKey(params: RequestParams) {
  return api.POST(`/api/user/regenerate-session-key`, {
    params,
  });
}

async function updatePassword(params: RequestParams, newPassword: string) {
  return api.POST(`/api/user/update-password`, {
    body: {
      newPassword,
    },
    params,
  });
}

export type UserApi = {
  createRootPath: (rootPath: string) => ReturnType<typeof createRootPath>;
  deleteRootPath: (rootPathId: number) => ReturnType<typeof deleteRootPath>;
  endSession: () => ReturnType<typeof endSession>;
  listAlbums: (query?: ListAlbumsQueryDto) => ReturnType<typeof listAlbums>;
  listAlbumsWithTracks: (query?: ListAlbumsWithTracksQueryDto) => ReturnType<typeof listAlbumsWithTracks>;
  listAlbumArtists: (query?: ListAlbumArtistsQueryDto) => ReturnType<typeof listAlbumArtists>;
  listAlbumArtistsWithTracks: (
    query?: ListAlbumArtistsWithTracksQueryDto,
  ) => ReturnType<typeof listAlbumArtistsWithTracks>;
  folderStructure: () => ReturnType<typeof folderStructure>;
  listIndexerLogs: () => ReturnType<typeof listIndexerLogs>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  listTrackArtists: (query?: ListTrackArtistsQueryDto) => ReturnType<typeof listTrackArtists>;
  listTrackArtistsWithTracks: (
    query?: ListTrackArtistsWithTracksQueryDto,
  ) => ReturnType<typeof listTrackArtistsWithTracks>;
  listTrackComposers: (query?: ListTrackComposersQueryDto) => ReturnType<typeof listTrackComposers>;
  listTrackComposersWithTracks: (
    query?: ListTrackComposersWithTracksQueryDto,
  ) => ReturnType<typeof listTrackComposersWithTracks>;
  listTrackGenres: (query?: ListTrackGenresQueryDto) => ReturnType<typeof listTrackGenres>;
  listTrackGenresWithTracks: (
    query?: ListTrackGenresWithTracksQueryDto,
  ) => ReturnType<typeof listTrackGenresWithTracks>;
  listTracks: (query?: ListTracksQueryDto) => ReturnType<typeof listTracks>;
  regenerateSessionKey: () => ReturnType<typeof regenerateSessionKey>;
  updatePassword: (newPassword: string) => ReturnType<typeof updatePassword>;
};

/**
 * Creates an authenticated user API client with the provided username and password or
 * the default user.
 * @param {string | undefined} username Optional username for the user account. Defaults to the default user username.
 * @param {string | undefined} password Optional password for the user account. Defaults to the default user password.
 * @returns {Promise<UserApi>} Object with shortcut functions for User APIs using a session token of from
 * the provided credentials.
 */
export async function createUserApi(username?: string, password?: string): Promise<UserApi> {
  const session = await guestApi.createSession(username || USER_USERNAME, password || USER_PASSWORD);
  const jwtToken = session.data?.jwtToken;
  const params = {
    header: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  return {
    async createRootPath(rootPath: string) {
      return createRootPath(params, rootPath);
    },
    async deleteRootPath(rootPathId: number) {
      return deleteRootPath(params, rootPathId);
    },
    async endSession() {
      return endSession(params);
    },
    async listAlbums(query?: ListAlbumsQueryDto) {
      return listAlbums(params, query);
    },
    async listAlbumsWithTracks(query?: ListAlbumsWithTracksQueryDto) {
      return listAlbumsWithTracks(params, query);
    },
    async listAlbumArtists(query?: ListAlbumArtistsQueryDto) {
      return listAlbumArtists(params, query);
    },
    async listAlbumArtistsWithTracks(query?: ListAlbumArtistsWithTracksQueryDto) {
      return listAlbumArtistsWithTracks(params, query);
    },
    async folderStructure() {
      return folderStructure(params);
    },
    async listIndexerLogs() {
      return listIndexerLogs(params);
    },
    async listRootPaths() {
      return listRootPaths(params);
    },
    async listTrackArtists(query?: ListTrackArtistsQueryDto) {
      return listTrackArtists(params, query);
    },
    async listTrackArtistsWithTracks(query?: ListTrackArtistsWithTracksQueryDto) {
      return listTrackArtistsWithTracks(params, query);
    },
    async listTrackComposers(query?: ListTrackComposersQueryDto) {
      return listTrackComposers(params, query);
    },
    async listTrackComposersWithTracks(query?: ListTrackComposersWithTracksQueryDto) {
      return listTrackComposersWithTracks(params, query);
    },
    async listTrackGenres(query?: ListTrackGenresQueryDto) {
      return listTrackGenres(params, query);
    },
    async listTrackGenresWithTracks(query?: ListTrackGenresWithTracksQueryDto) {
      return listTrackGenresWithTracks(params, query);
    },
    async listTracks(query?: ListTracksQueryDto) {
      return listTracks(params, query);
    },
    async regenerateSessionKey() {
      return regenerateSessionKey(params);
    },
    async updatePassword(newPassword: string) {
      return updatePassword(params, newPassword);
    },
  };
}
