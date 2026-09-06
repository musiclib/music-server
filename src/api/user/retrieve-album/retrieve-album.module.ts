import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserRetrieveAlbumController } from './retrieve-album.controller';
import { UserRetrieveAlbumService } from './retrieve-album.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserRetrieveAlbumController],
  providers: [UserRetrieveAlbumService],
})
export class UserRetrieveAlbumModule {}
