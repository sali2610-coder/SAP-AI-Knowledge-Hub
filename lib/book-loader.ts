// Server-only utilities for loading the extracted text of a book and
// segmenting it into chapters + paragraphs the interactive reader can render
// as clickable rows.

import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getBook } from "./kb";
import type { BookEntry } from "./types";

const ROOT = process.cwd();
const KB_INDEX_DIR = path.join(ROOT, "knowledge-base", ".index");

export interface BookParagraph {
  id: string;
  text: string;
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  paragraphs: BookParagraph[];
}

export interface BookDocument {
  book: BookEntry;
  chapters: BookChapter[];
  totalParagraphs: number;
}

const HEADING_REGEX =
  /^\s*(?:Chapter\s+)?(\d{1,2})[.):\s]+([A-Z][A-Za-z0-9 ,\-\/&()'"]{6,80})\s*$/;

function segmentParagraphs(raw: string): string[] {
  return raw
    .split(/\n{2,}/g)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 60 && p.length <= 1200);
}

function detectChapterBoundaries(blocks: string[]): {
  chapters: { number: number; title: string; from: number; to: number }[];
} {
  const heads: { number: number; title: string; index: number }[] = [];
  blocks.forEach((b, i) => {
    const m = HEADING_REGEX.exec(b);
    if (!m) return;
    const n = parseInt(m[1], 10);
    if (n < 1 || n > 30) return;
    heads.push({ number: n, title: m[2].trim(), index: i });
  });

  if (heads.length === 0) {
    return {
      chapters: [
        { number: 1, title: "Overview", from: 0, to: blocks.length },
      ],
    };
  }

  const chapters = heads.map((h, idx) => ({
    number: h.number,
    title: h.title,
    from: h.index + 1,
    to: idx + 1 < heads.length ? heads[idx + 1].index : blocks.length,
  }));

  if (heads[0].index > 0) {
    chapters.unshift({
      number: 0,
      title: "Front matter",
      from: 0,
      to: heads[0].index,
    });
  }
  return { chapters };
}

export async function loadBook(slug: string): Promise<BookDocument | null> {
  const book = getBook(slug);
  if (!book) return null;
  const filePath = path.join(KB_INDEX_DIR, `${slug}.txt`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const paragraphs = segmentParagraphs(raw);
  const { chapters: bounds } = detectChapterBoundaries(paragraphs);

  const chapters: BookChapter[] = bounds.map((c) => ({
    id: `${slug}::ch-${c.number}`,
    number: c.number,
    title: c.title,
    paragraphs: paragraphs.slice(c.from, c.to).map((text, i) => ({
      id: `${slug}::ch-${c.number}::p-${i}`,
      text,
    })),
  }));

  const total = chapters.reduce((acc, c) => acc + c.paragraphs.length, 0);
  return { book, chapters, totalParagraphs: total };
}

export async function loadParagraph(slug: string, paragraphId: string) {
  const doc = await loadBook(slug);
  if (!doc) return null;
  for (const ch of doc.chapters) {
    const p = ch.paragraphs.find((x) => x.id === paragraphId);
    if (p) return { book: doc.book, chapter: { id: ch.id, number: ch.number, title: ch.title }, paragraph: p };
  }
  return null;
}
