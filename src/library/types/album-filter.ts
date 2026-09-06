/**
 * The filters that can be applied when querying for albums in the library.
 */
export type AlbumFilters = {
  /*
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedAfter?: Date;
  /**
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedBefore?: Date;
  /**
   * Optional filter for the artist(s), which will do a case-insensitive match against the
   * artists associated with an album.
   */
  artist?: string[];
  /**
   * Optional filter for the composer(s), which will do a case-insensitive match against the
   * composers associated with an album.
   */
  composer?: string[];
  /**
   * Optional filter for the genre(s), which will do a case-insensitive match against the
   * genres associated with an album.
   */
  genre?: string[];
  /**
   * Optional filter for the maximum rating value, which will do an exact match against the
   * aggregate rating of an album's tracks.
   */
  maxRating?: number;
  /**
   * Optional filter for the minimum rating value, which will do an exact match against the
   * aggregate rating of an album's tracks.
   */
  minRating?: number;
  /**
   * Optional filter for a case-insensitive partial-match against album, artist, composer, or genre.
   */
  filter?: string;
  /**
   * Optional filter for the release year, which will do an exact match against the
   */
  year?: number;
};
