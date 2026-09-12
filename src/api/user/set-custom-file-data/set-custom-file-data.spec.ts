import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe.skip('/api/user/set-custom-file-data', () => {
  const deleteCustomData: number[] = [];
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  afterAll(async () => {
    for (let i = 0, len = deleteCustomData.length; i < len; i += 1) {
      const id = deleteCustomData[i];
      if (id) {
        // eslint-disable-next-line no-await-in-loop
        await userApi.deleteCustomFileData(id);
      }
    }
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PUT(`/api/user/set-custom-file-data`, {
        body: {
          albumArtists: 'Custom albumArtists',
          albumTitle: 'Custom albumTitle',
          title: 'Custom title',
          artists: 'Custom artists',
          comment: 'Custom comment',
          composers: 'Custom composers',
          discNumber: 1111,
          duration: 2222,
          genres: 'Custom genres',
          trackNumber: 3333,
          year: 4444,
        },
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid file id', async () => {
      const { error } = await userApi.setCustomFileData(-1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILE_ID_ERROR);
    });

    it('should reject invalid album artists length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'a'.repeat(1001),
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_ARTISTS_LENGTH_ERROR);
    });

    it('should reject invalid album title length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'a'.repeat(1001),
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_TITLE_LENGTH_ERROR);
    });

    it('should reject invalid artists length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'a'.repeat(1001),
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR);
    });

    it('should reject invalid comment length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'a'.repeat(1001),
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMMENT_LENGTH_ERROR);
    });

    it('should reject invalid composers length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'a'.repeat(1001),
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR);
    });

    it('should reject invalid disc number', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1.2345,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_DISC_NUMBER_ERROR);
    });

    it('should reject invalid disc number range', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 20000,
        genres: 'Custom genres',
        trackNumber: 1,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR);
    });

    it('should reject invalid genres length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'a'.repeat(1001),
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRES_LENGTH_ERROR);
    });

    it('should reject invalid title length', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'a'.repeat(256),
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TITLE_LENGTH_ERROR);
    });

    it('should reject invalid track number range', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 2131230,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR);
    });

    it('should reject invalid year range', async () => {
      const { error } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 32230,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_YEAR_RANGE_ERROR);
    });
  });

  describe('success', () => {
    it.only('should create custom data for the file', async () => {
      const { error, data } = await userApi.setCustomFileData(1, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 9,
        genres: 'Custom genres',
        trackNumber: 7,
        year: 1950,
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the track
      const { data: trackData } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const track = trackData?.tracks.find((t) => t.id === 1);
      if (!track) {
        throw new Error('Track not found');
      }
      expect(track.albumArtists.map((artist) => artist.name).join(', ')).toBe('Custom albumArtists');
      expect(track.albumTitle).toBe('Custom albumTitle');
      expect(track.title).toBe('Custom title');
      expect(track.artists.map((artist) => artist.name).join(', ')).toBe('Custom artists');
      expect(track.comment).toBe('Custom comment');
      expect(track.composers.map((composer) => composer.name).join(', ')).toBe('Custom composers');
      expect(track.discNumber).toBe(9);
      expect(track.genres.map((genre) => genre.name).join(', ')).toBe('Custom genres');
      expect(track.trackNumber).toBe(7);
      expect(track.year).toBe(1950);
      deleteCustomData.push(1);
    });
  });
});
