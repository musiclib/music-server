/* eslint-disable no-await-in-loop */
import { FileEntity, GenreEntity, LinkedGenreEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';

@Injectable()
export class IndexGenreService {
  private readonly logger: Logger = new Logger(IndexGenreService.name);

  constructor(
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    @InjectModel(LinkedGenreEntity)
    private readonly linkedGenreEntity: typeof LinkedGenreEntity,
  ) {}

  async insertOrRetrieveGenre(accountId: number, name: string, transaction?: Transaction): Promise<number> {
    const nameNormalized = normalizeString(name);
    const existing = await this.genreEntity.findOne({
      where: {
        nameNormalized,
      },
      transaction,
    });
    let genreId: number;
    if (existing?.id) {
      genreId = existing.id;
    } else {
      const genre = await this.genreEntity.create(
        {
          accountId,
          name: sanitizeString(name),
          nameNormalized,
        } as GenreEntity,
        {
          transaction,
        },
      );
      genreId = genre.id;
    }
    return genreId;
  }

  async updateGenres(
    embeddedData: IAudioMetadata,
    accountId: number,
    fileDetail: FileEntity,
    transaction?: Transaction,
  ) {
    const genres = splitArray(embeddedData?.common.genre || []);
    const validAssociationIds: number[] = [];
    for (let i = 0; i < genres.length; i += 1) {
      const name = genres[i]?.trim();
      if (name) {
        const genreId = await this.insertOrRetrieveGenre(accountId, name, transaction);
        const existingAssociation = await this.linkedGenreEntity.findOne({
          where: {
            genreId,
            fileId: fileDetail.id,
          },
          transaction,
        });
        if (!existingAssociation) {
          const newAssociation = await this.linkedGenreEntity.create(
            {
              genreId,
              fileId: fileDetail.id,
            } as LinkedGenreEntity,
            {
              transaction,
            },
          );
          validAssociationIds.push(newAssociation.id);
        } else {
          validAssociationIds.push(existingAssociation.id);
        }
      }
    }
    // remove any associations that are no longer valid
    await this.linkedGenreEntity.destroy({
      where: {
        fileId: fileDetail.id,
        id: {
          [Op.notIn]: validAssociationIds,
        },
      },
      transaction,
    });
  }
}
