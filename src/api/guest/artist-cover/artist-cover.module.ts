import { AlbumEntity } from 'src/database/entities';
import { GuestArtistCoverController } from './artist-cover.controller';
import { GuestArtistCoverService } from './artist-cover.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [GuestArtistCoverController],
  providers: [GuestArtistCoverService],
})
export class GuestArtistCoverModule {}
