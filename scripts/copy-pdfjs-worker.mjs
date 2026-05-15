#!/usr/bin/env node
// Copy the pdfjs-dist worker into public/ so the browser can load it
// from /pdfjs-worker.mjs without bundling.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url)) + "/..";
const SRC = join(ROOT, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const DEST_DIR = join(ROOT, "public");
const DEST = join(DEST_DIR, "pdfjs-worker.mjs");

if (!existsSync(SRC)) {
  console.warn(`[copy-pdfjs-worker] source missing: ${SRC} - skipped`);
  process.exit(0);
}
mkdirSync(DEST_DIR, { recursive: true });
copyFileSync(SRC, DEST);
console.log(`[copy-pdfjs-worker] ${SRC} -> ${DEST}`);
