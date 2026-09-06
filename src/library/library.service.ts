import {
  AlbumSortFieldEnum,
  ArtistSortFieldEnum,
  ComposerSortFieldEnum,
  GenreSortFieldEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { ArtistEntity, ComposerEntity, FileEntity, GenreEntity } from 'src/database/entities';
import { ComposerFilters } from './types/composer-filter';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAlbumService } from './album.service';
import { LibraryArtistDto, LibraryArtistWithTracksDto } from './dtos/library.artist.dto';
import { LibraryArtistService } from './artist.service';
import { LibraryComposerDto, LibraryComposerWithTracksDto, LibraryTrackDto } from './dtos';
import { LibraryComposerService } from './composer.service';
import { LibraryGenreDto, LibraryGenreWithTracksDto } from './dtos/library.genre.dto';
import { LibraryTrackService } from './track.service';
import { Op, Sequelize } from 'sequelize';
import { TrackFilters } from './types/track-filter';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import type { AlbumFilters } from './types/album-filter';
import type { ArtistFilters } from './types/artist-filter';
import type { ListResult } from './types/list-result';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,

    private readonly albumService: LibraryAlbumService,
    private readonly artistService: LibraryArtistService,
    private readonly composerService: LibraryComposerService,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    private readonly trackService: LibraryTrackService,
  ) {}

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {number} accountId The user performing the search
   * @param {AlbumFilters} filters The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumDto>>} The album list and total record count.
   */
  async listAlbums(
    accountId: number,
    filters: AlbumFilters,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const queryFilter = await this.albumService.createAlbumQueryFilter(accountId, filters);
    const matchingAlbums = await this.albumService.findMatchingAlbumIds(queryFilter);
    return this.albumService.listAlbumsById(matchingAlbums, offset, limit, sortField, sortDirection);
  }

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters and bundling extended track lists for all albums.  If the track lists are not
   * required then the `listAlbums` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {AlbumFilters} filters The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumWithTracksDto>>} List of albums with tracks and total count
   */
  async listAlbumsWithTracks(
    accountId: number,
    filters: AlbumFilters,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumWithTracksDto>> {
    const queryFilter = await this.albumService.createAlbumQueryFilter(accountId, filters);
    const matchingAlbums = await this.albumService.findMatchingAlbumIds(queryFilter);
    return this.albumService.listAlbumsWithTracksById(matchingAlbums, offset, limit, sortField, sortDirection);
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of artists with their albums and tracks.
   */
  async listAlbumArtists(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistDto>> {
    const sortFieldColumn = this.artistService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.artistService.createAlbumArtistQueryFilter(accountId, filters);
    const artistIds = await this.artistService.findMatchingArtistIds(queryFilter);
    const artists = await this.artistEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: artistIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
        }),
        ...(filters?.addedBefore && {
          createdAt: {
            [Op.lt]: filters.addedBefore,
          },
        }),
        ...(filters?.addedAfter && {
          createdAt: {
            [Op.gt]: filters.addedAfter,
          },
        }),
      },
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: artists.count,
      items: artists.rows.map((artist) => {
        return {
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters and bundling track lists for all albums.  If the track lists are
   * not required then the `listArtists` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of artists with their albums and tracks.
   */
  async listAlbumArtistsWithTracks(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistWithTracksDto>> {
    const artists = await this.listAlbumArtists(accountId, filters, offset, limit, sortField, sortDirection);
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            artist: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    const albumIndex = {};
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.artists.length; j < jLen; j += 1) {
          const artist = album.artists[j];
          if (artist) {
            albumIndex[artist.id] = albumIndex[artist.id] || [];
            const existing = albumIndex[artist.id].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[artist.id].push({
                ...album,
                tracks: album.tracks.filter((track) => track.artists.find((a) => a.id === artist.id)),
              });
            }
          }
        }
        // index as combined artists
        const combined = album.artists.map((a) => a.name).join(', ');
        if (album.artists.length > 1) {
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) =>
                  track.artists.find((a) => a.name === combined) ||
                  track.artists.map((a) => a.name).join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      total: artists.total,
      items: artists.items
        .map((artist) => ({
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name),
          albums: albumIndex[artist.id] || [],
        }))
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  /**
   * Lists all composers along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.
   * @param {number} accountId The user performing the search
   * @param {ComposerFilters} filters The search parameters for the composers
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ComposerSortFieldEnum} [sortField] The field by which to sort the composers
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryComposerDto>>} The list of composers with their albums and tracks.
   */
  async listComposers(
    accountId: number,
    filters: ComposerFilters,
    offset: number,
    limit: number,
    sortField?: ComposerSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryComposerDto>> {
    const sortFieldColumn = this.composerService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.composerService.createComposerQueryFilter(accountId, filters);
    const composerIds = await this.composerService.findMatchingComposerIds(queryFilter);
    const composers = await this.composerEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: composerIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
        }),
        ...(filters?.addedBefore && {
          createdAt: {
            [Op.lt]: filters.addedBefore,
          },
        }),
        ...(filters?.addedAfter && {
          createdAt: {
            [Op.gt]: filters.addedAfter,
          },
        }),
      },
      subQuery: false,
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: composers.count,
      items: composers.rows.map((composer) => {
        return {
          id: composer.id,
          createdAt: composer.createdAt,
          name: replaceDoubleQuotes(composer.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all composers along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters and bundling track lists for all albums.  If the track lists are
   * not required then the `listComposers` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ComposerFilters} filters The search parameters for the composers
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ComposerSortFieldEnum} [sortField] The field by which to sort the composers
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryComposerDto>>} The list of composers with their albums and tracks.
   */
  async listComposersWithTracks(
    accountId: number,
    filters: ComposerFilters,
    offset: number,
    limit: number,
    sortField?: ComposerSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryComposerWithTracksDto>> {
    const composers = await this.listComposers(accountId, filters, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            composer: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.composers.length; j < jLen; j += 1) {
          const composer = album.composers[j];
          if (composer) {
            albumIndex[composer.id] = albumIndex[composer.id] || [];
            const existing = albumIndex[composer.id].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[composer.id].push({
                ...album,
                tracks: album.tracks.filter((track) => track.composers.find((c) => c.id === composer.id)),
              });
            }
          }
        }
        // index as combined composers
        if (album.composers.length > 1) {
          const combined = album.composers.map((c) => c.name).join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) =>
                  track.composers.find((c) => c.name === combined) ||
                  track.composers.map((c) => c.name).join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      total: composers.total,
      items: composers.items
        .map((composer) => {
          return {
            id: composer.id,
            createdAt: composer.createdAt,
            name: replaceDoubleQuotes(composer.name || ''),
            albums: albumIndex[composer.id] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  /**
   * Lists all tracks optionally paginated, filtered and sorted by the specified parameters
   * @param {number} accountId The user performing the search
   * @param {TrackFilters} filters The search parameters for the tracks
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {TrackSortFieldEnum} [sortField] The field by which to sort the tracks
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the tracks
   * @returns {Promise<ListResult<LibraryTrackDto>>} The list of tracks with their albums and track details.
   */
  async listTracks(
    accountId: number,
    filters: TrackFilters,
    offset: number,
    limit: number,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryTrackDto>> {
    const queryFilter = await this.trackService.createTrackQueryFilter(accountId, filters);
    const fileIds = await this.fileEntity.findAll({
      attributes: ['id'],
      ...queryFilter,
    });
    return this.trackService.listTracksById(
      fileIds.map((file) => file.id),
      offset || 0,
      limit || 100_000,
      sortField,
      sortDirection,
    );
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.  The difference between this and "album" artists is these
   * names are compiled from track artists information.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the track artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the track artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the track artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of track artists with their albums and tracks.
   */
  async listTrackArtists(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistDto>> {
    const sortFieldColumn = this.artistService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.artistService.createArtistQueryFilter(accountId, filters);
    const artistIds = await this.artistService.findMatchingArtistIds(queryFilter);
    const artists = await this.artistEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: artistIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
        }),
        ...(filters?.addedBefore && {
          createdAt: {
            [Op.lt]: filters.addedBefore,
          },
        }),
        ...(filters?.addedAfter && {
          createdAt: {
            [Op.gt]: filters.addedAfter,
          },
        }),
      },
      subQuery: false,
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: artists.count,
      items: artists.rows.map((artist) => {
        return {
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all track artists along with their albums for a given account, optionally paginated, filtered
   * and sorted by the specified parameters and bundling track lists for all albums.  If the track lists
   * are not required then the `listTrackArtists` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the track artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the track artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of track artists with their albums and tracks.
   */
  async listTrackArtistsWithTracks(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistWithTracksDto>> {
    const artists = await this.listTrackArtists(accountId, filters, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            artist: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        const trackArtists: LibraryArtistDto[] = [];
        for (let j = 0, jLen = album.tracks.length; j < jLen; j += 1) {
          const track = album.tracks[j];
          if (track) {
            for (let k = 0, kLen = track.artists.length; k < kLen; k += 1) {
              const artist = track.artists[k];
              if (artist) {
                albumIndex[artist.id] = albumIndex[artist.id] || [];
                const existing = albumIndex[artist.id].find((item) => item.id === album.id);
                if (!existing) {
                  trackArtists.push(artist);
                  albumIndex[artist.id].push({
                    ...album,
                    tracks: album.tracks.filter((t) => t.artists.find((a) => a.id === artist.id)),
                  });
                }
              }
            }
          }
        }
        // index as combined artists
        if (trackArtists.length > 1) {
          const combined = trackArtists.map((a) => a.name).join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existing = albumIndex[combined].find((item) => item.id === album.id);
          if (!existing) {
            albumIndex[combined] = albumIndex[combined] || [];
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter((track) => {
                return (
                  track.artists.find((a) => a.name === combined) ||
                  track.artists.map((a) => a.name).join(', ') === combined
                );
              }),
            });
          }
        }
      }
    }
    return {
      total: artists.total,
      items: artists.items
        .map((artist) => {
          return {
            id: artist.id,
            createdAt: artist.createdAt,
            name: replaceDoubleQuotes(artist.name || ''),
            albums: albumIndex[artist.id] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  async listTrackGenres(
    accountId: number,
    offset: number,
    limit: number,
    sortField?: GenreSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryGenreDto>> {
    let sortFieldColumn: string;
    switch (sortField) {
      case GenreSortFieldEnum.GENRE:
      default:
        sortFieldColumn = 'name';
        break;
    }
    const genres = await this.genreEntity.findAndCountAll({
      where: {
        accountId,
        isDefault: false,
      },
      attributes: ['id', 'name'],
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      items: genres.rows.map((genre) => {
        return {
          id: genre.id,
          name: genre.name,
        };
      }),
      total: genres.count,
    };
  }

  async listTrackGenresWithTracks(
    accountId: number,
    offset: number,
    limit: number,
    sortField?: GenreSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryGenreWithTracksDto>> {
    const genres = await this.listTrackGenres(accountId, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(
      accountId,
      {
        genre: genres.items.map((genre) => genre.name),
      },
      0,
      100_000,
    );
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.genres.length; j < jLen; j += 1) {
          const genre = album.genres[j];
          if (genre) {
            albumIndex[genre.id] = albumIndex[genre.id] || [];
            const existing = albumIndex[genre.id].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[genre.id].push({
                ...album,
                tracks: album.tracks.filter((track) => track.genres.find((g) => g.id === genre.id)),
              });
            }
          }
        }
        // index as combined genres
        if (album.genres.length > 1) {
          const combined = album.genres.map((genre) => genre.name).join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) =>
                  track.genres.find((g) => g.name === combined) ||
                  track.genres.map((g) => g.name).join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      items: genres.items
        .map((genre) => {
          return {
            id: genre.id,
            name: genre.name,
            albums: albumIndex[genre.id] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
      total: genres.total,
    };
  }

  async rateTracks(accountId: number, fileIds: number[], rating: number): Promise<void> {
    const files = await this.fileEntity.findAll({
      where: {
        accountId,
        id: fileIds,
      },
    });
    if (files.length !== fileIds.length) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    await this.fileEntity.update(
      {
        rating,
      },
      {
        where: {
          accountId,
          id: fileIds,
        },
      },
    );
  }

  async retrieveAlbum(accountId: number, albumId: number): Promise<LibraryAlbumWithTracksDto> {
    const matchingAlbumIds = await this.albumService.findMatchingAlbumIds({
      where: {
        accountId,
        id: albumId,
      },
    });
    if (!matchingAlbumIds || matchingAlbumIds.length === 0) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    const album = await this.albumService.listAlbumsWithTracksById([albumId], 0, 1);
    if (!album?.items?.[0]) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    return album.items[0];
  }
}
