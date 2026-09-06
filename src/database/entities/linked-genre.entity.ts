import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';
import { GenreEntity } from './genre.entity';

/**
 * The LinkedGenreEntity holds a reference to the association between a genre and meta data.
 */
@Table({
  tableName: 'linked_genres',
  timestamps: true,
  underscored: true,
})
export class LinkedGenreEntity extends Model<LinkedGenreEntity> {
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
   * The linked file ID.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: FileEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => FileEntity)
  declare fileId: number;

  /**
   * The linked file.
   */
  @BelongsTo(() => FileEntity)
  declare file?: FileEntity;

  /**
   * The linked genre.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: GenreEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => GenreEntity)
  declare genreId: number;

  @BelongsTo(() => GenreEntity)
  declare genre?: GenreEntity;

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

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
