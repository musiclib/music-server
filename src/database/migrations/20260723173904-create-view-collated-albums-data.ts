import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
CREATE VIEW collated_albums_data AS
SELECT 
	albums.id,
	albums.account_id,
  albums.created_at,
	albums.cover_image_mime_type,
	albums.cover_image_vibrant,
	albums.cover_image_dark_vibrant,
	albums.cover_image_light_vibrant,
	albums.cover_image_muted,
	albums.cover_image_dark_muted,
	albums.cover_image_light_muted,
	albums.title,
	albums.year,
	(
		SELECT group_concat(unique_artists.name, ', ') 
		FROM (
			SELECT DISTINCT(name)  as name
			FROM artists 
			INNER JOIN album_artists ON album_artists.album_id=albums.id AND album_artists.artist_id=artists.id
  		) as unique_artists
	) AS artists,
	(
		SELECT group_concat(unique_composers.name, ', ') 
    	FROM 
		(
			SELECT DISTINCT(name) as name
			FROM composers 
			INNER JOIN linked_composers ON linked_composers.composer_id = composers.id
			INNER JOIN files on files.id = linked_composers.file_id AND files.album_id = albums.id
		) as unique_composers
	) AS composers,
	(
		SELECT group_concat(unique_genres.name, ', ') 
    	FROM (
			SELECT DISTINCT(name) as name
			FROM genres 
			INNER JOIN linked_genres ON linked_genres.genre_id = genres.id
			INNER JOIN files on files.id = linked_genres.file_id AND files.album_id = albums.id
  		) as unique_genres
	) AS genres
FROM albums 
    `,
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
      DROP VIEW IF EXISTS collated_albums_data;
    `,
  );
}
