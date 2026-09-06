import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackGenresWithTracksController } from './list-track-genres-with-tracks.controller';
import { UserListTrackGenresWithTracksService } from './list-track-genres-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackGenresWithTracksController],
  providers: [UserListTrackGenresWithTracksService],
})
export class UserListTrackGenresWithTracksModule {}
