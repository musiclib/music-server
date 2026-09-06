import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumArtistsController } from './list-album-artists.controller';
import { UserListAlbumArtistsService } from './list-album-artists.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumArtistsController],
  providers: [UserListAlbumArtistsService],
})
export class UserListAlbumArtistsModule {}
