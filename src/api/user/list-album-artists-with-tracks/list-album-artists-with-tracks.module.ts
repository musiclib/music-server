import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumArtistsWithTracksController } from './list-album-artists-with-tracks.controller';
import { UserListAlbumArtistsWithTracksService } from './list-album-artists-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumArtistsWithTracksController],
  providers: [UserListAlbumArtistsWithTracksService],
})
export class UserListAlbumArtistsWithTracksModule {}
