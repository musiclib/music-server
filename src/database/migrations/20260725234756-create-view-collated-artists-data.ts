import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
CREATE VIEW collated_artists_data AS
SELECT 
	DISTINCT(artists.name) AS name,
	artists.name_normalized,
	artists.id,
  artists.created_at,
	albums.account_id
FROM artists
INNER JOIN album_artists on album_artists.artist_id = artists.id
INNER JOIN albums ON albums.id = album_artists.album_id
GROUP BY artists.name
    `,
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
      DROP VIEW IF EXISTS collated_artists_data;
    `,
  );
}
