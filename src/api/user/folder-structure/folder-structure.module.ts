import { FileEntity, FolderEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserFolderStructureController } from './folder-structure.controller';
import { UserFolderStructureService } from './folder-structure.service';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity, FolderEntity])],
  controllers: [UserFolderStructureController],
  providers: [UserFolderStructureService],
})
export class UserFolderStructureModule {}
