import { AccountEntity } from './account.entity';
import { ArtistEntity } from './artist.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

/**
 * The CollatedArtistEntity selects data from a view that collates artist information
 * for for a user from all of its related tables.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_artists_data',
  underscored: true,
  timestamps: false,
})
export class CollatedArtistEntity extends Model<CollatedArtistEntity> {
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
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.STRING(255))
  declare nameNormalized: string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    references: {
      model: ArtistEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => ArtistEntity)
  declare id: number;

  @BelongsTo(() => ArtistEntity)
  declare artist: ArtistEntity;
}
