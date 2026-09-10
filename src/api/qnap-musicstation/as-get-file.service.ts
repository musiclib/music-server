import { FileEntity, RootPathEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'node:path';

@Injectable()
export class QnapAsGetFileService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
  ) {}

  async getFile(accountId: number, fileId: number) {
    const file = await this.fileEntity.findOne({
      attributes: ['filePath', 'fileSize', 'createdAt', 'updatedAt'],
      where: {
        id: fileId,
        accountId,
      },
      include: [
        {
          attributes: ['rootPath'],
          model: RootPathEntity,
        },
      ],
    });
    if (!file || !file?.rootPath) {
      throw new NotFoundException('File not found');
    }
    const fullPath = join(file.rootPath.rootPath, file.filePath);
    return {
      fullPath,
      fileSize: file.fileSize,
      fileType: file.fileType,
      updatedAt: file.updatedAt || file.createdAt,
    };
  }
}
