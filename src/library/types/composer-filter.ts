/**
 * The filters that can be applied when querying for composers in the library.
 */
export type ComposerFilters = {
  /**
   * Optional filter for the date the composer was added to the library, which will do an exact match against
   * the date the composer was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedAfter?: Date;
  /**
   * Optional filter for the date the composer was added to the library, which will do an exact match against
   * the date the composer was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedBefore?: Date;
  /**
   * Optional filter for a case-insensitive partial-match against the composer's name.
   */
  filter?: string;
  /**
   * Optional filter for the genre(s), which will do a case-insensitive match against the
   * genres associated with an album.
   */
  genre?: string[];
};
