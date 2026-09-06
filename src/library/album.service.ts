import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { AlbumFilters } from './types/album-filter';
import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { FindAttributeOptions, FindOptions, Includeable, Op, OrderItem, Sequelize, literal } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import {
  LibraryAlbumDto,
  LibraryAlbumTrackDto,
  LibraryAlbumWithTracksDto,
  LibraryArtistDto,
  LibraryComposerDto,
} from './dtos';
import { LibraryGenreDto } from './dtos/library.genre.dto';
import { ListResult } from './types/list-result';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import type { RatingOrUnset } from 'src/types';

@Injectable()
export class LibraryAlbumService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering albums based on the provided parameters.
   * @param {number} accountId The account ID to retrieve albums for.
   * @param {AlbumFilters} filters The filters to apply when querying for albums.
   * @returns {Promise<FindOptions<FileEntity>>} A Sequelize where clause object for filtering albums.
   */
  async createAlbumQueryFilter(accountId: number, filters?: AlbumFilters): Promise<FindOptions<FileEntity>> {
    const artistIds: number[] = [];
    const composerIds: number[] = [];
    const genreIds: number[] = [];
    // artists does a partial-match because the data may be expressed inconsistently like:
    // - Artist 1              -> [Artist 1]
    // - Artist 1, Artist 2    -> [Artist 1, Artist 2]
    // - Artist 1 & Artist 2   -> [Artist 1 & Artist 2]
    // - Artist 1 ft. Artist 2 -> [Artist 1 ft. Artist 2]
    // - Artist 1 + Artist 2   -> [Artist 1 + Artist 2]
    // - Artist 1 and Artist 2 -> [Artist 1 + Artist 2]
    // and of course punctuation like & or + can be part of a singular name, eg:
    // - Florence + The Machine
    // - Nick Cave & The Bad Seeds
    if (filters?.artist || filters?.filter) {
      const artistFilter = filters.artist
        ? {
            nameNormalized: {
              [Op.or]: filters.artist.map((artist) => ({
                [Op.like]: `%${normalizeString(artist)}%`,
              })),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const artists = await this.artistEntity.findAll({
        attributes: ['id', 'name'],
        where: {
          [Op.or]: [artistFilter, searchFilter],
        },
        raw: true,
      });
      artistIds.push(...artists.map((artist) => artist.id));
    }
    // composers does a partial-match because the data may be expressed inconsistently like:
    // - Composer 1                -> [Composer 1]
    // - Composer 1, Composer 2    -> [Composer 1, Composer 2]
    // - Composer 1 & Composer 2   -> [Composer 1 & Composer 2]
    // - Composer 1 ft. Composer 2 -> [Composer 1 ft. Composer 2]
    if (filters?.composer || filters?.filter) {
      const composerFilter = filters.composer
        ? {
            nameNormalized: {
              [Op.or]: filters.composer.map((composer) => ({
                [Op.like]: `%${normalizeString(composer)}%`,
              })),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const composers = await this.composerEntity.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [composerFilter, searchFilter],
        },
      });
      composerIds.push(...composers.map((composer) => composer.id));
    }
    // genres does an exact-match because there are many partial-matches like `Rock` vs `AlternRock`
    // that should not be co-mingled
    if (filters?.genre) {
      const genreFilter = filters.genre
        ? {
            nameNormalized: {
              [Op.or]: filters.genre.map(normalizeString),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const genres = await this.genreEntity.findAll({
        attributes: ['id'],
        where: {
          accountId,
          [Op.or]: [genreFilter, searchFilter],
        },
      });
      genreIds.push(...genres.map((genre) => genre.id));
    }
    const joinedTables: Includeable[] = [];
    if (artistIds.length) {
      joinedTables.push({
        model: LinkedArtistEntity,
        attributes: [],
        where: {
          artistId: { [Op.in]: artistIds },
        },
      });
    }
    if (composerIds.length) {
      joinedTables.push({
        model: LinkedComposerEntity,
        attributes: [],
        where: {
          composerId: { [Op.in]: composerIds },
        },
      });
    }
    if (genreIds.length) {
      joinedTables.push({
        model: LinkedGenreEntity,
        attributes: [],
        where: {
          genreId: { [Op.in]: genreIds },
        },
      });
    }
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    if (normalizedFilterString) {
      joinedTables.push({
        model: AlbumEntity,
        attributes: [],
        where: {
          accountId,
          title: { [Op.like]: `%${normalizedFilterString}%` },
        },
      });
    }
    return {
      include: joinedTables,
      where: {
        accountId,
        ...(filters?.year && {
          year: filters.year,
        }),
        ...(filters?.minRating !== undefined && {
          rating: { [Op.gte]: filters.minRating },
        }),
        ...(filters?.maxRating !== undefined && {
          rating: {
            [Op.lte]: filters.maxRating,
          },
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
    };
  }

  /**
   * Identifies the album IDs that are going to be returned in raw, unpaginated form based on the
   * query filtering parameters.
   * @param {FindOptions<FileEntity>} queryFilter The Sequelize find options for filtering albums
   * @returns {Promise<number[]>} The list of album IDs that match the query filter.
   */
  async findMatchingAlbumIds(queryFilter: FindOptions<FileEntity>): Promise<number[]> {
    const matchingAlbums = await this.fileEntity.findAll({
      ...queryFilter,
      attributes: [
        'albumId',
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      group: ['albumId'],
    });
    return matchingAlbums.map((album) => album.albumId);
  }

  async listAlbumsById(
    albumIds: number[],
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const sortFieldColumn = this.sortFieldToColumn(sortField);
    const order: OrderItem[] = [];
    if (sortFieldColumn) {
      order.push([Sequelize.fn('lower', Sequelize.col(sortFieldColumn as string)), sortDirection || 'ASC']);
    } else {
      order.push(
        [Sequelize.fn('lower', Sequelize.col('album.title')), 'ASC'],
        [Sequelize.fn('lower', Sequelize.col('discNumber')), 'ASC'],
        [Sequelize.fn('lower', Sequelize.col('trackNumber')), 'ASC'],
      );
    }
    const additionalSortFields: FindAttributeOptions = [];
    if (sortField === AlbumSortFieldEnum.ARTIST) {
      additionalSortFields.push([
        literal(` (
    SELECT group_concat(artist_name, ', ')
    FROM (
      SELECT artists.name AS artist_name
      FROM artists
      INNER JOIN linked_artists
        ON linked_artists.artist_id = artists.id
      WHERE linked_artists.file_id = "FileEntity"."id"
      ORDER BY artists.name COLLATE NOCASE
    )
  )`),
        'artistSort',
      ]);
    }
    if (sortField === AlbumSortFieldEnum.ALBUM_ARTIST) {
      additionalSortFields.push([
        literal(` (
    SELECT group_concat(artist_name, ', ')
    FROM (
      SELECT artists.name AS artist_name
      FROM artists
      INNER JOIN album_artists
        ON album_artists.artist_id = artists.id
      WHERE album_artists.album_id = "AlbumEntity"."id"
      ORDER BY artists.name COLLATE NOCASE
    )
  )`),
        'albumArtistSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.COMPOSER) {
      additionalSortFields.push([
        literal(`
        SELECT group_concat(composer_name, ', ')
        FROM (
          SELECT composers.name AS composer_name
          FROM composers
          INNER JOIN linked_composers
            ON linked_composers.composer_id = composers.id
          WHERE linked_composers.file_id = "FileEntity"."id"
          ORDER BY composers.name COLLATE NOCASE
        )
        `),
        'composerSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.GENRE) {
      additionalSortFields.push([
        literal(`
        (
          SELECT group_concat(genre_name, ', ')
          FROM (
            SELECT genres.name AS genre_name
            FROM genres
            INNER JOIN linked_genres
              ON linked_genres.genre_id = genres.id
            WHERE linked_genres.file_id = "FileEntity"."id"
            ORDER BY genres.name COLLATE NOCASE
          )
        )
      `),
        'genresSort',
      ]);
    }
    const albums = await this.albumEntity.findAndCountAll({
      attributes: [
        'coverImageDarkMuted',
        'coverImageDarkVibrant',
        'coverImageLightMuted',
        'coverImageLightVibrant',
        'coverImageMuted',
        'coverImageVibrant',
        'createdAt',
        'id',
        'title',
        'year',
        ...additionalSortFields,
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      include: [
        {
          attributes: ['id'],
          model: AlbumArtistEntity,
          include: [
            {
              attributes: ['id', 'createdAt', 'name'],
              model: ArtistEntity,
            },
          ],
          separate: true,
        },
        {
          attributes: ['id'],
          model: FileEntity,
          separate: true,
          include: [
            {
              attributes: ['id'],
              model: LinkedGenreEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: GenreEntity,
                },
              ],
            },
            {
              attributes: ['id'],
              model: LinkedArtistEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: ArtistEntity,
                },
              ],
            },
            {
              attributes: ['id'],
              model: LinkedComposerEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: ComposerEntity,
                },
              ],
            },
          ],
        },
      ],
      offset,
      limit,
      where: {
        id: albumIds,
      },
      order,
    });
    return {
      total: albums.count,
      items: albums.rows.map((album) => {
        const albumArtists: LibraryArtistDto[] = [];
        const albumComposers: LibraryComposerDto[] = [];
        const albumComposersUnique: number[] = [];
        const albumGenres: LibraryGenreDto[] = [];
        const albumGenresUnique: number[] = [];
        if (album.albumArtists?.length) {
          for (let i = 0, len = album.albumArtists.length; i < len; i += 1) {
            const albumArtist = album.albumArtists[i];
            if (albumArtist?.artist) {
              albumArtists.push({
                createdAt: albumArtist.artist?.createdAt || new Date(),
                id: albumArtist.artist?.id || 0,
                name: replaceDoubleQuotes(albumArtist.artist?.name || ''),
              });
            }
          }
        }
        if (album.files?.length) {
          for (let i = 0, len = album.files?.length; i < len; i += 1) {
            const file = album.files[i];
            const trackArtists: LibraryArtistDto[] = [];
            const trackComposers: LibraryComposerDto[] = [];
            const trackGenres: LibraryGenreDto[] = [];
            if (file) {
              if (file.linkedArtists?.length) {
                for (let j = 0, jLen = file.linkedArtists?.length; j < jLen; j += 1) {
                  const linkedArtist = file.linkedArtists[j];
                  if (linkedArtist?.artist) {
                    trackArtists.push({
                      createdAt: linkedArtist.artist?.createdAt || new Date(),
                      id: linkedArtist.artist?.id || 0,
                      name: replaceDoubleQuotes(linkedArtist.artist?.name || ''),
                    });
                  }
                }
              }
              if (file.linkedComposers?.length) {
                for (let j = 0, jLen = file.linkedComposers?.length; j < jLen; j += 1) {
                  const linkedComposer = file.linkedComposers[j];
                  if (linkedComposer?.composer) {
                    const composer = {
                      createdAt: linkedComposer.composer?.createdAt || new Date(),
                      id: linkedComposer.composer?.id || 0,
                      name: replaceDoubleQuotes(linkedComposer.composer?.name || ''),
                    };
                    trackComposers.push(composer);
                    if (albumComposersUnique.indexOf(composer.id) === -1) {
                      albumComposersUnique.push(composer.id);
                      albumComposers.push(composer);
                    }
                  }
                }
              }
              if (file.linkedGenres?.length) {
                for (let j = 0, jLen = file.linkedGenres?.length; j < jLen; j += 1) {
                  const linkedGenre = file.linkedGenres[j];
                  if (linkedGenre?.genre) {
                    const genre = {
                      id: linkedGenre.genre?.id || 0,
                      name: replaceDoubleQuotes(linkedGenre.genre?.name || ''),
                    };
                    trackGenres.push(genre);
                    if (albumGenresUnique.indexOf(genre.id) === -1) {
                      albumGenresUnique.push(genre.id);
                      albumGenres.push(genre);
                    }
                  }
                }
              }
            }
          }
        }
        return {
          artists: albumArtists,
          composers: albumComposers,
          coverImageDarkMuted: album.coverImageDarkMuted || '#000000',
          coverImageDarkVibrant: album.coverImageDarkVibrant || '#000000',
          coverImageLightMuted: album.coverImageLightMuted || '#FFFFFF',
          coverImageLightVibrant: album.coverImageLightVibrant || '#FFFFFF',
          coverImageMuted: album.coverImageMuted || '#000000',
          coverImageVibrant: album.coverImageVibrant || '#FFFFFF',
          createdAt: album.createdAt,
          genres: albumGenres,
          id: album.id,
          rating: ((album as unknown as Record<string, number>).rating ?? 0) as RatingOrUnset,
          sortName: replaceDoubleQuotes(normalizeString(album.title)),
          title: replaceDoubleQuotes(album.title),
          year: album.year,
        };
      }),
    };
  }

  async listAlbumsWithTracksById(
    albumIds: number[],
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumWithTracksDto>> {
    const sortFieldColumn = this.sortFieldToColumn(sortField);
    const order: OrderItem[] = [];
    if (sortFieldColumn) {
      order.push([Sequelize.fn('lower', Sequelize.col(sortFieldColumn as string)), sortDirection || 'ASC']);
    } else {
      order.push(
        [Sequelize.fn('lower', Sequelize.col('album.title')), 'ASC'],
        [Sequelize.fn('lower', Sequelize.col('discNumber')), 'ASC'],
        [Sequelize.fn('lower', Sequelize.col('trackNumber')), 'ASC'],
      );
    }
    const additionalSortFields: FindAttributeOptions = [];
    if (sortField === AlbumSortFieldEnum.ARTIST) {
      additionalSortFields.push([
        literal(` (
    SELECT group_concat(artist_name, ', ')
    FROM (
      SELECT artists.name AS artist_name
      FROM artists
      INNER JOIN linked_artists
        ON linked_artists.artist_id = artists.id
      WHERE linked_artists.file_id = "FileEntity"."id"
      ORDER BY artists.name COLLATE NOCASE
    )
  )`),
        'artistSort',
      ]);
    }
    if (sortField === AlbumSortFieldEnum.ALBUM_ARTIST) {
      additionalSortFields.push([
        literal(` (
    SELECT group_concat(artist_name, ', ')
    FROM (
      SELECT artists.name AS artist_name
      FROM artists
      INNER JOIN album_artists
        ON album_artists.artist_id = artists.id
      WHERE album_artists.album_id = "AlbumEntity"."id"
      ORDER BY artists.name COLLATE NOCASE
    )
  )`),
        'albumArtistSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.COMPOSER) {
      additionalSortFields.push([
        literal(`
        SELECT group_concat(composer_name, ', ')
        FROM (
          SELECT composers.name AS composer_name
          FROM composers
          INNER JOIN linked_composers
            ON linked_composers.composer_id = composers.id
          WHERE linked_composers.file_id = "FileEntity"."id"
          ORDER BY composers.name COLLATE NOCASE
        )
        `),
        'composerSort',
      ]);
    } else if (sortField === AlbumSortFieldEnum.GENRE) {
      additionalSortFields.push([
        literal(`
        (
          SELECT group_concat(genre_name, ', ')
          FROM (
            SELECT genres.name AS genre_name
            FROM genres
            INNER JOIN linked_genres
              ON linked_genres.genre_id = genres.id
            WHERE linked_genres.file_id = "FileEntity"."id"
            ORDER BY genres.name COLLATE NOCASE
          )
        )
      `),
        'genresSort',
      ]);
    }
    const albums = await this.albumEntity.findAndCountAll({
      attributes: [
        'coverImageDarkMuted',
        'coverImageDarkVibrant',
        'coverImageLightMuted',
        'coverImageLightVibrant',
        'coverImageMuted',
        'coverImageVibrant',
        'createdAt',
        'id',
        'title',
        'year',
        ...additionalSortFields,
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      include: [
        {
          attributes: ['id'],
          model: AlbumArtistEntity,
          include: [
            {
              attributes: ['id', 'createdAt', 'name'],
              model: ArtistEntity,
            },
          ],
          separate: true,
        },
        {
          attributes: [
            'comment',
            'discNumber',
            'duration',
            'bitRate',
            'channels',
            'frequency',
            'filePath',
            'fileSize',
            'fileType',
            'id',
            'rating',
            'title',
            'trackNumber',
            'year',
          ],
          model: FileEntity,
          separate: true,
          include: [
            {
              attributes: ['id'],
              model: LinkedGenreEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: GenreEntity,
                },
              ],
            },
            {
              attributes: ['id'],
              model: LinkedArtistEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: ArtistEntity,
                },
              ],
            },
            {
              attributes: ['id'],
              model: LinkedComposerEntity,
              include: [
                {
                  attributes: ['id', 'createdAt', 'name'],
                  model: ComposerEntity,
                },
              ],
            },
          ],
        },
      ],
      offset,
      limit,
      where: {
        id: albumIds,
      },
      order,
    });
    return {
      total: albums.count,
      items: albums.rows.map((album) => {
        const albumArtists: LibraryArtistDto[] = [];
        const albumComposers: LibraryComposerDto[] = [];
        const albumComposersUnique: number[] = [];
        const albumGenres: LibraryGenreDto[] = [];
        const albumGenresUnique: number[] = [];
        const tracks: LibraryAlbumTrackDto[] = [];
        if (album.albumArtists?.length) {
          for (let i = 0, len = album.albumArtists.length; i < len; i += 1) {
            const albumArtist = album.albumArtists[i];
            if (albumArtist?.artist) {
              albumArtists.push({
                createdAt: albumArtist.artist?.createdAt || new Date(),
                id: albumArtist.artist?.id || 0,
                name: replaceDoubleQuotes(albumArtist.artist?.name || ''),
              });
            }
          }
        }
        if (album.files?.length) {
          for (let i = 0, len = album.files?.length; i < len; i += 1) {
            const file = album.files[i];
            const trackArtists: LibraryArtistDto[] = [];
            const trackComposers: LibraryComposerDto[] = [];
            const trackGenres: LibraryGenreDto[] = [];
            if (file) {
              if (file.linkedArtists?.length) {
                for (let j = 0, jLen = file.linkedArtists?.length; j < jLen; j += 1) {
                  const linkedArtist = file.linkedArtists[j];
                  if (linkedArtist?.artist) {
                    trackArtists.push({
                      createdAt: linkedArtist.artist?.createdAt || new Date(),
                      id: linkedArtist.artist?.id || 0,
                      name: replaceDoubleQuotes(linkedArtist.artist?.name || ''),
                    });
                  }
                }
              }
              if (file.linkedComposers?.length) {
                for (let j = 0, jLen = file.linkedComposers?.length; j < jLen; j += 1) {
                  const linkedComposer = file.linkedComposers[j];
                  if (linkedComposer?.composer) {
                    const composer = {
                      createdAt: linkedComposer.composer?.createdAt || new Date(),
                      id: linkedComposer.composer?.id || 0,
                      name: replaceDoubleQuotes(linkedComposer.composer?.name || ''),
                    };
                    trackComposers.push(composer);
                    if (albumComposersUnique.indexOf(composer.id) === -1) {
                      albumComposersUnique.push(composer.id);
                      albumComposers.push(composer);
                    }
                  }
                }
              }
              if (file.linkedGenres?.length) {
                for (let j = 0, jLen = file.linkedGenres?.length; j < jLen; j += 1) {
                  const linkedGenre = file.linkedGenres[j];
                  if (linkedGenre?.genre) {
                    const genre = {
                      id: linkedGenre.genre?.id || 0,
                      name: replaceDoubleQuotes(linkedGenre.genre?.name || ''),
                    };
                    trackGenres.push(genre);
                    if (albumGenresUnique.indexOf(genre.id) === -1) {
                      albumGenresUnique.push(genre.id);
                      albumGenres.push(genre);
                    }
                  }
                }
              }
              tracks.push({
                artists: trackArtists,
                comment: file.comment,
                composers: trackComposers,
                discNumber: file.discNumber || 0,
                duration: file.duration || 0,
                fileBitRate: file.bitRate,
                fileChannels: file.channels,
                fileFrequency: file.frequency,
                filePath: file.filePath,
                fileSize: file.fileSize,
                fileType: file.fileType,
                genres: trackGenres,
                id: file.id,
                rating: file.rating ?? 0,
                title: replaceDoubleQuotes(file.title),
                trackNumber: file.trackNumber || 0,
                year: file.year,
              });
            }
          }
        }
        return {
          artists: albumArtists,
          composers: albumComposers,
          coverImageDarkMuted: album.coverImageDarkMuted || '#000000',
          coverImageDarkVibrant: album.coverImageDarkVibrant || '#000000',
          coverImageLightMuted: album.coverImageLightMuted || '#FFFFFF',
          coverImageLightVibrant: album.coverImageLightVibrant || '#FFFFFF',
          coverImageMuted: album.coverImageMuted || '#000000',
          coverImageVibrant: album.coverImageVibrant || '#FFFFFF',
          createdAt: album.createdAt,
          genres: albumGenres,
          id: album.id,
          rating: ((album as unknown as Record<string, number>).rating ?? 0) as RatingOrUnset,
          sortName: replaceDoubleQuotes(normalizeString(album.title)),
          title: replaceDoubleQuotes(album.title),
          tracks,
          year: album.year,
        };
      }),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: AlbumSortFieldEnum): string {
    switch (sortField) {
      case AlbumSortFieldEnum.ALBUM:
        return 'title';
      case AlbumSortFieldEnum.YEAR:
        return 'year';
      case AlbumSortFieldEnum.RATING:
        return 'rating';
      case AlbumSortFieldEnum.DATE_ADDED:
        return 'createdAt';
      case AlbumSortFieldEnum.DATE_RELEASED:
        return 'year';
      case AlbumSortFieldEnum.ARTIST:
        return 'artists';
      case AlbumSortFieldEnum.ALBUM_ARTIST:
        return 'albumArtistSort';
      case AlbumSortFieldEnum.COMPOSER:
        return 'composers';
      case AlbumSortFieldEnum.GENRE:
        return 'genres';
      default:
        return 'title';
    }
  }
}
