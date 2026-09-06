import {
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { ComposerFilters } from './types/composer-filter';
import { ComposerSortFieldEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { normalizeString } from 'src/utils/strings';
import type { FindOptions, Includeable } from 'sequelize';

@Injectable()
export class LibraryComposerService {
  constructor(
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering composers based on the provided parameters.
   * @param {number} accountId The account ID to retrieve composers for.
   * @param {ComposerFilters} filters The filters to apply when querying for composers.
   * @returns {Promise<FindOptions<ComposerEntity>>} A Sequelize where clause object for filtering composers.
   */
  async createComposerQueryFilter(accountId: number, filters?: ComposerFilters): Promise<FindOptions<ComposerEntity>> {
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
          model: LinkedComposerEntity,
          attributes: ['composerId', 'fileId'],
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
   * Identifies the composer IDs that are going to be returned in raw, unpaginated form based on the
   * query filtering parameters.
   * @param {FindOptions<ComposerEntity>} queryFilter The Sequelize find options for filtering composers
   * @returns {Promise<number[]>} The list of composer IDs that match the query filter.
   */
  async findMatchingComposerIds(queryFilter: FindOptions<ComposerEntity>): Promise<number[]> {
    const composerIds = await this.composerEntity.findAll({
      ...queryFilter,
      attributes: ['id'],
      subQuery: false,
    });
    return composerIds.map((composer) => composer.id);
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: ComposerSortFieldEnum): string {
    switch (sortField) {
      case ComposerSortFieldEnum.DATE_ADDED:
        return 'createdAt';
      case ComposerSortFieldEnum.COMPOSER:
      default:
        return 'name';
    }
  }
}
