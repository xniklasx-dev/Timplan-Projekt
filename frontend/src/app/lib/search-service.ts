import { apiBaseUrl } from "./definitions";

export type SearchResult = {
  id: string;
  title: string;
  link: string;
  type: "deck" | "card";
};

export async function search(query: string, token: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query.trim() });
  const response = await fetch(`${apiBaseUrl}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<SearchResult[]>;
}
