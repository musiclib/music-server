import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { ArtistFilters } from './types/artist-filter';
import { ArtistSortFieldEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { normalizeString } from 'src/utils/strings';
import type { FindOptions, Includeable } from 'sequelize';

@Injectable()
export class LibraryArtistService {
  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering album artists based on the provided parameters.
   * @param {number} accountId The account ID to retrieve artists for.
   * @param {ArtistFilters} filters The filters to apply when querying for artists.
   * @returns {Promise<FindOptions<ArtistEntity>>} A Sequelize where clause object for filtering artists.
   */
  async createAlbumArtistQueryFilter(accountId: number, filters?: ArtistFilters): Promise<FindOptions<ArtistEntity>> {
    // genres does an exact-match because there are many partial-matches like `Rock` vs `AlternRock`
    // that should not be co-mingled
    const genreIds: number[] = [];
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
    if (genreIds.length) {
      joinedTables.push({
        attributes: ['id', 'albumId'],
        model: FileEntity,
        include: [
          {
            attributes: ['genreId'],
            model: LinkedGenreEntity,
            where: {
              genreId: { [Op.in]: genreIds },
            },
            required: true,
          },
        ],
        required: true,
      });
    }
    const queryFilter = {
      include: [
        {
          model: AlbumArtistEntity,
          attributes: ['albumId'],
          required: true,
          include: [
            {
              model: AlbumEntity,
              attributes: ['title'],
              required: true,
              where: { accountId },
              include: joinedTables,
            },
          ],
        },
      ],
    };
    return queryFilter;
  }

  /**
   * Builds a Sequelize where clause for filtering track artists based on the provided parameters.
   * @param {number} accountId The account ID to retrieve composers for.
   * @param {ArtistFilters} filters The filters to apply when querying for artists.
   * @returns {Promise<FindOptions<ArtistEntity>>} A Sequelize where clause object for filtering artists.
   */
  async createArtistQueryFilter(accountId: number, filters?: ArtistFilters): Promise<FindOptions<ArtistEntity>> {
    // genres does an exact-match because there are many partial-matches like `Rock` vs `AlternRock`
    // that should not be co-mingled
    const genreIds: number[] = [];
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
    const queryFilter = {
      include: [
        {
          model: LinkedArtistEntity,
          attributes: ['artistId', 'fileId'],
          required: true,
          include: [
            {
              model: FileEntity,
              attributes: ['id', 'albumId'],
              required: true,
              distinct: true,
              where: { accountId },
              include: joinedTables,
            },
          ],
        },
      ],
    };
    return queryFilter;
  }

  /**
   * Identifies the artist IDs that are going to be returned in raw, unpaginated form based on the
   * query filtering parameters.
   * @param {FindOptions<ArtistEntity>} queryFilter The Sequelize find options for filtering artists
   * @returns {Promise<number[]>} The list of artist IDs that match the query filter.
   */
  async findMatchingArtistIds(queryFilter: FindOptions<ArtistEntity>): Promise<number[]> {
    const artistIds = await this.artistEntity.findAll({
      ...queryFilter,
      attributes: ['id'],
      subQuery: false,
    });
    return artistIds.map((artist) => artist.id);
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: ArtistSortFieldEnum): string {
    switch (sortField) {
      case ArtistSortFieldEnum.DATE_ADDED:
        return 'createdAt';
      case ArtistSortFieldEnum.ARTIST:
      default:
        return 'name';
    }
  }
}
