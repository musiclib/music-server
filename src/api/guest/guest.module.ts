import { GuestAlbumCoverModule } from './album-cover/album-cover.module';
import { GuestArtistCoverModule } from './artist-cover/artist-cover.module';
import { GuestComposerCoverModule } from './composer-cover/composer-cover.module';
import { GuestCreateSessionModule } from './create-session/create-session.module';
import { GuestGenreCoverModule } from './genre-cover/genre-cover.module';
import { GuestHealthcheckController } from './healthcheck/healthcheck.controller';
import { GuestHealthcheckModule } from './healthcheck/healthcheck.module';
import { GuestStreamFileModule } from './stream-file/stream-file.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    GuestCreateSessionModule,
    GuestAlbumCoverModule,
    GuestArtistCoverModule,
    GuestComposerCoverModule,
    GuestGenreCoverModule,
    GuestHealthcheckModule,
    GuestStreamFileModule,
  ],
  controllers: [GuestHealthcheckController],
})
export class GuestModule {}
