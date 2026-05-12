# SAP AI Knowledge Hub

The Copilot for SAP implementers. Chat with SAP Press core titles in Hebrew (or English), get answers with mermaid flowcharts, ABAP / Tosca code blocks and source citations. Built for **Sali Halif**.

> MVP scaffold - Phase 1 + 2 of the PRD. The frontend posts full payloads to an external RAG endpoint; until that endpoint is wired, `/api/chat` returns a grounded mock stream so the entire UI is demoable end-to-end.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind v4 + shadcn/ui on top of `@base-ui/react`, RTL enabled at init
- Framer Motion + Aceternity-style `BackgroundBeams`
- Zustand + persist (localStorage) for conversations, agent, language
- SSE-style streaming (`/api/chat`), proxied to `process.env.SAP_AI_ENDPOINT` when set
- `react-markdown` + `remark-gfm`, Mermaid (lazy), `react-syntax-highlighter` with custom **ABAP** + **Tosca** Prism grammars

## Quick start

```bash
npm install
npm run kb:index     # extract excerpts + metadata from knowledge-base/*.pdf
npm run dev          # http://localhost:3000
```

Optional - copy `.env.example` to `.env.local` and set `SAP_AI_ENDPOINT` once your RAG backend is up.

## Agents (MVP)

| Agent           | Module         | Grounded in books                                        |
|-----------------|----------------|----------------------------------------------------------|
| PP Expert       | Production     | Production Planning, PP-DS, IBP                          |
| ABAP S/4        | Development    | Internal model knowledge - Clean Core, CDS, RAP          |
| Tosca           | Automation     | Internal model knowledge - T-Box, XL5, Recovery          |
| Solution Arch.  | Architecture   | SAP Fiori Apps Quick Reference, IBP                      |
| PM (Beta)       | Asset Mgmt     | Configuring PM, PM Business User Guide                   |
| QM (Beta)       | Quality        | Quality Management with S/4HANA                          |
| WM / EWM (Beta) | Warehouse      | Integrating Warehouse Management in S/4HANA              |
| MM (Beta)       | Procurement    | Sourcing and Procurement with S/4HANA                    |

## Folder map

- `app/` - landing, chat workspace, `/api/chat` proxy route
- `components/landing/` - hero, BackgroundBeams, agent grid, library cards
- `components/chat/` - shell, sidebar, agent selector, composer, message list, markdown, code block, mermaid block, citations
- `lib/agents.ts` - agent registry
- `lib/store.ts` - Zustand store (persisted)
- `lib/syntax/abap.ts`, `lib/syntax/tosca.ts` - Prism grammar registrars
- `lib/mock-stream.ts` - grounded canned answers used when no backend is configured
- `scripts/index-kb.mjs` - PDF indexer
- `knowledge-base/` - SAP Press PDFs (git-ignored)

## Conventions

- Hebrew first, English available via the language toggle.
- ASCII `-` only - never `—` or `–`.
- Dark mode only in MVP.
- `shadcn` Buttons here use the base-ui flavor: no `asChild`. For link-styled buttons apply `buttonVariants({...})` to a `<Link>`.

## Built for

Sali Halif - SAP AI Knowledge Hub.
