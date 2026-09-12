import { FileCustomDataEntity } from 'src/database/entities/file-custom-data.entity';
import { FileEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserDeleteCustomFileDataController } from './delete-custom-file-data.controller';
import { UserDeleteCustomFileDataService } from './delete-custom-file-data.service';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity, FileCustomDataEntity])],
  controllers: [UserDeleteCustomFileDataController],
  providers: [UserDeleteCustomFileDataService],
})
export class UserDeleteCustomFileDataModule {}
