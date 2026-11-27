/** One page of a list, as returned by every admin `list…` query. */
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
