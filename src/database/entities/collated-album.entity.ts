import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

/**
 * The CollatedAlbumEntity selects data from a view that collates album information
 * from all of its related tables including artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_albums_data',
  underscored: true,
  timestamps: false,
})
export class CollatedAlbumEntity extends Model<CollatedAlbumEntity> {
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
  @Column(DataType.DATE)
  declare createdAt: Date;

  /**
   * The album ID the file belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('artists');
      return rawValue?.split(',').map((artist: string) => artist.trim()) || [];
    },
  })
  declare artists: string[];

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('composers');
      return rawValue?.split(',').map((composer: string) => composer.trim()) || [];
    },
  })
  declare composers: string[];

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('genres');
      return rawValue?.split(',').map((genre: string) => genre.trim()) || [];
    },
  })
  declare genres: string[];

  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.INTEGER)
  declare year: number;
}
