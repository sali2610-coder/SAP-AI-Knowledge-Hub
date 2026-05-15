"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  TableProperties,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHubStore } from "@/lib/store";
import { AGENT_MAP } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/lib/types";
import type { BookGuide } from "@/lib/rag-public";

const COPY = {
  he: {
    title: "מדריכי הספרייה",
    sub: "כל ספר הוא מדריך אינטראקטיבי. לחץ על נושא חם, פסקה מומלצת או על הכפתור כדי להיכנס ישירות לעמוד הרלוונטי בקורא.",
    chunks: "מקטעים",
    pages: "עמודים",
    page: "עמוד",
    open: "פתח קורא",
    explain: "פתח + הסבר",
    topics: "נושאים מובילים",
    highlights: "פסקאות מומלצות",
    agents: "סוכנים אחראיים",
    tcodes: "טרנזקציות מפתח",
    tables: "טבלאות מפתח",
    badge: "Horizon · Live KB",
  },
  en: {
    title: "Library guides",
    sub: "Every book is an interactive guide. Tap a hot topic, recommended passage or the open button to jump straight into the reader.",
    chunks: "chunks",
    pages: "pages",
    page: "page",
    open: "Open reader",
    explain: "Open + explain",
    topics: "Top topics",
    highlights: "Recommended passages",
    agents: "Owned by",
    tcodes: "Key tcodes",
    tables: "Key tables",
    badge: "Horizon · Live KB",
  },
} as const;

const MODULE_ACCENT: Record<string, string> = {
  PP: "bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-amber-400/30",
  PM: "bg-rose-500/12 text-rose-700 dark:text-rose-300 ring-rose-400/30",
  QM: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 ring-cyan-400/30",
  WM: "bg-sky-500/12 text-sky-700 dark:text-sky-300 ring-sky-400/30",
  MM: "bg-orange-500/12 text-orange-700 dark:text-orange-300 ring-orange-400/30",
  IBP: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-emerald-400/30",
  Fiori: "bg-primary/12 text-primary ring-primary/30",
  Foundation: "bg-primary/12 text-primary ring-primary/30",
  General: "bg-foreground/8 text-foreground/80 ring-foreground/15",
};

const AGENT_CHIP: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-200 ring-amber-400/30",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-200 ring-sky-400/30",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-200 ring-violet-400/30",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-emerald-400/30",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-200 ring-rose-400/30",
  cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200 ring-cyan-400/30",
  indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 ring-indigo-400/30",
  orange: "bg-orange-500/15 text-orange-700 dark:text-orange-200 ring-orange-400/30",
};

export function LibraryGrid({ books }: { books: BookGuide[] }) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-primary ring-1 ring-primary/25">
          <Sparkles className="h-3.5 w-3.5" />
          {t.badge}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {books.map((book, i) => {
          const accent = MODULE_ACCENT[book.module] ?? MODULE_ACCENT.General;
          return (
            <motion.article
              key={book.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="glass-panel elev-1 hover:elev-2 group/card flex h-full flex-col gap-4 rounded-2xl p-5 transition"
            >
              <header className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                    accent,
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold leading-snug">
                    {book.title}
                  </p>
                  <p className="tnum mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono">
                      {book.module}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {book.pageCount} {t.pages}
                    </span>
                    <span>{book.chunks} {t.chunks}</span>
                  </p>
                </div>
                <Link
                  href={`/library/${book.slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary ring-1 ring-primary/25 transition hover:bg-primary/15"
                  aria-label={t.open}
                  title={t.open}
                >
                  {t.open}
                  <Arrow className="h-3.5 w-3.5" />
                </Link>
              </header>

              {book.agents.length > 0 && (
                <section>
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.agents}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {book.agents.map((aid) => {
                      const ag = AGENT_MAP[aid as AgentId];
                      if (!ag) return null;
                      const chip =
                        AGENT_CHIP[ag.accent] ??
                        "bg-foreground/8 text-foreground/80 ring-foreground/15";
                      return (
                        <span
                          key={aid}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ring-1",
                            chip,
                          )}
                          title={ag[language].name}
                        >
                          <span className="font-semibold uppercase tracking-wider">
                            {aid}
                          </span>
                          <span className="opacity-75">- {ag[language].name}</span>
                        </span>
                      );
                    })}
                  </div>
                </section>
              )}

              {book.topics.length > 0 && (
                <section>
                  <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {t.topics}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {book.topics.map((tag) => (
                      <Link
                        key={tag}
                        href={`/library/${book.slug}#${encodeURIComponent(tag)}`}
                        className="rounded-md border border-foreground/10 bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground/85 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {book.highlights.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.highlights}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {book.highlights.map((h) => (
                      <li key={h.paragraphId}>
                        <Link
                          href={`/library/${book.slug}?p=${encodeURIComponent(h.paragraphId)}&page=${h.page}`}
                          className="group/row block rounded-xl border border-foreground/10 bg-card/60 p-3 transition hover:border-primary/40 hover:bg-card"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="tnum rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                {t.page} {h.page}
                              </span>
                              {h.chapter && (
                                <span className="line-clamp-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                  {h.chapter}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-primary opacity-0 transition group-hover/row:opacity-100">
                              {t.explain}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-foreground/90">
                            {h.snippet}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <Skeleton className="h-12 w-full rounded-xl" />
              )}

              {(book.tcodes.length > 0 || book.tables.length > 0) && (
                <footer className="space-y-1.5 border-t border-foreground/8 pt-3">
                  {book.tcodes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="me-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.tcodes}
                      </span>
                      {book.tcodes.map((tc) => (
                        <span
                          key={tc}
                          className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
                        >
                          {tc}
                        </span>
                      ))}
                    </div>
                  )}
                  {book.tables.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="me-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <TableProperties className="h-3 w-3" />
                        {t.tables}
                      </span>
                      {book.tables.map((tb) => (
                        <span
                          key={tb}
                          className="rounded-md border border-primary/15 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] text-primary/90"
                        >
                          {tb}
                        </span>
                      ))}
                    </div>
                  )}
                </footer>
              )}
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
