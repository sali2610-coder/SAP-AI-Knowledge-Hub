"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { BackgroundBeams } from "./background-beams";
import { RagSearch } from "./rag-search";
import { buttonVariants } from "@/components/ui/button";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const COPY = {
  he: {
    eyebrow: "Horizon · BM25 RAG חי",
    h1: "ה-Copilot של מיישמי SAP.",
    h1Accent: "9 ספרי SAP Press, 3,024 מקטעים לחיפוש מיידי.",
    sub: "חיפוש סמנטי אמיתי על פני קורפוס מאונדקס. כל תשובה מציינת ספר, עמוד ופסקה. ECC מזוהה ומופרד מ-S/4HANA אוטומטית.",
    cta: "פתח צ׳אט",
    secondary: "פתח ספרייה",
    chip: "Belize Horizon · Glass · Framer",
  },
  en: {
    eyebrow: "Horizon · live BM25 RAG",
    h1: "The Copilot for SAP implementers.",
    h1Accent: "Nine SAP Press titles, 3,024 searchable passages.",
    sub: "Real semantic search over an indexed corpus. Every answer cites book, page and paragraph. ECC is auto-detected and kept separate from S/4HANA.",
    cta: "Open chat",
    secondary: "Browse library",
    chip: "Belize Horizon · Glass · Framer",
  },
} as const;

export function Hero() {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <section className="aurora-bg relative isolate overflow-hidden">
      <BackgroundBeams />

      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-foreground/80"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t.eyebrow}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-balance mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl"
        >
          {t.h1}{" "}
          <span className="bg-gradient-to-br from-[color:var(--primary)] via-[oklch(0.75_0.20_251)] to-[color:var(--accent)] bg-clip-text text-transparent">
            {t.h1Accent}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-balance mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          {t.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/chat"
            className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 rounded-full px-7 text-sm")}
          >
            {t.cta}
            <Arrow className="h-4 w-4" />
          </Link>
          <Link
            href="/library"
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "h-11 rounded-full px-7 text-sm",
            )}
          >
            {t.secondary}
          </Link>
        </motion.div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 text-[11px] uppercase tracking-[0.35em] text-muted-foreground/70"
        >
          {t.chip}
        </motion.span>

        <div className="mt-10 w-full">
          <RagSearch />
        </div>
      </div>
    </section>
  );
}
