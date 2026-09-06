import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackArtistsWithTracksController } from './list-track-artists-with-tracks.controller';
import { UserListTrackArtistsWithTracksService } from './list-track-artists-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackArtistsWithTracksController],
  providers: [UserListTrackArtistsWithTracksService],
})
export class UserListTrackArtistsWithTracksModule {}
