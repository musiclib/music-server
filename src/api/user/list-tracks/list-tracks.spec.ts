import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { SortDirectionEnum, TrackSortFieldEnum } from '../../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-tracks', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-tracks`, {
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

  describe('errors', () => {
    it('should reject invalid addedAfter date', async () => {
      const { error } = await userApi.listTracks({ addedAfter: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await userApi.listTracks({ addedBefore: 'invalid-date' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    // it('should reject invalid artist', async () => {
    //   const { error } = await userApi.listTracks({ artist: [true as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTIST_ERROR);
    // });

    it('should reject invalid artist length', async () => {
      const { error } = await userApi.listTracks({ artist: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTIST_LENGTH_ERROR);
    });

    // it('should reject invalid composer', async () => {
    //   const { error } = await userApi.listTracks({ composer: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR);
    // });

    it('should reject invalid composer length', async () => {
      const { error } = await userApi.listTracks({ composer: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSER_LENGTH_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await userApi.listTracks({ filter: '' });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listTracks({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await userApi.listTracks({ genre: ['x'.repeat(300)] });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await userApi.listTracks({ offset: 0, limit: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listTracks({ offset: 0, limit: 1_000_000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listTracks({ offset: 0, limit: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid maxRating', async () => {
      const { error } = await userApi.listTracks({ maxRating: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_MAX_RATING_ERROR);
    });

    it('should reject invalid minRating', async () => {
      const { error } = await userApi.listTracks({ minRating: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_MIN_RATING_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listTracks({ offset: -1000 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listTracks({ offset: 'asdf' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listTracks({ sortDirection: 'invalid-direction' as SortDirectionEnum });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listTracks({ sortField: 'invalid-field' as unknown as TrackSortFieldEnum });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });

    it('should reject invalid year', async () => {
      const { error } = await userApi.listTracks({ year: 'never' as unknown as number });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_YEAR_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await userApi.listTracks({ genre: ['Rock'] });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(7);
        expect(tracks.length).toBe(7);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.genres.find((genre) => genre.name === 'Rock')).toBeDefined();
        }
      });

      it('should filter by artist', async () => {
        const { data } = await userApi.listTracks({ artist: ['Artist 3'] });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(10);
        expect(tracks.length).toBe(10);
        for (let i = 0; i < tracks.length; i += 1) {
          const pairedMatch = tracks[i]?.artists.some((item) => item.name.indexOf('Artist 3') > -1);
          expect(pairedMatch || tracks[i]?.artists.find((artist) => artist.name === 'Artist 3')).toBeDefined();
        }
      });

      it('should filter by composer', async () => {
        const { data } = await userApi.listTracks({ composer: ['Composer 4'] });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(7);
        expect(tracks.length).toBe(7);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.composers.find((composer) => composer.name === 'Composer 4')).toBeDefined();
        }
      });

      it('should filter by album', async () => {
        const { data } = await userApi.listTracks({ album: 'Album 4' });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(6);
        expect(tracks.length).toBe(6);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.albumTitle).toBe('Album 4');
        }
      });

      it('should filter by search term', async () => {
        const { data } = await userApi.listTracks({ filter: 'Fourth Track' });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(5);
        expect(tracks.length).toBe(5);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.title.startsWith('04 Fourth Track')).toBe(true);
        }
      });

      it('should filter by year', async () => {
        const { data } = await userApi.listTracks({ year: 2004 });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(4);
        expect(tracks.length).toBe(4);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.year).toBe(2004);
        }
      });
    });

    describe('sort', () => {
      it('should sort by album name ASC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.album,
          sortDirection: SortDirectionEnum.asc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => a.albumTitle.localeCompare(b.albumTitle));
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.albumTitle).toBe(sorted[i]?.albumTitle);
        }
      });

      it('should sort by album name DESC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.album,
          sortDirection: SortDirectionEnum.desc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => b.albumTitle.localeCompare(a.albumTitle));
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.albumTitle).toBe(sorted[i]?.albumTitle);
        }
      });

      it('should sort by year ASC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.year,
          sortDirection: SortDirectionEnum.asc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => a.year - b.year);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.year).toBe(sorted[i]?.year);
        }
      });

      it('should sort by year DESC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.year,
          sortDirection: SortDirectionEnum.desc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => b.year - a.year);
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.year).toBe(sorted[i]?.year);
        }
      });

      it('should sort by album artist ASC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.album_artist,
          sortDirection: SortDirectionEnum.asc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) =>
          a.albumArtists
            .map((artist) => artist.name)
            .join(',')
            .localeCompare(b.albumArtists.map((artist) => artist.name).join(',')),
        );
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.albumArtists[0]?.name).toBe(sorted[i]?.albumArtists[0]?.name);
        }
      });

      it('should sort by album artist DESC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.album_artist,
          sortDirection: SortDirectionEnum.desc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) =>
          b.albumArtists
            .map((artist) => artist.name)
            .join(',')
            .localeCompare(a.albumArtists.map((artist) => artist.name).join(',')),
        );
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.albumArtists[0]?.name).toBe(sorted[i]?.albumArtists[0]?.name);
        }
      });

      it('should sort by genre ASC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.genre,
          sortDirection: SortDirectionEnum.asc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) =>
          a.genres
            .map((genre) => genre.name)
            .join(',')
            .localeCompare(b.genres.map((genre) => genre.name).join(',')),
        );
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.genres[0]?.name).toBe(sorted[i]?.genres[0]?.name);
        }
      });

      it('should sort by genre DESC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.genre,
          sortDirection: SortDirectionEnum.desc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) =>
          b.genres
            .map((genre) => genre.name)
            .join(',')
            .localeCompare(a.genres.map((genre) => genre.name).join(',')),
        );
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.genres[0]?.name).toBe(sorted[i]?.genres[0]?.name);
        }
      });

      it('should sort by title ASC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.title,
          sortDirection: SortDirectionEnum.asc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => a.title.localeCompare(b.title));
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.title).toBe(sorted[i]?.title);
        }
      });

      it('should sort by title DESC', async () => {
        const { data } = await userApi.listTracks({
          sortField: TrackSortFieldEnum.title,
          sortDirection: SortDirectionEnum.desc,
        });
        const { tracks, total } = data || { tracks: [], total: 0 };
        expect(total).toBe(27);
        expect(tracks.length).toBe(27);
        const sorted = [...tracks].sort((a, b) => b.title.localeCompare(a.title));
        for (let i = 0; i < tracks.length; i += 1) {
          expect(tracks[i]?.title).toBe(sorted[i]?.title);
        }
      });
    });
  });

  describe('success', () => {
    it('should return all tracks', async () => {
      const { data } = await userApi.listTracks();
      const { tracks, total } = data || { tracks: [], total: 0 };
      expect(total).toBe(27);
      expect(tracks.length).toBe(27);
    });

    it('should paginate results', async () => {
      const { data: fullData } = await userApi.listTracks();
      const { tracks: fullTracks } = fullData || { tracks: [], total: 0 };
      const { data } = await userApi.listTracks({ offset: 0, limit: 2 });
      const { tracks, total } = data || { tracks: [], total: 0 };
      expect(total).toBe(27);
      expect(tracks.length).toBe(2);
      for (let i = 0; i < tracks.length; i += 1) {
        expect(JSON.stringify(tracks[i])).toBe(JSON.stringify(fullTracks[i]));
      }
      const { data: data2 } = await userApi.listTracks({ offset: 2, limit: 2 });
      const { tracks: tracks2, total: total2 } = data2 || { tracks: [], total: 0 };
      expect(total2).toBe(27);
      expect(tracks2.length).toBe(2);
      for (let i = 0; i < tracks2.length; i += 1) {
        expect(JSON.stringify(tracks2[i])).toBe(JSON.stringify(fullTracks[i + 2]));
      }
      const { data: data3 } = await userApi.listTracks({ offset: 4, limit: 2 });
      const { tracks: tracks3, total: total3 } = data3 || { tracks: [], total: 0 };
      expect(total3).toBe(27);
      expect(tracks3.length).toBe(2);
      for (let i = 0; i < tracks3.length; i += 1) {
        expect(JSON.stringify(tracks3[i])).toBe(JSON.stringify(fullTracks[i + 4]));
      }
    });
  });
});
