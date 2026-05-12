"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crosshair,
  Boxes,
  FunctionSquare,
  Database,
  Settings2,
  ShieldAlert,
  Terminal,
  Sparkles,
  TestTube2,
  type LucideIcon,
} from "lucide-react";
import { CodeBlock } from "@/components/chat/code-block";
import { useHubStore } from "@/lib/store";
import { TOSCA_KB, TOSCA_CATEGORIES, type ToscaCategory } from "@/lib/tosca-kb";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Crosshair,
  Boxes,
  FunctionSquare,
  Database,
  Settings2,
  ShieldAlert,
  Terminal,
};

const ACCENT_BG: Record<string, string> = {
  violet: "from-violet-500/15 to-violet-400/5",
  indigo: "from-indigo-500/15 to-indigo-400/5",
  amber: "from-amber-500/20 to-amber-400/5",
  emerald: "from-emerald-500/15 to-emerald-400/5",
  sky: "from-sky-500/15 to-sky-400/5",
  rose: "from-rose-500/20 to-rose-400/5",
  orange: "from-orange-500/20 to-orange-400/5",
};

const ACCENT_TEXT: Record<string, string> = {
  violet: "text-violet-500 dark:text-violet-300",
  indigo: "text-indigo-500 dark:text-indigo-300",
  amber: "text-amber-600 dark:text-amber-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  sky: "text-sky-500 dark:text-sky-300",
  rose: "text-rose-500 dark:text-rose-300",
  orange: "text-orange-500 dark:text-orange-300",
};

const ACCENT_RING: Record<string, string> = {
  violet: "ring-violet-400/40",
  indigo: "ring-indigo-400/40",
  amber: "ring-amber-400/40",
  emerald: "ring-emerald-400/40",
  sky: "ring-sky-400/40",
  rose: "ring-rose-400/40",
  orange: "ring-orange-400/40",
};

const COPY = {
  he: {
    title: "Tosca FX Builder",
    sub: "מפת אוטומציה לקסטמות, נוסחאות וטיפול בשגיאות SAP. כל כרטיס פותח דוגמה מלאה מתוך ה-KB הפנימי של Tosca.",
    filter: "סנן לפי קטגוריה",
    all: "הכל",
    source: "מקור",
    example: "דוגמה",
    body: "הסבר",
    badge: "Internal Tosca KB",
  },
  en: {
    title: "Tosca FX Builder",
    sub: "Automation map for customization, formulas and SAP error handling. Each tile opens a full example from the internal Tosca KB.",
    filter: "Filter by category",
    all: "All",
    source: "Source",
    example: "Example",
    body: "Explanation",
    badge: "Internal Tosca KB",
  },
} as const;

export function ToscaFxBuilder() {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const [filter, setFilter] = useState<ToscaCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(TOSCA_KB[0]?.id ?? null);

  const filtered = useMemo(
    () => (filter === "all" ? TOSCA_KB : TOSCA_KB.filter((e) => e.category === filter)),
    [filter],
  );

  const open = TOSCA_KB.find((e) => e.id === openId) ?? filtered[0];
  const openCopy = open ? (language === "he" ? open.he : open.en) : null;
  const openAccent = open?.accent ?? "violet";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-violet-500 dark:text-violet-300">
            <TestTube2 className="h-3.5 w-3.5" />
            {t.badge}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.sub}</p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {t.filter}
        </span>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition",
            filter === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-foreground/10 text-muted-foreground hover:border-foreground/30",
          )}
        >
          {t.all}
        </button>
        {TOSCA_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              filter === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-foreground/10 text-muted-foreground hover:border-foreground/30",
            )}
          >
            {language === "he" ? c.he : c.en}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1.45fr]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((entry, i) => {
            const copy = language === "he" ? entry.he : entry.en;
            const Icon = ICON_MAP[entry.icon] ?? Sparkles;
            const active = open?.id === entry.id;
            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                type="button"
                onClick={() => setOpenId(entry.id)}
                className={cn(
                  "group glass-panel elev-1 hover:elev-2 relative flex flex-col gap-2 rounded-2xl p-4 text-start transition focus:outline-none",
                  "bg-gradient-to-br",
                  ACCENT_BG[entry.accent],
                  active && `ring-2 ${ACCENT_RING[entry.accent]}`,
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/5",
                      ACCENT_TEXT[entry.accent],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {entry.category}
                  </span>
                </div>
                <h3 className="text-base font-semibold leading-tight">{copy.title}</h3>
                <p className="text-xs text-muted-foreground">{copy.tagline}</p>
              </motion.button>
            );
          })}
        </div>

        {open && openCopy && (
          <motion.aside
            key={open.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel elev-2 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wider",
                  `${ACCENT_TEXT[openAccent]} border-current`,
                )}
              >
                {open.category}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t.source}: {open.source}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {openCopy.title}
            </h2>
            <p className="mt-1 text-muted-foreground">{openCopy.tagline}</p>

            <section className="mt-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.body}
              </p>
              <p className="mt-1 text-sm leading-7 text-foreground/90">{openCopy.body}</p>
            </section>

            <section className="mt-5">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {t.example}
              </p>
              <CodeBlock language="tosca" value={openCopy.example} />
            </section>
          </motion.aside>
        )}
      </div>
    </div>
  );
}
