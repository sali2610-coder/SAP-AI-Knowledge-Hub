"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHubStore } from "@/lib/store";
import type { BookGuide } from "@/lib/rag-public";

const COPY = {
  he: {
    title: "מדריכי הספרייה",
    sub: "כל ספר הופך למדריך אינטראקטיבי - לחץ על נושא חם או על מקטע מומלץ כדי להיכנס ישירות לעמוד הרלוונטי בקורא הספר.",
    chunks: "מקטעים",
    pages: "עמודים",
    topics: "נושאים מובילים",
    highlights: "קטעים מומלצים",
    page: "עמוד",
    open: "פתח ספר",
    explain: "פתח קטע + הסבר",
    empty: "אינדקס מצטמצם - הרץ npm run kb:full-index לעדכון.",
  },
  en: {
    title: "Library guides",
    sub: "Every book becomes an interactive guide - tap a hot topic or recommended passage to jump straight into the reader at that page.",
    chunks: "chunks",
    pages: "pages",
    topics: "Top topics",
    highlights: "Recommended passages",
    page: "page",
    open: "Open book",
    explain: "Open + explain",
    empty: "Slim index - run npm run kb:full-index to refresh.",
  },
} as const;

const MODULE_ACCENT: Record<string, string> = {
  PP: "bg-amber-500/12 text-amber-600 dark:text-amber-300 ring-amber-400/30",
  PM: "bg-rose-500/12 text-rose-600 dark:text-rose-300 ring-rose-400/30",
  QM: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300 ring-cyan-400/30",
  WM: "bg-sky-500/12 text-sky-600 dark:text-sky-300 ring-sky-400/30",
  MM: "bg-orange-500/12 text-orange-600 dark:text-orange-300 ring-orange-400/30",
  IBP: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 ring-emerald-400/30",
  Fiori: "bg-primary/12 text-primary ring-primary/30",
  Foundation: "bg-primary/12 text-primary ring-primary/30",
  General: "bg-foreground/8 text-foreground/80 ring-foreground/15",
};

export function LibraryGrid({ books }: { books: BookGuide[] }) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Horizon · Live KB
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h1>
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
              className="glass-panel elev-1 hover:elev-2 flex h-full flex-col gap-4 rounded-2xl p-5 transition"
            >
              <header className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${accent}`}
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold leading-snug">
                    {book.title}
                  </p>
                  <p className="tnum mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full bg-foreground/5 px-2 py-0.5">
                      {book.module}
                    </span>
                    <span>
                      {book.pageCount} {t.pages}
                    </span>
                    <span>
                      {book.chunks} {t.chunks}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/library/${book.slug}`}
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                  aria-label={t.open}
                  title={t.open}
                >
                  <Arrow className="h-4 w-4" />
                </Link>
              </header>

              {book.topics.length > 0 && (
                <section>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.topics}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
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
                          href={`/library/${book.slug}?p=${encodeURIComponent(h.paragraphId)}`}
                          className="group block rounded-xl border border-foreground/10 bg-card/60 p-3 transition hover:border-primary/40 hover:bg-card"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="tnum rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {t.page} {h.page}
                            </span>
                            <span className="text-[11px] text-primary opacity-0 transition group-hover:opacity-100">
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

              {book.tcodes.length > 0 && (
                <footer className="flex flex-wrap gap-1 border-t border-foreground/8 pt-3">
                  {book.tcodes.map((tc) => (
                    <span
                      key={tc}
                      className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
                    >
                      {tc}
                    </span>
                  ))}
                </footer>
              )}
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
