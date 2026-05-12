// Lightweight retrieval over the indexed SAP Press corpus. Uses BM25 over
// pre-tokenized paragraph chunks emitted by scripts/index-kb.mjs.
// Server + client safe (pure JSON + arithmetic).

import searchData from "./kb-search-index.json";

interface SearchDoc {
  id: string;
  bookSlug: string;
  bookTitle: string;
  module: string;
  page: number;
  chunkIndex: number;
  text: string;
  len: number;
  tf: Record<string, number>;
}

interface SearchIndex {
  avgLen: number;
  N: number;
  idf: Record<string, number>;
  docs: SearchDoc[];
}

const INDEX = searchData as unknown as SearchIndex;

const K1 = 1.2;
const B = 0.75;

const STOPWORDS = new Set([
  "the","and","for","with","that","this","from","into","you","your","are","not",
  "but","can","will","have","has","was","were","one","two","all","any","its",
  "out","more","than","when","then","each","also","such","using","use","used",
  "uses","sap","s4","s4hana","press","chapter","section","figure","table",
  "page","pages","note","appendix","copyright","ltd","gmbh","inc","author",
  "what","how","why","where","mit","ist","der","die","das",
]);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_֐-׿\s\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export interface Hit {
  doc: SearchDoc;
  score: number;
  matchedTerms: string[];
}

export function retrieve(query: string, k = 5): Hit[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const seen = new Set<string>(qTokens);

  const scored: Hit[] = [];
  for (const doc of INDEX.docs) {
    let score = 0;
    const matched: string[] = [];
    for (const term of seen) {
      const tf = doc.tf[term];
      if (!tf) continue;
      const idf = INDEX.idf[term] ?? 0;
      const norm = 1 - B + B * (doc.len / Math.max(INDEX.avgLen, 1));
      const contribution = idf * ((tf * (K1 + 1)) / (tf + K1 * norm));
      score += contribution;
      matched.push(term);
    }
    if (score > 0) scored.push({ doc, score, matchedTerms: matched });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// Treat anything below this as "no relevant book passage". Tuned empirically
// for the current ~360-paragraph corpus; refine after corpus grows.
const GROUNDED_THRESHOLD = 3.5;

export function isGrounded(hits: Hit[]): boolean {
  return hits.length > 0 && hits[0].score >= GROUNDED_THRESHOLD;
}

export function formatCitation(h: Hit) {
  return {
    bookSlug: h.doc.bookSlug,
    bookTitle: h.doc.bookTitle,
    chapter: `p. ${h.doc.page} - chunk ${h.doc.chunkIndex + 1}`,
    page: h.doc.page,
  };
}
