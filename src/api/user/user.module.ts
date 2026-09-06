/* eslint-disable max-len */
import { APP_GUARD } from '@nestjs/core';
import { GuestGenreCoverModule } from '../guest/genre-cover/genre-cover.module';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserFolderStructureModule } from './folder-structure/folder-structure.module';
import { UserListAlbumArtistsModule } from './list-album-artists/list-album-artists.module';
import { UserListAlbumArtistsWithTracksModule } from './list-album-artists-with-tracks/list-album-artists-with-tracks.module';
import { UserListAlbumsModule } from './list-albums/list-albums.module';
import { UserListAlbumsWithTracksModule } from './list-albums-with-tracks/list-albums-with-tracks.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserListTrackArtistsModule } from './list-track-artists/list-track-artists.module';
import { UserListTrackArtistsWithTracksModule } from './list-track-artists-with-tracks/list-track-artists-with-tracks.module';
import { UserListTrackComposersModule } from './list-track-composers/list-track-composers.module';
import { UserListTrackComposersWithTracksModule } from './list-track-composers-with-tracks/list-track-composers-with-tracks.module';
import { UserListTrackGenresModule } from './list-track-genres/list-track-genres.module';
import { UserListTrackGenresWithTracksModule } from './list-track-genres-with-tracks/list-track-genres-with-tracks.module';
import { UserListTracksModule } from './list-tracks/list-tracks.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserRetrieveAlbumModule } from './retrieve-album/retrieve-album.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserCreateRootPathModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserFolderStructureModule,
    GuestGenreCoverModule,
    UserListAlbumArtistsModule,
    UserListAlbumArtistsWithTracksModule,
    UserListAlbumsModule,
    UserListAlbumsWithTracksModule,
    UserListIndexerLogsModule,
    UserListRootPathsModule,
    UserListTrackArtistsModule,
    UserListTrackArtistsWithTracksModule,
    UserListTrackComposersModule,
    UserListTrackComposersWithTracksModule,
    UserListTrackGenresModule,
    UserListTrackGenresWithTracksModule,
    UserListTracksModule,
    UserRegenerateSessionKeyModule,
    UserRetrieveAlbumModule,
    UserUpdatePasswordModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class UserModule {}
