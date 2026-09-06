/**
 * Paginated result set containing one page of results and the total-count of all results.
 */
export type ListResult<T> = {
  /**
   * The total number of items that match the query filter which may be greater than the items in the current page.
   */
  total: number;
  /**
   * The list of items returned for the current page, which may be empty if there are no matching items.
   */
  items: T[];
};
