import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { FileTypeEnum } from 'src/types/enums';
import { LinkedArtistEntity } from './linked-artist.entity';
import { LinkedComposerEntity } from './linked-composer.entity';
import { LinkedGenreEntity } from './linked-genre.entity';
import { PlaylistItemEntity } from './playlist-item.entity';
import { RootPathEntity } from './root-path.entity';
import type { Rating } from 'src/types';

/**
 * The FileEntity holds a reference to a music file within a root path. A user may have
 * multiple files referring to different music tracks.
 */
@Table({
  tableName: 'files',
  timestamps: true,
  underscored: true,
})
export class FileEntity extends Model<FileEntity> {
  /**
   * The account ID the file belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AccountEntity)
  declare accountId?: number;

  /**
   * The album ID the file belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AlbumEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AlbumEntity)
  declare albumId: number;

  @BelongsTo(() => AlbumEntity)
  declare album?: AlbumEntity;

  @Column(DataType.INTEGER)
  declare bitRate: number;

  @Column(DataType.INTEGER)
  declare channels: number;

  @Column(DataType.STRING(255))
  declare comment: string;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are
   * inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @Column(DataType.INTEGER)
  declare discNumber: number;

  @Column(DataType.FLOAT)
  declare duration: number;

  /**
   * The absolute path to the file relative to the root path
   */
  @Column(DataType.STRING(255))
  declare filePath: string;

  /**
   * The file size for the music file
   */
  @Column(DataType.INTEGER)
  declare fileSize: number;

  /**
   * The file type for the music file
   */
  @Column(DataType.ENUM(...Object.values(FileTypeEnum)))
  declare fileType: FileTypeEnum;

  /**
   * The file modification time for the music file
   */
  @Column(DataType.DATE)
  declare fileMtime: Date;

  @Column(DataType.INTEGER)
  declare frequency: number;

  /**
   * The ID of the table row is an auto-incrementing integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  @HasMany(() => LinkedArtistEntity)
  declare linkedArtists?: LinkedArtistEntity[];

  @HasMany(() => LinkedComposerEntity)
  declare linkedComposers?: LinkedComposerEntity[];

  @HasMany(() => LinkedGenreEntity)
  declare linkedGenres?: LinkedGenreEntity[];

  @HasMany(() => PlaylistItemEntity)
  declare playlistItems?: PlaylistItemEntity[];

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare rating?: Rating | null;

  @Column({
    type: DataType.INTEGER,
    references: {
      model: RootPathEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => RootPathEntity)
  declare rootPathId: number;

  @BelongsTo(() => RootPathEntity)
  declare rootPath?: RootPathEntity;

  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.INTEGER)
  declare trackNumber: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;

  @Column(DataType.INTEGER)
  declare year: number;
}
