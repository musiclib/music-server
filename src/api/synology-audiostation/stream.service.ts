import { AlbumEntity, FileEntity, RootPathEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StreamDto } from './dtos';
import { join } from 'node:path';

@Injectable()
export class SynologyStreamService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
  ) {}

  /**
   * Returns a track by ID.  If an invalid ID is provided it throws a NotFoundException.  The file stream is
   * derived from the fully-qualified path of the file constructed from the root, artist, album and file paths,
   * and then piped to the response via the controller.
   * @param {number} accountId The account ID for the user requesting the track.
   * @param {number} trackId The ID of the track to retrieve.
   * @returns {Promise<StreamDto>} The absolute file path, codec and size for streaming the file.
   */
  async getStream(accountId: number, trackId: number): Promise<StreamDto> {
    const file = await this.fileEntity.findOne({
      attributes: ['filePath', 'fileSize', 'fileType'],
      where: {
        accountId,
        id: trackId,
      },
      include: [
        {
          attributes: ['rootPathId'],
          model: AlbumEntity,
          include: [
            {
              attributes: ['rootPath'],
              model: RootPathEntity,
            },
          ],
        },
      ],
    });
    if (!file?.album?.rootPath?.rootPath) {
      throw new NotFoundException(`File not found for id: ${trackId}`);
    }
    return {
      codec: file.fileType,
      fileSize: file.fileSize || 0,
      path: join(file.album.rootPath.rootPath, file.filePath),
    };
  }
}
