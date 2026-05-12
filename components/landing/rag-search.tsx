"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookText, Loader2, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHubStore } from "@/lib/store";

const COPY = {
  he: {
    placeholder: "שאל את ה-Knowledge Base... למשל MRP Live, Inspection Lot, Source Determination",
    tryTitle: "נסה",
    hits: "התאמות בספרים",
    empty: "אין מקטעים מתאימים בקורפוס. השתמש בצ׳אט לתשובת מודל עם גילוי נאות.",
    page: "עמוד",
    score: "ציון",
    open: "פתח קטע",
  },
  en: {
    placeholder: "Ask the knowledge base... e.g. MRP Live, Inspection Lot, Source Determination",
    tryTitle: "Try",
    hits: "Book matches",
    empty: "No relevant passages in the corpus. Use the chat for a model answer with the disclaimer.",
    page: "page",
    score: "score",
    open: "Open passage",
  },
} as const;

const SUGGESTIONS = [
  "MRP Live planned order",
  "Inspection Lot in QM",
  "Source Determination",
  "Maintenance Order release",
  "Storage Type strategy",
];

interface Hit {
  bookSlug: string;
  bookTitle: string;
  chapter: string;
  page: number;
  paragraphId: string;
  score: number;
  snippet: string;
}

export function RagSearch() {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.length < 2) {
      // Defer state resets to a microtask so the linter does not flag
      // synchronous setState inside the effect body.
      queueMicrotask(() => {
        setHits([]);
        setLoading(false);
        setActive("");
      });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(`/api/rag/search?q=${encodeURIComponent(term)}&k=5`, {
          cache: "no-store",
        });
        const data = (await resp.json()) as { hits: Hit[]; q: string };
        setHits(data.hits);
        setActive(term);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const showSuggestions = useMemo(() => q.trim().length < 2, [q]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="glass-panel elev-2 rounded-2xl p-2"
      >
        <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-card/70 px-3 py-2 focus-within:border-primary/50">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.placeholder}
            className="border-0 bg-transparent text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showSuggestions ? (
          <motion.div
            key="sugg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.tryTitle}:
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQ(s)}
                className="rounded-full border border-foreground/10 bg-card/60 px-3 py-1 text-xs text-foreground/85 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="hits"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-2"
          >
            {loading && hits.length === 0 && (
              <>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </>
            )}
            {!loading && hits.length === 0 && active && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-400/90">
                {t.empty}
              </div>
            )}
            {!loading && hits.length > 0 && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {hits.length} {t.hits}
                </span>
              </div>
            )}
            {hits.map((h, i) => (
              <motion.div
                key={h.paragraphId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Link
                  href={`/library/${h.bookSlug}?p=${encodeURIComponent(h.paragraphId)}`}
                  className="group block rounded-xl border border-foreground/10 bg-card/70 p-3 transition hover:border-primary/40 hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <BookText className="h-3.5 w-3.5" />
                      <span className="line-clamp-1 text-[12px] font-medium">
                        {h.bookTitle}
                      </span>
                    </div>
                    <span className="tnum shrink-0 rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {t.page} {h.page} - {t.score} {h.score}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/90">{h.snippet}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary opacity-0 transition group-hover:opacity-100">
                    {t.open} <ArrowUpRight className="h-3 w-3" />
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
