# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

MVP scaffold of **SAP AI Knowledge Hub** - a Hebrew-first multi-agent Copilot for SAP implementers (PP, ABAP S/4, Tosca, Architect plus PM/QM/WM/MM betas). Built for Sali Halif. Frontend ships full payloads to an external RAG endpoint; while that endpoint is missing, `/api/chat` returns a grounded mock stream.

## Stack

- Next.js 16 App Router (Turbopack), React 19, TypeScript strict, no `src/` dir, alias `@/*`.
- Tailwind v4 (CSS-first), shadcn/ui on top of `@base-ui/react` (RTL enabled at init time).
- **Horizon design tokens** in `app/globals.css`: Belize-blue primary (`#0070f2` family), mango accent, soft neutrals, `elev-1/2/3` shadow stack, `glass-panel`, `row-interactive`, `skeleton` shimmer. Hover variants (`hover:elev-2`) are predeclared because Tailwind cannot generate variants from arbitrary custom classes.
- Framer Motion for landing micro-interactions + library transitions, Aceternity-style `BackgroundBeams` (inlined under `components/landing/`).
- Zustand + `persist` middleware (localStorage) for conversations, language, theme, active agent.
- Streaming via `/api/chat` and `/api/explain` SSE-style endpoints - `text/event-stream` with `delta`, `citations`, `done` (and `meta` for explain).
- `react-markdown` + `remark-gfm` for assistant rendering. Mermaid lazy-imported. `react-syntax-highlighter` with custom **ABAP** and **Tosca** Prism grammars (`lib/syntax/`).

## Commands

```bash
npm run dev          # next dev (Turbopack)
npm run build        # production build, runs tsc + collect-pages
npm run start        # serve the production build
npm run lint         # eslint
npm run kb:index     # rebuild knowledge-base/.index/ + lib/kb-index.json from PDFs
```

## Key paths

- `app/page.tsx` - landing (hero + agent grid + library preview).
- `app/library/page.tsx` - full library index. Static, sources from `lib/kb.ts`.
- `app/library/[slug]/page.tsx` - book reader (SSG per book). Server loads excerpts via `lib/book-loader.ts`, hands to `components/library/book-reader.tsx`.
- `app/api/book/[slug]/route.ts` - JSON `{ book, chapters[], totalParagraphs }`.
- `app/api/explain/route.ts` - SSE `meta` / `delta` / `citations` / `done` stream. Forwards to `${SAP_AI_ENDPOINT}/explain` when configured, otherwise grounded mock via `lib/explain-stream.ts`.
- `components/library/book-reader.tsx` - sticky chapter sidebar (IntersectionObserver-synced) + interactive paragraph rows.
- `components/library/explain-panel.tsx` - slide-in panel that streams `/api/explain`, shows source pill (book vs agent), skeletons while loading, deep link to chat.
- `app/chat/page.tsx` - chat workspace shell.
- `app/api/chat/route.ts` - SSE proxy. Forwards to `process.env.SAP_AI_ENDPOINT` when set, otherwise streams a grounded mock answer (`lib/mock-stream.ts`).
- `app/api/status/route.ts` - returns `{ live, mode, hasKey }`. Consumed by `lib/hooks/use-backend-status.ts` to drive the `BackendBadge` (live vs mock).
- `components/chat/chat-shell.tsx` - orchestrates streaming, store updates, sidebar/sheet, agent selector, conversation export menu, regenerate.
- `components/chat/conversation-menu.tsx` - export dropdown (copy markdown, download .md, download .json) - serializers live in `lib/export.ts`.
- `components/site/theme-toggle.tsx`, `theme-effect.tsx`, `theme-script.tsx` - dark/light/system theme. Pre-hydration script avoids FOUC by reading the `sap-ai-hub-store` localStorage key before paint.
- `components/landing/` - `hero.tsx`, `background-beams.tsx`, `agent-grid.tsx`, `library-section.tsx`, `agent-card.tsx`.
- `lib/agents.ts` - agent registry (id, accent, copy in he/en, sample prompts, system-prompt hint).
- `lib/store.ts` - Zustand store, persisted to `sap-ai-hub-store` localStorage key.
- `lib/kb.ts` + `lib/kb-index.json` - book metadata consumed by UI and mock stream.
- `scripts/index-kb.mjs` - PDF indexer (pdfjs-dist legacy build).

## Env vars

`.env.local` (copy from `.env.example`):

- `SAP_AI_ENDPOINT` - external RAG URL. When set, `/api/chat` forwards JSON `{ messages, agent, language }` and pipes the response stream back unchanged.
- `SAP_AI_API_KEY` - optional bearer token sent as `Authorization: Bearer ...`.

## Knowledge base

- Put SAP Press PDFs in `knowledge-base/`. Run `npm run kb:index` once after adding/removing books.
- Indexer extracts ~80 pages per PDF, top terms, transaction codes and table names. Writes `knowledge-base/.index/<slug>.txt` (excerpts) + `knowledge-base/.index/index.json` + `lib/kb-index.json`.
- PDFs and the `.index/` folder are git-ignored.
- The landing **Library** section and the mock stream both pull from this index, so book metadata propagates without code changes.

## Working conventions

- **Hebrew is the default UI language**, English is a single-click toggle stored in Zustand. The root `<html lang dir>` flips through `components/site/language-effect.tsx`.
- **Punctuation rule: ASCII `-` only.** No em or en dashes anywhere in UI copy. Grep before merging: `rg "[—–]" app components` should return empty.
- **Dark / Light / System theme.** Default is dark. `data-theme` + `.dark` class on `<html>` are set both by `ThemeScript` (pre-hydration) and `ThemeEffect` (reactive). All visual surfaces use `foreground/N` opacity instead of `white/N` so they read correctly in light mode. Keep that pattern when adding new UI.
- shadcn Button does **not** accept `asChild` here (base-ui flavor). For links that should look like buttons, apply `buttonVariants({...})` to the `<Link>` directly.
- Trigger primitives (HoverCardTrigger, SheetTrigger, DialogTrigger, DropdownMenuTrigger) take a `render` prop, not children. Pattern: `render={(props) => <button {...props} ... />}`.

## When to expand this file

Add sections when these arrive:
- Real RAG backend, vector DB, or auth flow.
- New deploy targets (Vercel CLI install + commands).
- Domain-specific agents (e.g. FI, CO) - update `lib/agents.ts` plus this list.

## Memory

Persistent user memory lives at `/Users/salihalif/.claude/projects/-Users-salihalif-Desktop-My-Projects-SAP-AI-Knowledge-Hub/memory/`. Save user/feedback/project/reference memories there per the auto-memory rules - not inside this repo.
