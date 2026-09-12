import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';

/**
 * The FileEntity holds a reference to a music file within a root path. A user may have
 * multiple files referring to different music tracks.
 */
@Table({
  tableName: 'files_custom_data',
  timestamps: true,
  underscored: true,
})
export class FileCustomDataEntity extends Model<FileCustomDataEntity> {
  @Column(DataType.STRING(1000))
  declare albumArtists: string;

  @Column(DataType.STRING(255))
  declare albumTitle: string;

  @Column(DataType.STRING(1000))
  declare artists: string;

  @Column(DataType.STRING(255))
  declare comment: string;

  @Column(DataType.STRING(255))
  declare composers: string;

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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: FileEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => FileEntity)
  declare fileId: number;

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
