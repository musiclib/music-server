import { ErrorCodes } from 'src/constants/error-codes';
import { FileCustomDataEntity } from 'src/database/entities/file-custom-data.entity';
import { FileEntity } from 'src/database/entities';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UserDeleteCustomFileDataService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FileCustomDataEntity)
    private readonly fileCustomDataEntity: typeof FileCustomDataEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async deleteCustomFileData(accountId: number, fileId: number): Promise<void> {
    const file = await this.fileEntity.findOne({ where: { id: fileId, accountId } });
    if (!file) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    await this.fileCustomDataEntity.destroy({ where: { id: fileId } });
    await this.indexerService.scanFile(fileId);
  }
}
