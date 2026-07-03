export type SearchResult = {
  id: string;
  title: string;
  link: string;
  type: "deck" | "card";
};

export interface SearchRepository {
  search(query: string, userId: string): Promise<SearchResult[]>;
}
