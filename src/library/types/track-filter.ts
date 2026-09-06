/**
 * The filters that can be applied when querying for tracks in the library.
 */
export type TrackFilters = {
  /**
   * Optional filter for the album(s), which will do a case-insensitive match against the
   * album titles of  tracks.
   */
  album?: string;
  /**
   * Optional filter for the album artist(s), which will do a case-insensitive match against the
   * album artists associated with a track.
   */
  albumArtist?: string[];
  /*
   * Optional filter for the date the track was added to the library, which will do an exact match against
   * the date the track was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedAfter?: Date;
  /**
   * Optional filter for the date the track was added to the library, which will do an exact match against
   * the date the track was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedBefore?: Date;
  /**
   * Optional filter for the artist(s), which will do a case-insensitive match against the
   * artists associated with a track.
   */
  artist?: string[];
  /**
   * Optional filter for the composer(s), which will do a case-insensitive match against the
   * composers associated with a track.
   */
  composer?: string[];
  /**
   * Optional filter for a case-insensitive partial-match against track title, album, artist, composer, or genre.
   */
  filter?: string;
  /**
   * Optional filter for the genre(s), which will do a case-insensitive match against the
   * genres associated with a track.
   */
  genre?: string[];
  /**
   * Optional filter for the maximum rating value, which will do an exact match against the
   * aggregate rating of a track.
   */
  maxRating?: number;
  /**
   * Optional filter for the minimum rating value, which will do an exact match against the
   * aggregate rating of a track.
   */
  minRating?: number;
  /**
   * Optional filter for the release year, which will do an exact match against the track's release year.
   */
  year?: number;
};
