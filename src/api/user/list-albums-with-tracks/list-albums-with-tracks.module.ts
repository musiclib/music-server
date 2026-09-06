import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumsWithTracksController } from './list-albums-with-tracks.controller';
import { UserListAlbumsWithTracksService } from './list-albums-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumsWithTracksController],
  providers: [UserListAlbumsWithTracksService],
})
export class UserListAlbumsWithTracksModule {}
