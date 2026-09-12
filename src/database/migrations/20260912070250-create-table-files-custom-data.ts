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
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'files',
        key: 'id',
      },
    },
    genres: DataTypes.STRING(1000),
    id: {
      comment: 'This ID is not auto-generating, it must be set manually and should be the corresponding file ID.',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
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
