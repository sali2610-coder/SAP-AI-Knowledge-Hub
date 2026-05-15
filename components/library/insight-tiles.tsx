"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Tag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useHubStore } from "@/lib/store";
import type { BookDocument } from "@/lib/book-loader";

const COPY = {
  he: {
    pages: "עמודים",
    chunks: "מקטעים",
    chapters: "פרקים",
    tcodes: "T-Codes",
    topics: "מושגי מפתח",
    moduleLabel: "מודול",
  },
  en: {
    pages: "Pages",
    chunks: "Chunks",
    chapters: "Chapters",
    tcodes: "T-Codes",
    topics: "Key terms",
    moduleLabel: "Module",
  },
} as const;

interface Tile {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: string;
}

interface Props {
  doc: BookDocument;
  totalParagraphs: number;
}

export function InsightTiles({ doc, totalParagraphs }: Props) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];

  const tiles: Tile[] = [
    {
      label: t.pages,
      value: doc.book.pageCount,
      icon: BookOpen,
      accent: "from-[#0070f2] to-[#5baef7]",
    },
    {
      label: t.chunks,
      value: totalParagraphs,
      icon: Sparkles,
      accent: "from-[#fa8b46] to-[#fbbf24]",
    },
    {
      label: t.chapters,
      value: doc.chapters.length,
      icon: Layers,
      accent: "from-[#107e3e] to-[#36a41d]",
    },
    {
      label: t.moduleLabel,
      value: doc.book.module,
      icon: Tag,
      accent: "from-[#7c3aed] to-[#a855f7]",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5"
          >
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tile.accent}`}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {tile.label}
              </span>
              <tile.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="tnum mt-1 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
              {tile.value}
            </p>
          </motion.div>
        ))}
      </div>

      {doc.book.tcodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t.tcodes}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {doc.book.tcodes.slice(0, 12).map((tc) => (
              <span
                key={tc}
                className="inline-flex items-center rounded-full border border-[#fa8b46]/40 bg-[#fff4e8] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#b8581b] shadow-[0_2px_8px_-4px_rgba(250,139,70,0.5)]"
              >
                {tc}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {doc.book.terms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t.topics}
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {doc.book.terms.slice(0, 14).map((term) => (
              <span
                key={term}
                className="inline-flex items-center rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] text-[#3949ab]"
              >
                {term}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
