import { FileCustomDataEntity, FileEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSetCustomFileDataController } from './set-custom-file-data.controller';
import { UserSetCustomFileDataService } from './set-custom-file-data.service';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity, FileCustomDataEntity])],
  controllers: [UserSetCustomFileDataController],
  providers: [UserSetCustomFileDataService],
})
export class UserSetCustomFileDataModule {}
