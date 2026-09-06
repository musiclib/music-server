import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackComposersController } from './list-track-composers.controller';
import { UserListTrackComposersService } from './list-track-composers.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackComposersController],
  providers: [UserListTrackComposersService],
})
export class UserListTrackComposersModule {}
