import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SynologyAlbumController } from './album.controller';
import { SynologyAlbumService } from './album.service';
import { SynologyArtistController } from './artist.controller';
import { SynologyArtistService } from './artist.service';
import { SynologyComposerController } from './composer.controller';
import { SynologyComposerService } from './composer.service';
import { SynologyCoverImageController } from './cover-image.controller';
import { SynologyCoverImageService } from './cover-image.service';
import { SynologyEntryController } from './entry.controller';
import { SynologyEntryService } from './entry.service';
import { SynologyFolderController } from './folder.controller';
import { SynologyFolderService } from './folder.service';
import { SynologyGenreController } from './genre.controller';
import { SynologyGenreService } from './genre.service';
import { SynologyInfoController } from './info.controller';
import { SynologyInfoService } from './info.service';
import { SynologyPlaylistController } from './playlist.controller';
import { SynologyPlaylistService } from './playlist.service';
import { SynologyProxyController } from './proxy.controller';
import { SynologyProxyService } from './proxy.service';
import { SynologyQueryController } from './query.controller';
import { SynologyQueryService } from './query.service';
import { SynologyRadioController } from './radio.controller';
import { SynologyRadioService } from './radio.service';
import { SynologySearchController } from './search.controller';
import { SynologySearchService } from './search.service';
import { SynologySongController } from './song.controller';
import { SynologySongService } from './song.service';
import { SynologyStreamController } from './stream.controller';
import { SynologyStreamService } from './stream.service';
import { entitiesList } from 'src/database/entities';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature(entitiesList)],
  controllers: [
    SynologyAlbumController,
    SynologyArtistController,
    SynologyComposerController,
    SynologyCoverImageController,
    SynologyEntryController,
    SynologyFolderController,
    SynologyGenreController,
    SynologyInfoController,
    SynologyPlaylistController,
    SynologyProxyController,
    SynologyQueryController,
    SynologyRadioController,
    SynologySearchController,
    SynologySongController,
    SynologyStreamController,
  ],
  providers: [
    SynologyAlbumService,
    SynologyArtistService,
    SynologyComposerService,
    SynologyCoverImageService,
    SynologyEntryService,
    SynologyFolderService,
    SynologyGenreService,
    SynologyInfoService,
    SynologyPlaylistService,
    SynologyProxyService,
    SynologyQueryService,
    SynologyRadioService,
    SynologySearchService,
    SynologySongService,
    SynologyStreamService,
  ],
})
export class SynologyModule {}
