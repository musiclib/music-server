import { AlbumEntity } from 'src/database/entities/album.entity';
import { GuestAlbumCoverController } from './album-cover.controller';
import { GuestAlbumCoverService } from './album-cover.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [GuestAlbumCoverController],
  providers: [GuestAlbumCoverService],
})
export class GuestAlbumCoverModule {}
