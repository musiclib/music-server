import { AccountEntity } from './account.entity';
import { AlbumArtistEntity } from './album-artist.entity';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';
import { RootPathEntity } from './root-path.entity';

/**
 * The AlbumEntity holds metadata for a music album within a root path
 */
@Table({
  tableName: 'albums',
  timestamps: true,
  underscored: true,
})
export class AlbumEntity extends Model<AlbumEntity> {
  /**
   * The account ID the album belongs to.
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

  @HasMany(() => AlbumArtistEntity)
  declare albumArtists?: AlbumArtistEntity[];

  /**
   * The cover image for the album (if one exists).
   */
  @Column({
    type: DataType.BLOB,
  })
  declare coverImage: Buffer;

  /**
   * The MIME type of the cover image for the album for tailering the Content-Type header when serving the image.
   */
  @Column(DataType.STRING(255))
  declare coverImageMimeType: string;

  @Column(DataType.STRING(7))
  declare coverImageLightVibrant?: string | null;

  @Column(DataType.STRING(7))
  declare coverImageDarkVibrant?: string | null;

  @Column(DataType.STRING(7))
  declare coverImageMuted?: string | null;

  @Column(DataType.STRING(7))
  declare coverImageVibrant?: string | null;

  @Column(DataType.STRING(7))
  declare coverImageDarkMuted?: string | null;

  @Column(DataType.STRING(7))
  declare coverImageLightMuted?: string | null;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The file path for the music file relative to the root path.
   */
  @Column(DataType.STRING(255))
  declare folderPath: string;

  @HasMany(() => FileEntity)
  declare files?: FileEntity[];

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

  /**
   * The root path ID the file resides in
   */
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

  @Column(DataType.STRING(255))
  declare titleNormalized: string;

  @Column(DataType.INTEGER)
  declare year: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
