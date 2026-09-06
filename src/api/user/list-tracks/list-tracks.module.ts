import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTracksController } from './list-tracks.controller';
import { UserListTracksService } from './list-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTracksController],
  providers: [UserListTracksService],
})
export class UserListTracksModule {}
