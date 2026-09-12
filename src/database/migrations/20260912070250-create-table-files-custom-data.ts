import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('files_custom_data', {
    album_artists: DataTypes.STRING(1000),
    album_title: DataTypes.STRING(255),
    artists: DataTypes.STRING(1000),
    comment: DataTypes.STRING(255),
    composers: DataTypes.STRING(1000),
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    disc_number: DataTypes.INTEGER,
    duration: DataTypes.FLOAT,
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'files',
        key: 'id',
      },
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: DataTypes.STRING(255),
    track_number: DataTypes.INTEGER,
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    year: DataTypes.INTEGER,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('files_custom_data');
}
