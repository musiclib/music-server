import {
  AccountEntity,
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  ComposerEntity,
  FileCustomDataEntity,
  FileEntity,
  FolderEntity,
  GenreEntity,
  IndexerConfigurationEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
  RootPathEntity,
} from 'src/database/entities';
import { IndexAlbumService } from './index-album.service';
import { IndexArtistService } from './index-artist.service';
import { IndexComposerService } from './index-composer.service';
import { IndexFileService } from './index-file.service';
import { IndexGenreService } from './index-genre.service';
import { IndexerService } from './indexer.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AccountEntity,
      AlbumEntity,
      AlbumArtistEntity,
      ArtistEntity,
      ComposerEntity,
      FileEntity,
      FileCustomDataEntity,
      FolderEntity,
      GenreEntity,
      IndexerConfigurationEntity,
      LinkedArtistEntity,
      LinkedComposerEntity,
      LinkedGenreEntity,
      RootPathEntity,
      SystemConfigurationEntity,
    ]),
  ],
  providers: [
    IndexerService,
    IndexAlbumService,
    IndexArtistService,
    IndexComposerService,
    IndexGenreService,
    IndexFileService,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
