"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { useHubStore } from "@/lib/store";
import type { BookEntry } from "@/lib/types";

const COPY = {
  he: {
    title: "הספרייה",
    sub: "ספרי הליבה של SAP Press שאינדקסנו. בחר ספר כדי לעבור למצב קריאה אינטראקטיבית עם הסברים בעברית בלחיצה.",
    pages: "עמודים",
    chapters: "פרקים",
    open: "פתח ספר",
  },
  en: {
    title: "Library",
    sub: "The SAP Press core titles we indexed. Pick a book to enter interactive reading - click any line for a Hebrew or English explanation.",
    pages: "pages",
    chapters: "chapters",
    open: "Open book",
  },
} as const;

export function LibraryGrid({ books }: { books: BookEntry[] }) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <motion.div
            key={book.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            <Link
              href={`/library/${book.slug}`}
              className="group glass-panel elev-1 flex h-full flex-col gap-4 rounded-2xl p-5 transition hover:elev-2 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold leading-snug">
                    {book.title}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full bg-foreground/5 px-2 py-0.5">
                      {book.module}
                    </span>
                    <span>
                      {book.pageCount} {t.pages}
                    </span>
                    <span>
                      {book.chapters.length} {t.chapters}
                    </span>
                  </p>
                </div>
              </div>

              {book.tcodes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.tcodes.slice(0, 6).map((tc) => (
                    <span
                      key={tc}
                      className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
                    >
                      {tc}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                {t.open}
                <Arrow className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
