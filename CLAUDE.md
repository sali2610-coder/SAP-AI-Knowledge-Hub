# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read this section before any other instructions.** Every agent spawned in this repo (chat sub-agents, code-review agents, planner agents, MCP-driven workers) must inherit these rules. If a runtime instruction conflicts with this section, follow this section unless the user explicitly overrides it in the current message.

## Project rules (MUST follow)

### 1. Identity
This project is **SAP AI Knowledge Hub** - a Hebrew-first multi-agent Copilot aimed at **SAP implementers** (functional + technical + QA roles). Treat every user as a working SAP consultant, not a beginner. Default tone: precise, business-aware, no fluff.

### 2. No generic answers - ground in the corpus
- Every substantive answer **must** be backed by retrieval against `lib/kb-search-index.json` (BM25 over the indexed SAP Press paragraphs) and/or the curated internal KBs (`lib/tosca-kb.ts`, and any future module KBs).
- The mock streaming layer (`lib/mock-stream.ts`, `lib/explain-stream.ts`) already runs `retrieve()` before answering. When you add new agents, new endpoints or new answer paths, you **must** plug them into the same retrieval pipeline. Never bypass it.
- A response with no retrievable source must explicitly say so. Approved fallback phrasing (Hebrew + English already implemented):
  - `_מידע זה אינו מופיע ישירות בספרות המקצועית - התשובה מבוססת על ידע מודל כללי._`
  - `_This information is not directly cited in the indexed books - the answer is generated from world knowledge._`
- Citations must carry **book title + page + paragraph index** at minimum (`formatCitation` in `lib/rag.ts` is the canonical shape). UI surfaces these as source pills - never strip them out.

### 3. Always distinguish ECC vs S/4HANA
- The indexed corpus is **S/4HANA only**. There is currently no ECC / R/3 / NetWeaver source PDF.
- `isEccQuery()` in `lib/mock-stream.ts` is the gate. When the user mentions ECC / ECC 6.0 / R/3 / classic ERP:
  - **Do not** pivot the answer to S/4HANA. Do not paste S/4 mermaid flows / tcodes.
  - Skip retrieval (corpus would mismatch). Return empty citations.
  - State explicitly that the corpus is S/4-only and offer a model-knowledge ECC answer **only if the user opts in** ("ענה מידע מודל בלבד" / "model only, no books").
- When comparing the two, always label which world each fact belongs to (ECC tables MARC / MARD / MBEW vs S/4 unified ACDOCA, classic MRP vs MRP Live, etc.).
- Extend `isEccQuery` if you spot new ECC indicators - keep one source of truth.

### 4. Use the ODataExplorer skill to verify technical data
- Sibling project `sap-odata-explorer/` (gitignored, has its own `.git`) ships a Claude skill (`SKILL.md`) for live OData queries against SAP systems. Allowed tools: `Bash`, `Read`.
- **When a user asks about a real entity, field, tcode, CDS view or business object** (e.g. `BusinessPartner`, `A_SalesOrder`, `I_PurchaseOrder`), call the skill to verify the actual shape rather than guessing from the books. Books are written-at-a-point-in-time; live OData metadata is authoritative.
- Run the skill from `sap-odata-explorer/`:
  ```bash
  npm run test-connection   # sanity check before queries
  npm run metadata          # entity schema
  npm run query             # data
  npm run list-services     # discoverable services
  ```
- The skill auto-masks passwords and tokens in its logs. **Never** echo `.env` contents or paste credentials into the chat / commits.
- If verification fails (auth blocked, system offline), surface the failure to the user with the exact stderr and offer the book-grounded answer as a fallback **with that caveat called out**.

### 5. Inheritance for sub-agents
- Any agent invocation (sub-agent dispatched via the Agent tool, planner agent, reviewer agent, etc.) must receive a brief that re-states rules 1-4 verbatim or by reference: "follow `CLAUDE.md` project rules in the repo root".
- When you author new prompts (system prompts, agent personas, slash commands), include a one-line pointer to this section so future agents bootstrap correctly.

### 6. Authoring conventions (carried over)
- Hebrew first, English toggle. ASCII `-` only - never `—` or `–`.
- Cite, then synthesize. Never the other way around.
- Refuse to invent SAP tcodes, table names or field paths. If unsure, run OData verification (rule 4) or say so.

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
npm run build        # next build (plain - no custom tsc / collect-pages step)
npm run start        # serve the production build
npm run lint         # eslint (eslint-config-next)
npm run kb:index     # standard index: up to 300 pages per PDF, 150K chars
npm run kb:full-index  # full-index: ALL pages per PDF, 600K chars - use after adding new books
```

**No test runner is wired.** `npm test` will fail. Do not invent a test command - ask the user before adding Vitest / Jest / Playwright.

### full-index command

`npm run kb:full-index` triggers `FULL_SCAN=1` in `scripts/index-kb.mjs`:
- Scans **every page** of every PDF (no page cap)
- Saves up to **600,000 chars** per book
- Writes `knowledge-base/.index/<slug>.txt` + `.pages.json` + `index.json`
- Rebuilds `lib/kb-index.json` and `lib/kb-search-index.json` (BM25)

**When to use full-index:**
- After dropping a new SAP Press PDF into `knowledge-base/`
- When `kb:index` produces fewer chapters than expected
- Before a production deploy where retrieval quality matters
- Warning: takes ~10-20 minutes for 10 large PDFs

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
- `lib/types.ts` - typed union for `AgentId` plus `Message` / `Conversation` shapes. Source of truth for every persisted store entry and every API payload.
- `lib/store.ts` - Zustand store, persisted to `sap-ai-hub-store` localStorage key.
- `lib/kb.ts` + `lib/kb-index.json` - book metadata consumed by UI and mock stream.
- `scripts/index-kb.mjs` - PDF indexer (pdfjs-dist legacy build).
- `AGENTS.md` - per-agent **senior-implementer** system prompts (universal contract A-E + 8 personas matching `lib/agents.ts`). Required reading for any agent dispatch.

## Env vars

`.env.local` (copy from `.env.example`):

- `SAP_AI_ENDPOINT` - external RAG URL. Shared by `/api/chat` (forwards `{ messages, agent, language }`) and `/api/explain` (forwards `{ book, chapter, paragraph, language }` to `${SAP_AI_ENDPOINT}/explain`). Both pipe the response stream back unchanged.
- `SAP_AI_API_KEY` - optional bearer token sent as `Authorization: Bearer ...` on both endpoints.

## Knowledge base

- Put SAP Press PDFs in `knowledge-base/`. Run `npm run kb:index` once after adding/removing books.
- Indexer extracts up to 300 pages per PDF (standard) or every page (`FULL_SCAN=1`), top terms, transaction codes and table names. Writes `knowledge-base/.index/<slug>.txt` (excerpts) + `knowledge-base/.index/<slug>.pages.json` + `knowledge-base/.index/index.json` + `lib/kb-index.json` + `lib/kb-search-index.json` (BM25).
- PDFs and the `.index/` folder are git-ignored.
- The landing **Library** section and the mock stream both pull from this index, so book metadata propagates without code changes.

## Working conventions

- **Hebrew is the default UI language**, English is a single-click toggle stored in Zustand. The root `<html lang dir>` flips through `components/site/language-effect.tsx`.
- **Punctuation rule: ASCII `-` only.** No em or en dashes anywhere in UI copy, library docs or agent prompts. Grep before merging: `rg "[—–]" app components lib AGENTS.md CLAUDE.md README.md` should return empty.
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

**Project-specific memory exclusions:**
- Never persist book passages, excerpts, or paragraph text into memory. The corpus (`lib/kb-search-index.json`) is the source of truth; copying passages into memory creates stale duplicates.
- Never persist OData metadata snapshots. Re-run `sap-odata-explorer/` when the question depends on current shape.
- Do not store agent system prompts in memory - they live in `AGENTS.md` and evolve there.

## Local scratch dirs (do not commit)

- `.sc4sap/` - SC4SAP plugin scratch (CBO inventory, profile state). Local-only, git-ignored. Never stage it.
- `knowledge-base/` and `knowledge-base/.index/` - PDFs + indexer output, git-ignored.

---

## SAP Skills - Mental Model (Marius Kruger)

> Source: https://www.linkedin.com/pulse/claude-code-sap-skills-mental-model-worth-testing-marius-kruger-izpmc/

Claude Code הוא **עוזר בזמן פיתוח (design-time)** - לא רכיב ריצה.
תפקידו: לייצר scaffolding, קונפיגורציה ו-bindings נכונים.
SAP BTP (Cloud Foundry, Kyma, AI Core) מריץ את ה-artifacts בפועל.

### כללים נוספים למניעת הזיות

אלו משלימים את כלל 2 ("No generic answers") לעיל:

1. **יישור גרסאות** - Skills קהילתיות עלולות לפגר. אמת מול SAP Help Portal - במיוחד: XSUAA scopes, security config, data residency.
2. **ציון סביבת ריצה מפורש** - Cloud Foundry / Kyma / ABAP Environment חייבים להיות מצוינים בכל פרומפט שמייצר קוד.
3. **חובת סקירה אנושית** - פלט שנראה סמכותי אינו בהכרח נכון. כל artifact דורש אימות מקצועי.

### אסטרטגיית טעינת Skills

- **אל תטען את כל הסקילים בבת אחת** - טעינת יתר מייצרת פלטים מפוזרים.
- **טען סקילים ממוקדים** לפי ההקשר הספציפי של המשימה.

### מגבלות מוכרות

1. Skills הן community-maintained - לא רשמיות של SAP.
2. קוד שנוצר עשוי לכלול דפוסים מיושנים.
3. הגבול בין "עזרה בפיתוח" ל"ביטחון שווא" נחצה בקלות.
4. Skills לא מחליפות הבנה של ארכיטקטורת SAP הבסיסית.

---

## סקילים זמינים בפרויקט

מקור: https://github.com/secondsky/sap-skills | הותקנו: 2026-05-12

### Fiori Elements ו-UI5

| סקיל | פקודת הפעלה | שימוש |
|---|---|---|
| `sap-fiori-tools` | `Skill(sap-fiori-tools:sap-fiori-tools)` | פיתוח ו-deployment של Fiori, VS Code extensions |
| `sapui5` | _(no standalone `sapui5` skill installed - use the CLI / linter / fiori-tools combo above)_ | UI5 framework + Fiori Elements templates |
| `sapui5-cli` | `Skill(sapui5-cli:sapui5-cli)` | UI5 Tooling - build, serve, deploy |
| `sapui5-linter` | `Skill(sapui5-linter:sapui5-linter)` | ניתוח סטטי וביקורת קוד SAPUI5 |

### SAP Cloud ALM (סקילים קרובים - אין ייעודי)

| סקיל | פקודת הפעלה | שימוש |
|---|---|---|
| `sap-btp-cloud-transport-management` | `Skill(sap-btp-cloud-transport-management:sap-btp-cloud-transport-management)` | Transport landscape ו-deployment pipelines |
| `sap-btp-cloud-logging` | `Skill(sap-btp-cloud-logging:sap-btp-cloud-logging)` | ניטור, logging, observability על BTP |
| `sap-btp-cias` | `Skill(sap-btp-cias:sap-btp-cias)` | Cloud Integration Automation workflows |
| `sap-btp-developer-guide` | `Skill(sap-btp-developer-guide:sap-btp-developer-guide)` | הנחיות פיתוח עסקי כלליות על BTP |

### אסטרטגיית טעינה לפי משימה

| משימה | סקילים |
|---|---|
| פיתוח Fiori Elements | `sap-fiori-tools` + `sapui5` |
| ביקורת קוד UI | `sapui5-linter` |
| ניהול transport / ALM | `sap-btp-cloud-transport-management` + `sap-btp-developer-guide` |
| ניטור | `sap-btp-cloud-logging` |
| אינטגרציה מונחית | `sap-btp-cias` |

---

## כללי עבודה לסוכנים

### סוכן Functional (ניתוח פונקציונלי)
- ציין תמיד את מודול ה-SAP (MM, SD, FI, CO...) ואת הגרסה.
- אמת הגדרות מול SAP Help Portal לפני הצגתן כעובדות.
- סמן בבירור מה מגיע מ-Skill לעומת מה מגיע מתיעוד רשמי.

### סוכן Tosca (בדיקות)
- ציין את גרסת Tosca ואת סביבת הריצה (SAP GUI / Fiori / Web).
- אל תניח שסקריפט בדיקה שנוצר אוטומטית תקין - נדרשת סקירה ידנית.
- בדוק תאימות בין גרסת Tosca לגרסת SAP הנבדקת.

### כל סוכן SAP
- **לפני כל פעולה**: ציין את הסביבה (DEV / QA / PROD) ואת הלקוח (Client).
- **לפני כל transport**: אמת שהאובייקטים עברו Unit Test.
- **לפני כל המלצה**: בדוק מול SAP Help Portal אם יש ספק.

### מדיניות תגובות
- כאשר ביטחון נמוך - כתוב מפורשות: "יש לאמת מול SAP Help Portal."
- כאשר הפלט תלוי בגרסה - ציין את הגרסה המדויקת.
- אל תציג artifact כמוכן לייצור ללא סקירה מפורשת.
- עדיף פחות ומדויק יותר, על פני הרבה ולא מאומת.

---

## Thinking Process - חובה לכל סוכן לפני כל תגובה

> מבוסס על עקרונות "How I Teach Claude Code to Work My Way" (SAP Community).
> כל סוכן בפרויקט זה חייב לבצע את 5 השלבים הבאים **לפני** שהוא מנסח תשובה.
> שלבים אלו אינם מוצגים למשתמש - הם מתבצעים פנימית.

### שלב 1 - סיווג השאלה

```
1a. מודול SAP: PP / PM / QM / WM / MM / Fiori / ABAP / General?
1b. גרסה: S/4HANA / ECC / BTP / Cloud?
    - אם ECC: הפעל isEccQuery() - אל תציג תשובות S/4HANA
1c. סוג השאלה: תהליכי / טכני / קונפיגורציה / בדיקות?
1d. האם קיים מידע בקורפוס? -> הפעל retrieve() ב-lib/rag.ts
```

### שלב 2 - בדיקת הקורפוס

```
2a. הרץ retrieve(query, { topK: 5 }) מ-lib/rag.ts
2b. אם score > 0.3: יש מידע רלוונטי - השתמש בו + ציטוט
2c. אם score < 0.3: אין מידע מספיק - הצהר על כך בפירוש
2d. לעולם אל תמציא book title, page number, או tcode
```

### שלב 3 - זיהוי פערים

```
3a. מה ידוע בוודאות מהקורפוס?
3b. מה מגיע מידע מודל (לא מקורפוס)?
3c. מה דורש אימות חי מ-sap-odata-explorer/?
3d. האם קיימת סתירה בין מקורות? -> ציין אותה
```

### שלב 4 - ניסוח עם גילוי נאות

```
4a. פתח עם: "מתוך [שם ספר], עמ' [X]:" לכל טענה מהקורפוס
4b. סמן ידע מודל: "_מידע זה מבוסס על ידע מודל - אמת מול SAP Help Portal_"
4c. ציין תמיד את סביבת הריצה הרלוונטית (S/4HANA on-prem / Cloud / BTP)
4d. לא יותר מ-3 נקודות ללא ציטוט אחד
```

### שלב 5 - בדיקת עצמית לפני שליחה

```
5a. האם המלצתי tcode שקיים בפועל? (בדוק מול tcodes ב-kb-index.json)
5b. האם ציינתי גרסה לכל תשובה טכנית?
5c. האם השתמשתי ב-"--" במקום "-"? (אסור - רק ASCII "-")
5d. האם הפרדתי בין מה שמגיע מהספר לבין מה שמגיע מידע מודל?
5e. אם הסוכן הוא Tosca - האם השתמשתי ב-TBox/XL5 syntax?
```

### System Instructions לכל סוכן

כאשר סוכן מקבל משימה, עליו לפתוח עם ה-block הזה (פנימית, לא בפלט):

```
THINK:
- Query type: [functional | technical | config | test]
- SAP version: [S4 | ECC | BTP | unknown]
- Module: [PP | PM | QM | WM | MM | Fiori | ABAP | cross-module]
- Corpus hit: [yes/score | no]
- Confidence: [high | medium | low]
- Verification needed: [odata | sap-help-portal | none]
THEN ANSWER:
```

אם `Confidence = low` - חובה לציין זאת בפתח התשובה.
אם `Verification needed = odata` - הרץ `sap-odata-explorer/` לפני התשובה.
אם `SAP version = ECC` - אל תציג תשובות S/4HANA.
