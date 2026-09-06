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
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { LibraryTrackDto } from './dtos';
import { ListResult } from './types/list-result';
import { Op, Sequelize, literal } from 'sequelize';
import { SortDirectionEnum, TrackSortFieldEnum } from 'src/types/enums';
import { TrackFilters } from './types/track-filter';
import { normalizeString } from 'src/utils/strings';
import type { FindAttributeOptions, FindOptions, Includeable, OrderItem } from 'sequelize';

@Injectable()
export class LibraryTrackService {
  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering album tracks based on the provided parameters.
   * @param {number} accountId The account ID to retrieve tracks for.
   * @param {TrackFilters} filters The filters to apply when querying for tracks.
   * @returns {Promise<FindOptions<ArtistEntity>>} A Sequelize where clause object for filtering tracks.
   */
  async createTrackQueryFilter(accountId: number, filters?: TrackFilters): Promise<FindOptions<FileEntity>> {
    const artistIds: number[] = [];
    const albumArtistIds: number[] = [];
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
    if (filters?.albumArtist || filters?.filter) {
      const artistFilter = filters.albumArtist
        ? {
            nameNormalized: {
              [Op.or]: filters.albumArtist.map((artist) => ({
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
      albumArtistIds.push(...artists.map((artist) => artist.id));
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
        required: true,
      });
    }

    if (composerIds.length) {
      joinedTables.push({
        model: LinkedComposerEntity,
        attributes: ['composerId'],
        where: {
          composerId: { [Op.in]: composerIds },
        },
        required: true,
      });
    }
    if (genreIds.length) {
      joinedTables.push({
        attributes: ['genreId'],
        model: LinkedGenreEntity,
        where: {
          genreId: { [Op.in]: genreIds },
        },
        required: true,
      });
    }
    if (filters?.album || albumArtistIds.length) {
      joinedTables.push({
        attributes: ['id'],
        model: AlbumEntity,
        where: {
          ...(filters?.album && {
            title: { [Op.like]: `%${normalizeString(filters.album)}%` },
          }),
        },
        include: albumArtistIds.length
          ? [
              {
                model: AlbumArtistEntity,
                attributes: ['artistId'],
                where: {
                  artistId: { [Op.in]: albumArtistIds },
                },
                required: true,
              },
            ]
          : [],
        required: true,
      });
    }
    const queryFilter = {
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
        ...(filters?.filter && {
          title: { [Op.like]: `%${normalizeString(filters.filter)}%` },
        }),
      },
    };
    return queryFilter;
  }

  async listTracksById(
    fileIds: number[],
    offset: number,
    limit: number,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryTrackDto>> {
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
    if (sortField === TrackSortFieldEnum.ARTIST) {
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
    } else if (sortField === TrackSortFieldEnum.ALBUM_ARTIST) {
      additionalSortFields.push([
        literal(` (
    SELECT group_concat(artist_name, ', ')
    FROM (
      SELECT artists.name AS artist_name
      FROM artists
      INNER JOIN album_artists
        ON album_artists.artist_id = artists.id
      WHERE album_artists.album_id = "FileEntity"."album_id"
      ORDER BY artists.name COLLATE NOCASE
    )
  )`),
        'albumArtistSort',
      ]);
    } else if (sortField === TrackSortFieldEnum.COMPOSER) {
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
    } else if (sortField === TrackSortFieldEnum.GENRE) {
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
    const data = await this.fileEntity.findAndCountAll({
      attributes: [
        'albumId',
        'bitRate',
        'channels',
        'createdAt',
        'discNumber',
        'duration',
        'frequency',
        'id',
        'rating',
        'title',
        'trackNumber',
        'year',
        ...additionalSortFields,
      ],
      where: {
        id: fileIds,
      },
      order,
      offset: offset || 0,
      limit: limit || 100_000,
      include: [
        {
          attributes: ['id', 'title'],
          model: AlbumEntity,
          include: [
            {
              model: AlbumArtistEntity,
              attributes: ['albumId', 'artistId'],
              include: [
                {
                  attributes: ['createdAt', 'id', 'name'],
                  model: ArtistEntity,
                },
              ],
              separate: true,
            },
          ],
        },
        {
          attributes: ['artistId'],
          model: LinkedArtistEntity,
          include: [
            {
              attributes: ['createdAt', 'id', 'name'],
              model: ArtistEntity,
              required: true,
            },
          ],
          separate: true,
        },
        {
          attributes: ['composerId'],
          model: LinkedComposerEntity,
          include: [
            {
              attributes: ['createdAt', 'id', 'name'],
              model: ComposerEntity,
              required: true,
            },
          ],
          separate: true,
        },
        {
          attributes: ['genreId'],
          model: LinkedGenreEntity,
          include: [
            {
              attributes: ['createdAt', 'id', 'name'],
              model: GenreEntity,
              required: true,
            },
          ],
          separate: true,
        },
      ],
      subQuery: false,
      distinct: true,
    });
    return {
      items: data.rows.map((file) => {
        return {
          albumArtists:
            file.album?.albumArtists?.map((albumArtist) => ({
              id: albumArtist.artist?.id || 0,
              name: albumArtist.artist?.name || '',
              createdAt: albumArtist.artist?.createdAt || new Date(),
            })) || [],
          albumId: file.album?.id || 0,
          albumTitle: file.album?.title || '',
          artists:
            file.linkedArtists?.map((linkedArtist) => ({
              id: linkedArtist.artist?.id || 0,
              name: linkedArtist.artist?.name || '',
              createdAt: linkedArtist.artist?.createdAt || new Date(),
            })) || [],
          comment: file.comment,
          composers:
            file.linkedComposers?.map((linkedComposer) => ({
              id: linkedComposer.composer?.id || 0,
              name: linkedComposer.composer?.name || '',
              createdAt: linkedComposer.composer?.createdAt || new Date(),
            })) || [],
          discNumber: file.discNumber,
          duration: file.duration,
          fileBitRate: file.bitRate,
          fileChannels: file.channels,
          fileFrequency: file.frequency,
          filePath: file.filePath,
          fileSize: file.fileSize,
          fileType: file.fileType,
          frequency: file.frequency,
          genres:
            file.linkedGenres?.map((linkedGenre) => ({
              id: linkedGenre.genre?.id || 0,
              name: linkedGenre.genre?.name || '',
              createdAt: linkedGenre.genre?.createdAt || new Date(),
            })) || [],
          id: file.id,
          rating: file.rating,
          title: file.title,
          trackNumber: file.trackNumber,
          year: file.year,
        };
      }),
      total: data.count,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: TrackSortFieldEnum): string | undefined {
    switch (sortField) {
      case TrackSortFieldEnum.DATE_ADDED:
        return 'createdAt';
      case TrackSortFieldEnum.ARTIST:
        return 'artistSort';
      case TrackSortFieldEnum.ALBUM_ARTIST:
        return 'albumArtistSort';
      case TrackSortFieldEnum.ALBUM:
        return 'album.title';
      case TrackSortFieldEnum.COMPOSER:
        return 'composerSort';
      case TrackSortFieldEnum.GENRE:
        return 'genresSort';
      case TrackSortFieldEnum.YEAR:
        return 'FileEntity.year';
      case TrackSortFieldEnum.TITLE:
        return 'FileEntity.title';
      default:
        return undefined;
    }
  }
}
