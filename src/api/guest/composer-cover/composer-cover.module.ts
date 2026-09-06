import { AlbumEntity } from 'src/database/entities';
import { GuestComposerCoverController } from './composer-cover.controller';
import { GuestComposerCoverService } from './composer-cover.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [GuestComposerCoverController],
  providers: [GuestComposerCoverService],
})
export class GuestComposerCoverModule {}
