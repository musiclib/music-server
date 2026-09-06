import { ADMIN_PASSWORD, ADMIN_USERNAME, api } from './test-helper';
import {
  SmartPlaylistConjugalEnum,
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
  components,
} from './types/api-schema';
import crypto from 'node:crypto';

type AlbumFilter = {
  artist?: string;
  composer?: string;
  genre?: string;
};

type ArtistFilter = {
  genre?: string;
};

type ComposerFilter = {
  genre?: string;
};

type SongFilter = {
  album?: string;
  album_artist?: string;
  composer?: string;
  genre?: string;
  genre_filter?: string;
};

type SynologyEntryNewPinItemDto = components['schemas']['SynologyEntryNewPinItemDto'];

type RequestParams = {
  header: {
    cookie: string;
  };
};

export type PlaylistContainerItem =
  | { album: string; album_artist: string }
  | { artist: string }
  | { composer: string }
  | { genre: string };

export function encryptSynologyCredentials(username: string, password: string, publicKeyPem: string) {
  const plaintext = `account=${username}&passwd=${password}`;
  const publicKeyData = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
  const publicKey = crypto.createPublicKey({
    key: publicKeyData,
    format: 'pem',
    type: 'spki',
  });
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(plaintext, 'utf8'),
  );
  return encrypted.toString('base64');
}

async function addFavorite(params: RequestParams, items: SynologyEntryNewPinItemDto[]) {
  return api.POST('/webapi/entry.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Pin,
      method: SynologyMethodEnum.pin,
      version: 1,
      items,
    },
    params,
  });
}

async function search(params: RequestParams, keyword: string) {
  return api.POST('/webapi/AudioStation/search.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Search,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      keyword,
    },
    params,
  });
}

async function listFolders(params: RequestParams, id?: string, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/folder.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Folder,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params,
  });
}

async function listDefaultGenres(params: RequestParams, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/genre.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Genre,
      method: SynologyMethodEnum.list_default_genre,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params,
  });
}

async function listGenres(params: RequestParams, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/genre.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Genre,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params,
  });
}

async function listComposers(params: RequestParams, filters: ComposerFilter, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/composer.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Composer,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params,
  });
}

async function listAlbums(params: RequestParams, filters: AlbumFilter, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/album.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Album,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params,
  });
}

async function listArtists(params: RequestParams, filters: ArtistFilter, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/artist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Artist,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params,
  });
}

async function listSongs(params: RequestParams, filters: SongFilter, offset?: number, limit?: number) {
  return api.POST('/webapi/AudioStation/song.cgi', {
    body: {
      additional: 'avg_rating',
      api: SynologyApiEnum.SYNO_AudioStation_Song,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      ...filters,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params,
  });
}

async function retrievePlaylistInfo(params: RequestParams, id: string) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.getinfo,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
    },
    params,
  });
}

async function listPlaylists(params: RequestParams) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
    },
    params,
  });
}

async function createPlaylist(
  params: RequestParams,
  name: string,
  type: 'normal' | 'smart',
  conj_rule?: SmartPlaylistConjugalEnum,
  rules_json?: string,
) {
  const method = type === 'normal' ? SynologyMethodEnum.create : SynologyMethodEnum.createsmart;
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method,
      version: 1,
      library: SynologyLibraryEnum.all,
      name,
      ...(type === 'smart' ? { conj_rule, rules_json } : {}),
    },
    params,
  });
}

async function updatePlaylist(
  params: RequestParams,
  id: string,
  name: string,
  type: 'normal' | 'smart',
  conj_rule?: SmartPlaylistConjugalEnum,
  rules_json?: string,
) {
  const method = type === 'normal' ? SynologyMethodEnum.rename : SynologyMethodEnum.updatesmart;
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
      ...(type === 'smart' ? { name } : { new_name: name }),
      ...(type === 'smart' ? { conj_rule, rules_json } : {}),
    },
    params,
  });
}

async function addItemToPlaylist(params: RequestParams, playlistId: string, items: (number | string)[]) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
      offset: -1,
    },
    params,
  });
}

async function addContainerToPlaylist(params: RequestParams, playlistId: string, item: PlaylistContainerItem) {
  return api.POST('/webapi/entry.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.add_track,
      version: 1,
      id: playlistId,
      ...item,
    },
    params,
  });
}

async function removeItemFromPlaylist(params: RequestParams, playlistId: string, offset: number, limit?: number) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: '',
      offset,
      limit: limit || 1,
    },
    params,
  });
}

async function movePlaylistItems(
  params: RequestParams,
  playlistId: string,
  items: (number | string)[],
  offset: number,
) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
      offset,
    },
    params,
  });
}

async function getPlaylistItems(params: RequestParams, playlistId: string) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.getsonginfo,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
    },
    params,
  });
}

async function deletePlaylist(params: RequestParams, playlistId: string) {
  return api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.delete,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
    },
    params,
  });
}

async function createStation(
  params: RequestParams,
  container: 'User defined' | 'My favorite',
  title: string,
  desc: string,
  url: string,
  offset = -1,
) {
  return api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
      method: SynologyMethodEnum.updateradios,
      version: 1,
      offset,
      limit: 0,
      radios_json: JSON.stringify([
        {
          title,
          url,
          desc,
        },
      ]),
    },
    params,
  });
}

async function getStreamId(params: RequestParams, stationId: string) {
  return api.POST('/webapi/AudioStation/proxy.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Proxy,
      method: SynologyMethodEnum.getstreamid,
      version: 1,
      id: stationId,
    },
    params,
  });
}

async function getStreamSongInfo(params: RequestParams, streamId: string) {
  return api.POST('/webapi/AudioStation/proxy.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Proxy,
      method: SynologyMethodEnum.getsonginfo,
      version: 1,
      // this value is transformed into a number so the posted payload mismatches the type
      // also this ID value is dependent on no other stream having been created, there currently
      // isn't a mechanism for fetching the actual ID which might be 2, 3 etc.
      stream_id: streamId as unknown as number,
    },
    params,
  });
}

async function listStationsInContainer(
  params: RequestParams,
  container: 'User defined' | 'My favorite' | 'SHOUTcast' | string,
) {
  return api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
      method: SynologyMethodEnum.list,
      version: 1,
      offset: 0,
      limit: 100000,
    },
    params,
  });
}

async function deleteStation(params: RequestParams, container: 'User defined' | 'My favorite', stationIndex: number) {
  return api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
      method: SynologyMethodEnum.updateradios,
      version: 1,
      offset: stationIndex,
      limit: 0,
      radios_json: JSON.stringify([
        {
          title: '',
          url: '',
          desc: '',
        },
      ]),
    },
    params,
  });
}

async function listRadioContainers(params: RequestParams) {
  return api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      method: SynologyMethodEnum.list,
      version: 1,
      offset: 0,
      limit: 100000,
    },
    params,
  });
}

async function deleteFavorite(params: RequestParams, items: number[]) {
  return api.POST('/webapi/entry.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Pin,
      method: SynologyMethodEnum.unpin,
      version: 1,
      items: JSON.stringify(items),
    },
    params,
  });
}

async function clearSessionToken(params: RequestParams) {
  return api.POST('/webapi/entry.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_API_Auth,
      method: SynologyMethodEnum.clearSessionToken,
      version: 1,
    },
    params,
  });
}

async function rateSongs(params: RequestParams, items: number[], rating: 0 | 1 | 2 | 3 | 4 | 5) {
  return api.POST('/webapi/AudioStation/song.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Song,
      method: SynologyMethodEnum.setrating,
      version: 1,
      id: items.map((id) => `music_${id}`).join(',') as unknown as number[],
      rating,
    },
    params,
  });
}

export type SynologyApi = {
  addContainerToPlaylist(playlistId: string, item: PlaylistContainerItem): ReturnType<typeof addContainerToPlaylist>;
  addFavorite(items: SynologyEntryNewPinItemDto[]): ReturnType<typeof addFavorite>;
  addItemToPlaylist(playlistId: string, items: (number | string)[]): ReturnType<typeof addItemToPlaylist>;
  clearSessionToken(): ReturnType<typeof clearSessionToken>;
  createPlaylist(
    name: string,
    type: 'normal' | 'smart',
    conj_rule?: SmartPlaylistConjugalEnum,
    rules_json?: string,
  ): ReturnType<typeof createPlaylist>;
  createStation(
    container: 'User defined' | 'My favorite',
    title: string,
    desc: string,
    url: string,
    offset?: number,
  ): ReturnType<typeof createStation>;
  deleteFavorite(items: number[]): ReturnType<typeof deleteFavorite>;
  deletePlaylist(playlistId: string): ReturnType<typeof deletePlaylist>;
  deleteStation(container: 'User defined' | 'My favorite', stationIndex: number): ReturnType<typeof deleteStation>;
  getPlaylistItems(playlistId: string): ReturnType<typeof getPlaylistItems>;
  getStreamId(stationId: string): ReturnType<typeof getStreamId>;
  getStreamSongInfo(streamId: string): ReturnType<typeof getStreamSongInfo>;
  listAlbums(filters: AlbumFilter, offset?: number, limit?: number): ReturnType<typeof listAlbums>;
  listArtists(filters: ArtistFilter, offset?: number, limit?: number): ReturnType<typeof listArtists>;
  listComposers(filters: ComposerFilter, offset?: number, limit?: number): ReturnType<typeof listComposers>;
  listDefaultGenres(offset?: number, limit?: number): ReturnType<typeof listDefaultGenres>;
  listFolders(id?: string, offset?: number, limit?: number): ReturnType<typeof listFolders>;
  listGenres(offset?: number, limit?: number): ReturnType<typeof listGenres>;
  listPlaylists(): ReturnType<typeof listPlaylists>;
  listRadioContainers(): ReturnType<typeof listRadioContainers>;
  listSongs(filters: SongFilter, offset?: number, limit?: number): ReturnType<typeof listSongs>;
  rateSongs(items: number[], rating: number): ReturnType<typeof rateSongs>;
  listStationsInContainer(
    container: 'User defined' | 'My favorite' | 'SHOUTcast' | string,
  ): ReturnType<typeof listStationsInContainer>;
  movePlaylistItems(
    playlistId: string,
    items: (number | string)[],
    offset: number,
  ): ReturnType<typeof movePlaylistItems>;
  removeItemFromPlaylist(playlistId: string, offset: number, limit?: number): ReturnType<typeof removeItemFromPlaylist>;
  retrievePlaylistInfo(id: string): ReturnType<typeof retrievePlaylistInfo>;
  search(keyword: string): ReturnType<typeof search>;
  updatePlaylist(
    id: string,
    name: string,
    type: 'normal' | 'smart',
    conj_rule?: SmartPlaylistConjugalEnum,
    rules_json?: string,
  ): ReturnType<typeof updatePlaylist>;
};

/**
 * Creates an authenticated Synology API client with the provided username and password or the default admin user.
 * @param {string | undefined} username Optional username for the account. Defaults to the default admin username.
 * @param {string | undefined} password Optional password for the account. Defaults to the default admin password.
 * @returns {Promise<SynologyApi>} Object with shortcut and helper functions for Synology
 * APIs using a session token of the provided credentials.
 */
export async function createSynologyApi(username?: string, password?: string): Promise<SynologyApi> {
  // get the encryption key
  const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
    body: {
      api: SynologyApiEnum.SYNO_API_Encryption,
      method: SynologyMethodEnum.getinfo,
      version: 1,
    },
  });
  const encryptionKey = encryptionKeyResponse?.data as components['schemas']['SynologyEntryCertificateResponseDto'];
  if (!encryptionKey?.data?.public_key?.length) {
    throw new Error(`Failed to get encryption key`);
  }
  // encrypt the payload
  const payload = encryptSynologyCredentials(
    username || ADMIN_USERNAME,
    password || ADMIN_PASSWORD,
    encryptionKey.data.public_key,
  );
  // do the sign in
  const signinResponse = await api.POST(`/webapi/entry.cgi`, {
    body: {
      __cIpHeRtExT: payload,
      client_time: encryptionKey.data.server_time,
    },
  });
  const signIn = signinResponse?.data as components['schemas']['SynologyEntrySignInResponseDto'];
  const sessionId = signIn.data.sid;
  const deviceId = signIn.data.did;
  const cookie = `id=${sessionId}; did=${deviceId}`;
  const params = {
    header: {
      cookie,
    },
  };

  return {
    async addContainerToPlaylist(playlistId: string, item: PlaylistContainerItem) {
      return addContainerToPlaylist(params, playlistId, item);
    },
    async addFavorite(items: SynologyEntryNewPinItemDto[]) {
      return addFavorite(params, items);
    },
    async addItemToPlaylist(playlistId: string, items: (number | string)[]) {
      return addItemToPlaylist(params, playlistId, items);
    },
    async clearSessionToken() {
      return clearSessionToken(params);
    },
    async createPlaylist(
      name: string,
      type: 'normal' | 'smart',
      conj_rule?: SmartPlaylistConjugalEnum,
      rules_json?: string,
    ) {
      return createPlaylist(params, name, type, conj_rule, rules_json);
    },
    async createStation(
      container: 'User defined' | 'My favorite',
      title: string,
      desc: string,
      url: string,
      offset = -1,
    ) {
      return createStation(params, container, title, desc, url, offset);
    },
    async deleteFavorite(items: number[]) {
      return deleteFavorite(params, items);
    },
    async deletePlaylist(playlistId: string) {
      return deletePlaylist(params, playlistId);
    },
    async deleteStation(container: 'User defined' | 'My favorite', stationIndex: number) {
      return deleteStation(params, container, stationIndex);
    },
    async getPlaylistItems(playlistId: string) {
      return getPlaylistItems(params, playlistId);
    },
    async getStreamId(stationId: string) {
      return getStreamId(params, stationId);
    },
    async getStreamSongInfo(streamId: string) {
      return getStreamSongInfo(params, streamId);
    },
    async listAlbums(filters: AlbumFilter, offset?: number, limit?: number) {
      return listAlbums(params, filters, offset, limit);
    },
    async listArtists(filters: ArtistFilter, offset?: number, limit?: number) {
      return listArtists(params, filters, offset, limit);
    },
    async listComposers(filters: ComposerFilter, offset?: number, limit?: number) {
      return listComposers(params, filters, offset, limit);
    },
    async listDefaultGenres(offset?: number, limit?: number) {
      return listDefaultGenres(params, offset, limit);
    },
    async listFolders(id?: string, offset?: number, limit?: number) {
      return listFolders(params, id, offset, limit);
    },
    async listGenres(offset?: number, limit?: number) {
      return listGenres(params, offset, limit);
    },
    async listPlaylists() {
      return listPlaylists(params);
    },
    async listRadioContainers() {
      return listRadioContainers(params);
    },
    async listSongs(filters: SongFilter, offset?: number, limit?: number) {
      return listSongs(params, filters, offset, limit);
    },
    async listStationsInContainer(container: 'User defined' | 'My favorite' | 'SHOUTcast' | string) {
      return listStationsInContainer(params, container);
    },
    async movePlaylistItems(playlistId: string, items: (number | string)[], offset: number) {
      return movePlaylistItems(params, playlistId, items, offset);
    },
    async rateSongs(items: number[], rating: 0 | 1 | 2 | 3 | 4 | 5) {
      return rateSongs(params, items, rating);
    },
    async removeItemFromPlaylist(playlistId: string, offset: number, limit?: number) {
      return removeItemFromPlaylist(params, playlistId, offset, limit);
    },
    async retrievePlaylistInfo(id: string) {
      return retrievePlaylistInfo(params, id);
    },
    async search(keyword: string) {
      return search(params, keyword);
    },
    async updatePlaylist(
      id: string,
      name: string,
      type: 'normal' | 'smart',
      conj_rule?: SmartPlaylistConjugalEnum,
      rules_json?: string,
    ) {
      return updatePlaylist(params, id, name, type, conj_rule, rules_json);
    },
  };
}
