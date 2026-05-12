# knowledge-base/

Drop SAP Press PDFs and implementation guides here. They are read by
`scripts/index-kb.mjs` (run via `npm run kb:index`) to produce:

- `knowledge-base/.index/<slug>.txt` - first ~80 pages of plain text per book
- `knowledge-base/.index/index.json` - per-book metadata (title, module, tcodes, terms, chapter list)
- `lib/kb-index.json` - same index, imported by the Next.js app at build time

PDFs themselves are git-ignored so they never end up in the repo. Keep them
local to your machine or sync via secure storage.
