import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackArtistsController } from './list-track-artists.controller';
import { UserListTrackArtistsService } from './list-track-artists.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackArtistsController],
  providers: [UserListTrackArtistsService],
})
export class UserListTrackArtistsModule {}
