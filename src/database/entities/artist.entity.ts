import { AlbumArtistEntity } from './album-artist.entity';
import { Column, DataType, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { LinkedArtistEntity } from './linked-artist.entity';

/**
 * The ArtistEntity holds all of the information required for an album or song artist
 */
@Table({
  tableName: 'artists',
  timestamps: true,
  underscored: true,
})
export class ArtistEntity extends Model<ArtistEntity> {
  @HasMany(() => AlbumArtistEntity)
  declare albumArtists: AlbumArtistEntity[];

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
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  @HasMany(() => LinkedArtistEntity)
  declare linkedArtists: LinkedArtistEntity[];

  /**
   * The name of the artist
   */
  @Column(DataType.STRING(255))
  declare name: string;

  /**
   * The normalized name of the artist
   */
  @Column(DataType.STRING(255))
  declare nameNormalized: string;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
