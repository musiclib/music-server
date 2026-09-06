import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';
import { FileTypeEnum } from 'src/types/enums';
import { GenreEntity } from './genre.entity';
import type { RatingOrUnset } from 'src/types';

/**
 * The CollatedGenreTrackEntity selects data from a view that collates track information
 * for each genre associated with a track, from all of its related tables including file,
 * metadata, artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_genre_tracks_data',
  underscored: true,
  timestamps: false,
})
export class CollatedGenreTrackEntity extends Model<CollatedGenreTrackEntity> {
  /**
   * The account ID the root path belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    allowNull: true,
  })
  @ForeignKey(() => AccountEntity)
  declare accountId: number;

  @BelongsTo(() => AccountEntity)
  declare account: AccountEntity;

  /**
   * The album ID the file belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AlbumEntity,
      key: 'id',
    },
    allowNull: true,
  })
  @ForeignKey(() => AlbumEntity)
  declare albumId: number;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('albumArtists');
      return rawValue?.split(',').map((artist: string) => artist.trim()) || [];
    },
  })
  declare albumArtists: string[];

  @Column(DataType.STRING(255))
  declare albumTitle: string;

  @Column(DataType.INTEGER)
  declare albumYear: number;

  @Column(DataType.INTEGER)
  declare fileSize: number;

  @Column(DataType.STRING(255))
  declare filePath: string;

  @Column(DataType.ENUM(...Object.values(FileTypeEnum)))
  declare fileType: FileTypeEnum;

  /**
   * The linked file ID.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    references: {
      model: FileEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => FileEntity)
  declare fileId: number;

  @Column({
    type: DataType.INTEGER,
    references: {
      model: GenreEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => GenreEntity)
  declare genreId: number;

  @BelongsTo(() => GenreEntity)
  declare genre: GenreEntity;

  @Column(DataType.STRING(255))
  declare genreName: string;

  @Column({
    type: DataType.TEXT,
    field: 'track_artists',
    get(): string[] {
      const rawValue = this.getDataValue('trackArtists');
      return rawValue?.split(',').map((artist: string) => artist.trim()) || [];
    },
  })
  declare trackArtists: string[];

  @Column(DataType.INTEGER)
  declare trackBitRate: number;

  @Column(DataType.INTEGER)
  declare trackChannels: number;

  @Column(DataType.STRING(255))
  declare trackComment?: string;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('trackComposers');
      return rawValue?.split(',').map((composer: string) => composer.trim()) || [];
    },
  })
  declare trackComposers: string[];

  @Column(DataType.INTEGER)
  declare trackDiscNumber: number;

  @Column(DataType.FLOAT)
  declare trackDuration: number;

  @Column(DataType.INTEGER)
  declare trackFrequency: number;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('trackGenres');
      return rawValue?.split(',').map((genre: string) => genre.trim()) || [];
    },
  })
  declare trackGenres: string[];

  @Column(DataType.INTEGER)
  declare trackNumber: number;

  @Column(DataType.INTEGER)
  declare trackRating: RatingOrUnset;

  @Column(DataType.STRING(255))
  declare trackTitle: string;

  @Column(DataType.INTEGER)
  declare trackYear: number;
}
