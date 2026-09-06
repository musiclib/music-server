import { FileEntity } from 'src/database/entities';
import { GuestStreamFileController } from './stream-file.controller';
import { GuestStreamFileService } from './stream-file.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity])],
  controllers: [GuestStreamFileController],
  providers: [GuestStreamFileService],
})
export class GuestStreamFileModule {}
