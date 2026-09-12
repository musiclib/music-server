/* eslint-disable no-await-in-loop */
import { ComposerEntity, FileEntity, LinkedComposerEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';

@Injectable()
export class IndexComposerService {
  private readonly logger: Logger = new Logger(IndexComposerService.name);

  constructor(
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(LinkedComposerEntity)
    private readonly linkedComposerEntity: typeof LinkedComposerEntity,
  ) {}

  async insertOrRetrieveComposer(name: string, transaction?: Transaction): Promise<number> {
    const nameNormalized = normalizeString(name);
    const existing = await this.composerEntity.findOne({
      where: {
        nameNormalized,
      },
      transaction,
    });
    let composerId: number;
    if (existing?.id) {
      composerId = existing.id;
    } else {
      const composer = await this.composerEntity.create(
        {
          name: sanitizeString(name),
          nameNormalized,
        } as ComposerEntity,
        {
          transaction,
        },
      );
      composerId = composer.id;
    }
    return composerId;
  }

  async updateComposers(embeddedData: IAudioMetadata, fileDetail: FileEntity, transaction?: Transaction) {
    const composers = splitArray(embeddedData?.common.composer || []);
    const validAssociationIds: number[] = [];
    for (let i = 0; i < composers.length; i += 1) {
      const name = composers[i]?.trim();
      if (name) {
        const composerId = await this.insertOrRetrieveComposer(name, transaction);
        const existingAssociation = await this.linkedComposerEntity.findOne({
          where: {
            composerId,
            fileId: fileDetail.id,
          },
          transaction,
        });
        if (!existingAssociation) {
          const newAssociation = await this.linkedComposerEntity.create(
            {
              composerId,
              fileId: fileDetail.id,
            } as LinkedComposerEntity,
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
    await this.linkedComposerEntity.destroy({
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
