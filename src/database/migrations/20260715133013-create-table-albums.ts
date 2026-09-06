import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('albums', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    cover_image: DataTypes.BLOB,
    cover_image_mime_type: DataTypes.STRING(50),
    cover_image_vibrant: DataTypes.STRING(7),
    cover_image_dark_vibrant: DataTypes.STRING(7),
    cover_image_light_vibrant: DataTypes.STRING(7),
    cover_image_muted: DataTypes.STRING(7),
    cover_image_dark_muted: DataTypes.STRING(7),
    cover_image_light_muted: DataTypes.STRING(7),
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    folder_path: DataTypes.STRING(255),
    root_path_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'root_paths',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: DataTypes.STRING(255),
    title_normalized: DataTypes.STRING(255),
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    year: DataTypes.INTEGER,
  });
  await queryInterface.addIndex('albums', ['account_id'], {
    name: 'idx_albums_account_id',
  });
  await queryInterface.addIndex('albums', ['root_path_id'], {
    name: 'idx_albums_root_path_id',
  });
  await queryInterface.addIndex('albums', ['title'], {
    name: 'idx_albums_title',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeIndex('albums', 'idx_albums_account_id');
  await queryInterface.removeIndex('albums', 'idx_albums_root_path_id');
  await queryInterface.removeIndex('albums', 'idx_albums_title');
  await queryInterface.dropTable('albums');
}
