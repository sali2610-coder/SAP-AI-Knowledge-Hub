// Helpers that surface the indexed corpus into UI surfaces (home KPI strip,
// library guide cards). Marked server-only so the 5MB+ search index never
// ends up in a client bundle - server pages call these, then serialize the
// shrunk result into props for client components.

import "server-only";
import searchData from "./kb-search-index.json";
import { kbIndex } from "./kb";

interface SearchDocLite {
  id: string;
  bookSlug: string;
  bookTitle: string;
  module: string;
  page: number;
  chunkIndex: number;
  text: string;
  len: number;
}

interface SearchIndexLite {
  avgLen: number;
  N: number;
  idf: Record<string, number>;
  docs: SearchDocLite[];
}

const DATA = searchData as unknown as SearchIndexLite;

export interface CorpusStats {
  books: number;
  chunks: number;
  modules: number;
  generatedAt: string;
  totalPages: number;
}

export function getCorpusStats(): CorpusStats {
  const modules = new Set(kbIndex.books.map((b) => b.module));
  const totalPages = kbIndex.books.reduce((acc, b) => acc + (b.pageCount || 0), 0);
  return {
    books: kbIndex.books.length,
    chunks: DATA.docs.length,
    modules: modules.size,
    generatedAt: kbIndex.generatedAt,
    totalPages,
  };
}

export interface GuideHighlight {
  paragraphId: string;
  page: number;
  chunkIndex: number;
  snippet: string;
  chapter?: string;
}

export interface BookGuide {
  slug: string;
  title: string;
  module: string;
  pageCount: number;
  chunks: number;
  agents: string[];
  tcodes: string[];
  tables: string[];
  topics: string[];
  highlights: GuideHighlight[];
}

const SAP_NOISE = new Set([
  "ebook", "press", "rheinwerk", "publishing", "chapter", "edition", "copyright",
  "reserved", "trademark", "isbn", "version", "release", "tdz", "all", "rights",
  "company", "https", "http", "www", "com", "html", "page", "pages",
]);

const TABLE_NOISE = new Set([
  "ISBN", "PRESS", "EPUB", "HANA", "ABAP", "EBOOK", "EMAIL", "CALL",
  "TEST", "SPRO", "REACH", "PART", "ASAP", "RFID", "BAPI", "FMEA",
  "DDMRP", "MSSQL", "MSTQH", "KUAN", "CHUNG", "COGS", "COGM", "COMAC",
  "OBYC", "SICF", "FPRH", "APICS", "SCOR", "HTML", "HTML5", "BYOL",
  "JAVA", "COVID", "SERV", "LCCN", "LCSH", "LIMS", "NPDI", "POSC", "LOSC",
  "IDOC",
]);

function clean<T extends string>(arr: T[], noise: Set<T>): T[] {
  return arr.filter((x) => !noise.has(x));
}

function chapterFor(
  page: number,
  chapters: { n: number; title: string }[],
): string | undefined {
  let best: { n: number; title: string } | undefined;
  for (const c of chapters) {
    if (c.n <= page && (!best || c.n > best.n)) best = c;
  }
  if (!best) return undefined;
  return best.title.length > 60 ? best.title.slice(0, 59) + "…" : best.title;
}

function topTopicsFromChunks(chunks: SearchDocLite[], n = 6): string[] {
  const counts = new Map<string, number>();
  for (const ch of chunks) {
    for (const m of ch.text.matchAll(/\b([A-Z][A-Z0-9_]{3,18})\b/g)) {
      const w = m[1];
      if (SAP_NOISE.has(w.toLowerCase())) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

function cleanSnippet(s: string, max = 220): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export function getBookGuides(): BookGuide[] {
  const bySlug = new Map<string, SearchDocLite[]>();
  for (const d of DATA.docs) {
    if (!bySlug.has(d.bookSlug)) bySlug.set(d.bookSlug, []);
    bySlug.get(d.bookSlug)!.push(d);
  }

  return kbIndex.books.map((book) => {
    const docs = (bySlug.get(book.slug) ?? []).sort(
      (a, b) => a.page - b.page || a.chunkIndex - b.chunkIndex,
    );
    const topics = topTopicsFromChunks(docs);
    const highlights: GuideHighlight[] = docs
      .filter((d) => d.text.length >= 240 && d.text.length <= 700)
      .slice(0, 3)
      .map((d) => ({
        paragraphId: d.id,
        page: d.page,
        chunkIndex: d.chunkIndex,
        snippet: cleanSnippet(d.text),
        chapter: chapterFor(d.page, book.chapters),
      }));

    return {
      slug: book.slug,
      title: book.title,
      module: book.module,
      pageCount: book.pageCount,
      chunks: docs.length,
      agents: book.agents,
      tcodes: book.tcodes.slice(0, 6),
      tables: clean(book.tables, TABLE_NOISE).slice(0, 6),
      topics,
      highlights,
    };
  });
}
