"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Layers, ArrowUpRight } from "lucide-react";
import { useHubStore } from "@/lib/store";
import type { CorpusStats } from "@/lib/rag-public";

const COPY = {
  he: {
    title: "ה-Knowledge Base בלייב",
    books: "ספרי הליבה",
    chunks: "יחידות מידע מאונדקסות",
    modules: "מודולים מכוסים",
    pages: "עמודים נסרקו",
    note: "כל תשובה במערכת חייבת להישען על אחת מהיחידות האלו - אחרת היא תסומן כידע מודל כללי.",
  },
  en: {
    title: "Live knowledge base",
    books: "Core titles",
    chunks: "Indexed text units",
    modules: "Modules covered",
    pages: "Pages scanned",
    note: "Every answer must be grounded in one of these units - otherwise it is flagged as world-knowledge.",
  },
} as const;

export function KpiStrip({ stats }: { stats: CorpusStats }) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];

  const cards = [
    { label: t.books, value: stats.books, icon: BookOpen, accent: "text-primary" },
    { label: t.chunks, value: stats.chunks.toLocaleString(), icon: FileText, accent: "text-[color:var(--accent)]" },
    { label: t.modules, value: stats.modules, icon: Layers, accent: "text-emerald-500 dark:text-emerald-300" },
    { label: t.pages, value: stats.totalPages.toLocaleString(), icon: ArrowUpRight, accent: "text-sky-500 dark:text-sky-300" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel elev-2 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-foreground/[0.06] md:grid-cols-4"
      >
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="bg-card p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </span>
                <Icon className={`h-4 w-4 ${c.accent}`} />
              </div>
              <p className="tnum mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {c.value}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{t.note}</p>
    </section>
  );
}

export function KpiTitle() {
  const language = useHubStore((s) => s.language);
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
      {COPY[language].title}
    </p>
  );
}
