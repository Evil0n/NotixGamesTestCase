export type SearchItem = {
  id: string;
  title: string;
  snippet: string;
};

export type SearchResponse = {
  query: string;
  items: ReadonlyArray<SearchItem>;
};
