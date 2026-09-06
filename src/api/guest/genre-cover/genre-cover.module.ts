import { AlbumEntity } from 'src/database/entities';
import { GuestGenreCoverController } from './genre-cover.controller';
import { GuestGenreCoverService } from './genre-cover.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [GuestGenreCoverController],
  providers: [GuestGenreCoverService],
})
export class GuestGenreCoverModule {}
