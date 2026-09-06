import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';
import { FileTypeEnum } from 'src/types/enums';
import { LinkedGenreEntity } from './linked-genre.entity';
import { RootPathEntity } from './root-path.entity';

/**
 * The CollatedTrackEntity selects data from a view that collates track information
 * from all of its related tables including file, metadata, artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_tracks_data',
  underscored: true,
  timestamps: false,
})
export class CollatedTrackEntity extends Model<CollatedTrackEntity> {
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

  @BelongsTo(() => AlbumEntity)
  declare album: AlbumEntity;

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

  @ForeignKey(() => FileEntity)
  declare fileId: number;

  @BelongsTo(() => FileEntity)
  declare file: FileEntity;

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

  /**
   * The root path ID the file resides in
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: RootPathEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => RootPathEntity)
  declare rootPathId: number;

  @BelongsTo(() => RootPathEntity)
  declare rootPath?: RootPathEntity;

  @Column({
    type: DataType.TEXT,
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
    type: DataType.STRING(50),
    get(): string[] {
      const rawValue = this.getDataValue('trackGenres');
      return rawValue?.split(',').map((genre: string) => genre.trim()) || [];
    },
  })
  declare trackGenres: string[];

  @HasMany(() => LinkedGenreEntity, 'fileId')
  declare linkedTrackGenres: LinkedGenreEntity[];

  @Column(DataType.INTEGER)
  declare trackNumber: number;

  @Column(DataType.INTEGER)
  declare trackRating: number;

  @Column(DataType.STRING(255))
  declare trackTitle: string;

  @Column(DataType.INTEGER)
  declare trackYear: number;
}
