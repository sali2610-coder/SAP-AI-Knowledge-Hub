// Knowledge base indexer for SAP AI Knowledge Hub.
// Walks knowledge-base/*.pdf, extracts text from the first N pages of each
// book, then writes a slim .index/ folder used by the frontend to populate
// agent metadata, book sources and mock streaming responses.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KB_DIR = path.join(ROOT, "knowledge-base");
const OUT_DIR = path.join(KB_DIR, ".index");
const LIB_INDEX = path.join(ROOT, "lib", "kb-index.json");

const FULL_SCAN = process.env.FULL_SCAN === "1";
const PAGE_BUDGET = FULL_SCAN ? Infinity : 300;   // full-index scans every page
const TEXT_BUDGET = FULL_SCAN ? 600_000 : 150_000; // chars saved per book
const TERM_LIMIT = 40;         // top terms per book
const PARA_TARGET = 520;       // soft char target per RAG paragraph chunk
const PARA_MIN = 180;          // skip noise (page numbers, headers)
const PARA_MAX = 900;

const MODULE_HINTS = [
  { rx: /production planning|pp[-\s]?ds/i, module: "PP", agents: ["pp", "architect"] },
  { rx: /plant maintenance/i, module: "PM", agents: ["pm", "architect"] },
  { rx: /quality management/i, module: "QM", agents: ["qm", "architect"] },
  { rx: /warehouse management/i, module: "WM", agents: ["wm", "architect"] },
  { rx: /sourcing and procurement|mm|materials management/i, module: "MM", agents: ["mm", "architect"] },
  { rx: /sales and operations|ibp/i, module: "IBP", agents: ["pp", "architect"] },
  { rx: /fiori/i, module: "Fiori", agents: ["architect", "abap-s4"] },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.pdf$/, "")
    .replace(/__\s*copy.*$/i, "")
    .replace(/\b[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function prettyTitle(name) {
  return name
    .replace(/\.pdf$/, "")
    .replace(/__\s*copy.*$/i, "")
    .replace(/\b[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeHexBlob(title) {
  return /^[a-f0-9]{20,}$/i.test(title.replace(/\s+/g, ""));
}

function deriveTitleFromText(text) {
  if (!text) return null;
  const firstChunk = text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
  const sentence = firstChunk.split(/[.!?\n]/)[0]?.trim();
  if (!sentence) return null;
  const cleaned = sentence
    .replace(/email[:\s].*$/i, "")
    .replace(/call\s*\/?\s*whatsapp.*$/i, "")
    .replace(/\bwww\.[^\s]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 8) return null;
  return cleaned
    .slice(0, 90)
    .replace(/^\s*\d+\s*/, "")
    .trim();
}

function detectModule(title) {
  for (const hint of MODULE_HINTS) {
    if (hint.rx.test(title)) return { module: hint.module, agents: hint.agents };
  }
  return { module: "General", agents: ["architect"] };
}

const STOPWORDS = new Set([
  "the","and","for","with","that","this","from","into","you","your","are","not",
  "but","can","will","have","has","was","were","one","two","all","any","its",
  "out","more","than","when","then","each","also","such","using","use","used",
  "uses","sap","s4","s4hana","press","chapter","section","figure","table",
  "page","pages","note","appendix","copyright","ltd","gmbh","inc","author"
]);

function topTerms(text) {
  const counts = new Map();

  // Plain words.
  for (const m of text.matchAll(/\b[A-Za-z][A-Za-z\-]{3,}\b/g)) {
    const w = m[0].toLowerCase();
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }

  // SAP transaction codes (e.g. MD01N, ME21N, IW31, COR1).
  const tcodes = new Set();
  for (const m of text.matchAll(/\b([A-Z]{2,4}[0-9]{1,3}[A-Z]?)\b/g)) {
    if (m[1].length <= 6) tcodes.add(m[1]);
  }

  // SAP table names (typical 4-5 uppercase letters, e.g. EKKO, MARA).
  const tables = new Set();
  for (const m of text.matchAll(/\b([A-Z]{4,5})\b/g)) {
    const t = m[1];
    if (!/^[AEIOU]+$/.test(t)) tables.add(t);
  }

  const wordTerms = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TERM_LIMIT)
    .map(([w]) => w);

  return {
    keywords: wordTerms,
    tcodes: [...tcodes].slice(0, 25),
    tables: [...tables].slice(0, 25),
  };
}

function detectChapters(text) {
  const seen = new Set();
  const chapters = [];
  for (const m of text.matchAll(/(?:^|\n)\s*(?:chapter\s+)?(\d{1,2})[\.\):\s]+([A-Z][A-Za-z0-9 ,\-\/&]{6,80})/g)) {
    const num = parseInt(m[1], 10);
    const title = m[2].trim().replace(/\s+/g, " ");
    const key = `${num}-${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    if (num < 1 || num > 30) continue;
    seen.add(key);
    chapters.push({ n: num, title });
    if (chapters.length >= 20) break;
  }
  return chapters;
}

async function loadPdfLib() {
  // pdfjs-dist legacy build runs cleanly under Node without DOM.
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return mod;
}

async function extractPdfText(pdfjs, filePath) {
  const data = new Uint8Array(await fs.readFile(filePath));
  const standardFontDataUrl = `file://${path.join(ROOT, "node_modules/pdfjs-dist/standard_fonts")}/`;
  const loadingTask = pdfjs.getDocument({
    data,
    standardFontDataUrl,
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
  });
  const doc = await loadingTask.promise;
  const totalPages = doc.numPages;
  const pagesToRead = Math.min(totalPages, PAGE_BUDGET);

  let combined = "";
  const pages = [];
  for (let i = 1; i <= pagesToRead; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((it) => (it && it.str) || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) {
        pages.push({ n: i, text: pageText });
        combined += "\n\n" + pageText;
      }
      if (combined.length > TEXT_BUDGET * 1.4) break;
    } catch {
      continue;
    }
  }

  await doc.cleanup();
  await doc.destroy();
  return { text: combined.slice(0, TEXT_BUDGET), pages, totalPages };
}

// Split a single page's text into RAG paragraphs (soft target ~520 chars).
function chunkPage(pageText) {
  const sentences = pageText.split(/(?<=[.!?])\s+(?=[A-Z])/);
  const chunks = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > PARA_MAX && buf.length >= PARA_MIN) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? buf + " " + s : s;
      if (buf.length >= PARA_TARGET && /[.!?]\s*$/.test(buf)) {
        chunks.push(buf.trim());
        buf = "";
      }
    }
  }
  if (buf.trim().length >= PARA_MIN) chunks.push(buf.trim());
  return chunks;
}

// English + Hebrew tokenizer for BM25.
function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_֐-׿\s\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function buildSearchIndex(books) {
  const docs = [];
  for (const b of books) {
    for (const para of b._paragraphs) {
      docs.push({
        id: `${b.slug}::p${para.page}::c${para.idx}`,
        bookSlug: b.slug,
        bookTitle: b.title,
        module: b.module,
        page: para.page,
        chunkIndex: para.idx,
        text: para.text,
      });
    }
  }

  const df = new Map();
  const docTokens = docs.map((d) => {
    const toks = tokenize(d.text);
    const unique = new Set(toks);
    for (const u of unique) df.set(u, (df.get(u) || 0) + 1);
    return toks;
  });

  const N = docs.length;
  const idf = {};
  for (const [term, n] of df.entries()) {
    idf[term] = Math.log(1 + (N - n + 0.5) / (n + 0.5));
  }

  const avgLen =
    docs.length === 0
      ? 0
      : docTokens.reduce((acc, t) => acc + t.length, 0) / docTokens.length;

  return {
    avgLen,
    N,
    idf,
    docs: docs.map((d, i) => ({
      ...d,
      len: docTokens[i].length,
      tf: termFreq(docTokens[i]),
    })),
  };
}

function termFreq(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  return tf;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  let entries = [];
  try {
    entries = await fs.readdir(KB_DIR);
  } catch {
    console.error(`No knowledge-base/ directory at ${KB_DIR}`);
    process.exit(1);
  }

  const pdfs = entries.filter((f) => f.toLowerCase().endsWith(".pdf")).sort();
  if (pdfs.length === 0) {
    console.error("No PDFs found in knowledge-base/.");
    process.exit(1);
  }

  console.log(`Indexing ${pdfs.length} PDFs from knowledge-base/ [${FULL_SCAN ? "FULL SCAN - all pages" : `up to ${PAGE_BUDGET} pages`}]`);

  const pdfjs = await loadPdfLib();
  const index = [];

  for (const file of pdfs) {
    let title = prettyTitle(file);
    const slug = slugify(file);
    let { module, agents } = detectModule(title);
    const abs = path.join(KB_DIR, file);

    process.stdout.write(`- ${title} ... `);
    try {
      const { text, pages, totalPages } = await extractPdfText(pdfjs, abs);
      const { keywords, tcodes, tables } = topTerms(text);
      const chapters = detectChapters(text);

      // If the filename was a hex blob, derive a real title from the cover
      // page text and re-classify the module.
      if (looksLikeHexBlob(title)) {
        const derived = deriveTitleFromText(text);
        if (derived) {
          title = derived;
          const reclassified = detectModule(derived);
          if (reclassified.module !== "General") {
            module = reclassified.module;
            agents = reclassified.agents;
          } else {
            module = "Foundation";
            agents = ["architect"];
          }
          console.log(`  (derived title: "${title}", module: ${module})`);
        }
      }

      await fs.writeFile(path.join(OUT_DIR, `${slug}.txt`), text, "utf8");
      await fs.writeFile(
        path.join(OUT_DIR, `${slug}.pages.json`),
        JSON.stringify({ slug, pages }, null, 0),
        "utf8",
      );

      const paragraphs = [];
      for (const pg of pages) {
        const chunks = chunkPage(pg.text);
        chunks.forEach((c, i) =>
          paragraphs.push({ page: pg.n, idx: i, text: c }),
        );
      }

      const entry = {
        slug,
        title,
        file,
        module,
        agents,
        pageCount: totalPages,
        chapters,
        terms: keywords,
        tcodes,
        tables,
      };
      Object.defineProperty(entry, "_paragraphs", {
        value: paragraphs,
        enumerable: false,
      });
      index.push(entry);
      console.log(
        `ok (${totalPages}p extracted=${pages.length}, ${paragraphs.length} chunks, ${tcodes.length} tcodes)`,
      );
    } catch (err) {
      console.log(`failed: ${err.message}`);
      index.push({
        slug,
        title,
        file,
        module,
        agents,
        pageCount: 0,
        chapters: [],
        terms: [],
        tcodes: [],
        tables: [],
        error: String(err.message || err),
      });
    }
  }

  const payload = { generatedAt: new Date().toISOString(), books: index };
  const json = JSON.stringify(payload, null, 2);

  await fs.writeFile(path.join(OUT_DIR, "index.json"), json, "utf8");
  await fs.mkdir(path.dirname(LIB_INDEX), { recursive: true });
  await fs.writeFile(LIB_INDEX, json, "utf8");

  // Build and write the BM25 search index used by lib/rag.ts.
  const search = buildSearchIndex(index);
  const searchPath = path.join(ROOT, "lib", "kb-search-index.json");
  await fs.writeFile(searchPath, JSON.stringify(search), "utf8");
  console.log(
    `\nWrote ${index.length} books, ${search.docs.length} RAG chunks (${Math.round(search.avgLen)} avg tokens) to ${path.relative(ROOT, LIB_INDEX)} + ${path.relative(ROOT, searchPath)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
