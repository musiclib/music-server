import { FileCustomDataEntity, FileEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { sanitizeString } from 'src/utils/strings';

@Injectable()
export class IndexFileService {
  private readonly logger: Logger = new Logger(IndexFileService.name);

  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FileCustomDataEntity)
    private readonly fileCustomDataEntity: typeof FileCustomDataEntity,
  ) {}

  /**
   * Merges custom file data into the embedded metadata detected in a track, creating
   * a consolidated metadata object that combines both sources.
   * @param {number} fileId The ID of the file in the database
   * @param {IAudioMetadata} embeddedData The embedded metadata detected in the file
   * @returns {IAudioMetadata} Consolidated metadata object prioritizing custom data
   */
  async applyCustomFileData(fileId: number, embeddedData: IAudioMetadata): Promise<IAudioMetadata> {
    const customData = await this.fileCustomDataEntity.findOne({
      where: {
        fileId,
      },
    });
    if (!customData) {
      return embeddedData;
    }
    const combined = {
      ...embeddedData,
    };
    combined.common.albumartist = customData.albumArtists ?? embeddedData.common?.albumartist;
    combined.common.artist = customData.artists ?? embeddedData.common?.artist;
    combined.common.comment =
      customData.comment?.split('\n').map((comment) => {
        return { text: comment.trim() };
      }) ??
      embeddedData.common?.comment ??
      null;
    combined.common.composer =
      customData.composers?.split(',').map((composer) => composer.trim()) ?? embeddedData.common?.composer;
    combined.common.disk = combined.common.disk || {};
    combined.common.disk.no = customData.discNumber || embeddedData.common?.disk?.no || null;
    combined.common.genre = customData.genres?.split(',').map((genre) => genre.trim()) ?? embeddedData.common?.genre;
    combined.common.title = customData.title || embeddedData.common?.title || '';
    combined.common.track = combined.common.track || {};
    combined.common.track.no = customData.trackNumber || embeddedData.common?.track?.no || null;
    combined.common.year = customData.year || embeddedData.common?.year || undefined;
    return combined;
  }

  /**
   * Returns a file by path with the specified attributes, including any custom data overrides if available.
   * @param {string} filePath The path to the file on disk
   * @param {(keyof FileEntity)[]} [attributes] The attributes to retrieve from the file entity
   * @param {Transaction} [transaction] The Sequelize transaction to use
   * @returns {Promise<FileEntity | undefined>} The file entity with potential data overrides
   */
  async retrieveFileByPath(filePath: string, attributes?: (keyof FileEntity)[], transaction?: Transaction) {
    const file = await this.fileEntity.findOne({
      where: {
        filePath,
      },
      attributes: ['id'],
      transaction,
    });
    if (!file) {
      return undefined;
    }
    return this.retrieveFile(file.id, attributes, transaction);
  }

  /**
   * Returns a file by its ID with the specified attributes, including any custom data overrides if available.
   * @param {number} fileId The ID of the file in the database
   * @param {(keyof FileEntity)[]} [attributes] The attributes to retrieve from the file entity
   * @param {Transaction} [transaction] The Sequelize transaction to use
   * @returns {Promise<FileEntity | undefined>} The file entity with potential data overrides
   */
  async retrieveFile(fileId: number, attributes?: (keyof FileEntity)[], transaction?: Transaction) {
    const file = await this.fileEntity.findByPk(fileId, {
      attributes,
      transaction,
    });
    if (!file) {
      return undefined;
    }
    const customData = await this.fileCustomDataEntity.findOne({
      where: {
        fileId,
      },
      attributes,
      transaction,
    });
    if (!customData) {
      return file;
    }
    const result = new FileEntity();
    if (attributes?.length) {
      for (let i = 0, len = attributes.length; i < len; i += 1) {
        const attribute = attributes[i];
        if (attribute) {
          result.set(attribute, file?.[attribute] ?? customData?.[attribute] ?? null);
        }
      }
    } else {
      const allAttributes = Object.keys(file?.get({ plain: true }));
      for (let i = 0, len = allAttributes.length; i < len; i += 1) {
        const attribute = allAttributes[i] as keyof FileEntity;
        result.set(attribute, file?.[attribute] ?? customData?.[attribute] ?? null);
      }
    }
    return result;
  }

  async updateFile(embeddedData: IAudioMetadata, fileId: number, accountId: number, transaction?: Transaction) {
    const file = await this.fileEntity.findByPk(fileId, { transaction });
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }
    let commentText: string | undefined;
    if (embeddedData.common.comment) {
      commentText = embeddedData.common.comment
        .map((comment) => comment.text?.trim() || '')
        .join('\n')
        .trim();
    }
    await this.fileEntity.update(
      {
        accountId,
        bitRate: embeddedData.format.bitrate || file.bitRate || 0,
        channels: embeddedData.format.numberOfChannels || file.channels || 0,
        comment: commentText || file.comment || '',
        discNumber: embeddedData.common.disk?.no || file.discNumber || 0,
        duration: embeddedData.format.duration || file.duration || 0,
        frequency: embeddedData.format.sampleRate || file.frequency || 0,
        title: sanitizeString(embeddedData.common.title || '') || file.title || '',
        trackNumber: embeddedData.common.track?.no || file.trackNumber || 0,
        year: embeddedData.common.year || file.year || 0,
      },
      {
        where: {
          id: fileId,
        },
        transaction,
      },
    );
    return file.reload({
      transaction,
    });
  }
}
