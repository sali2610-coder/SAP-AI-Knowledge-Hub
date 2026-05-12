import indexJson from "./kb-index.json";
import type { BookEntry, KbIndex } from "./types";

const data = indexJson as KbIndex;

export const kbIndex: KbIndex = data;

export function getBooks(): BookEntry[] {
  return data.books;
}

export function getBooksForAgent(agentId: string): BookEntry[] {
  return data.books.filter((b) => b.agents.includes(agentId));
}

export function getBook(slug: string): BookEntry | undefined {
  return data.books.find((b) => b.slug === slug);
}
