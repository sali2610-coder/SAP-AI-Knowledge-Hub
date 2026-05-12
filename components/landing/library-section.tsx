"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { kbIndex } from "@/lib/kb";
import { useHubStore } from "@/lib/store";

const COPY = {
  he: {
    title: "הספרייה - SAP Press בתוך הצ׳אט.",
    sub: "כל תשובה משויכת לספר ולפרק. כך הסוכן לא ממציא, ואתה יכול לחזור למקור.",
    pages: "עמודים",
    module: "מודול",
  },
  en: {
    title: "The library - SAP Press inside the chat.",
    sub: "Every answer is grounded in a book and a chapter. The agent never invents, you can always go back to the source.",
    pages: "pages",
    module: "module",
  },
} as const;

export function LibrarySection() {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];

  return (
    <section id="library" className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kbIndex.books.map((book, i) => (
          <motion.div
            key={book.slug}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.04 }}
          >
          <Link
            href={`/library/${book.slug}`}
            className="glass-panel elev-1 block rounded-2xl p-4 transition hover:elev-2 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {book.title}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>{book.module}</span>
                  <span aria-hidden>-</span>
                  <span>
                    {book.pageCount} {t.pages}
                  </span>
                </p>
                {book.tcodes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {book.tcodes.slice(0, 4).map((tc) => (
                      <span
                        key={tc}
                        className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
                      >
                        {tc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
