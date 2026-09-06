import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackComposersWithTracksController } from './list-track-composers-with-tracks.controller';
import { UserListTrackComposersWithTracksService } from './list-track-composers-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackComposersWithTracksController],
  providers: [UserListTrackComposersWithTracksService],
})
export class UserListTrackComposersWithTracksModule {}
