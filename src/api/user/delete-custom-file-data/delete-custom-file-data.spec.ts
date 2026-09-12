import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/delete-custom-file-data', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/user/delete-custom-file-data`, {
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
      const { error } = await userApi.deleteCustomFileData(-1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILE_ID_ERROR);
    });
  });

  describe('success', () => {
    it('should delete custom data for the file', async () => {
      // get the track information before deleting
      const { data: trackDataBeforeDelete } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const trackBeforeDelete = trackDataBeforeDelete?.tracks.find((t) => t.id === 1);
      if (!trackBeforeDelete) {
        throw new Error('Track not found before delete');
      }
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
      // confirm the track uses custom data
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
      // delete the data
      const { error: deleteError, data: deleteData } = await userApi.deleteCustomFileData(1);
      expect(deleteError).toBeUndefined();
      expect(deleteData?.success).toBe(true);
      // confirm the track no longer uses custom data
      const { data: trackDataAfterDelete } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const trackAfterDelete = trackDataAfterDelete?.tracks.find((t) => t.id === 1);
      if (!trackAfterDelete) {
        throw new Error('Track not found after delete');
      }
      expect(trackAfterDelete.albumArtists.map((artist) => artist.name).join(', ')).toBe(
        trackBeforeDelete.albumArtists.map((artist) => artist.name).join(', '),
      );
      expect(trackAfterDelete.albumTitle).toBe(trackBeforeDelete.albumTitle);
      expect(trackAfterDelete.title).toBe(trackBeforeDelete.title);
      expect(trackAfterDelete.artists.map((artist) => artist.name).join(', ')).toBe(
        trackBeforeDelete.artists.map((artist) => artist.name).join(', '),
      );
      expect(trackAfterDelete.comment).toBe(trackBeforeDelete.comment);
      expect(trackAfterDelete.composers.map((composer) => composer.name).join(', ')).toBe(
        trackBeforeDelete.composers.map((composer) => composer.name).join(', '),
      );
      expect(trackAfterDelete.discNumber).toBe(trackBeforeDelete.discNumber);
      expect(trackAfterDelete.genres.map((genre) => genre.name).join(', ')).toBe(
        trackBeforeDelete.genres.map((genre) => genre.name).join(', '),
      );
      expect(trackAfterDelete.trackNumber).toBe(trackBeforeDelete.trackNumber);
      expect(trackAfterDelete.year).toBe(trackBeforeDelete.year);
    });
  });
});
