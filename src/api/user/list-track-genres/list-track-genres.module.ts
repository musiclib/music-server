import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackGenresController } from './list-track-genres.controller';
import { UserListTrackGenresService } from './list-track-genres.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackGenresController],
  providers: [UserListTrackGenresService],
})
export class UserListTrackGenresModule {}
