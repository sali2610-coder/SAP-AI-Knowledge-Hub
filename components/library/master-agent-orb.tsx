"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Per-module orb palette. Mirrors the module color identity used on the
// agent selector cards so users feel one consistent agent presence.
const ORB: Record<
  string,
  { from: string; to: string; glow: string; label: string }
> = {
  PP:         { from: "#0070f2", to: "#5baef7", glow: "rgba(0,112,242,0.55)",  label: "PP" },
  "PP-DS":    { from: "#0070f2", to: "#5baef7", glow: "rgba(0,112,242,0.55)",  label: "PP-DS" },
  PM:         { from: "#107e3e", to: "#36a41d", glow: "rgba(16,126,62,0.55)",  label: "PM" },
  QM:         { from: "#0891b2", to: "#22d3ee", glow: "rgba(34,211,238,0.55)", label: "QM" },
  WM:         { from: "#6366f1", to: "#8b5cf6", glow: "rgba(99,102,241,0.55)", label: "WM" },
  MM:         { from: "#fa8b46", to: "#fbbf24", glow: "rgba(250,139,70,0.55)", label: "MM" },
  IBP:        { from: "#0f766e", to: "#10b981", glow: "rgba(16,185,129,0.55)", label: "IBP" },
  Fiori:      { from: "#7c3aed", to: "#a855f7", glow: "rgba(124,58,237,0.55)", label: "UX" },
  Foundation: { from: "#1e3a8a", to: "#3b82f6", glow: "rgba(59,130,246,0.55)", label: "S4" },
  General:    { from: "#0f172a", to: "#475569", glow: "rgba(71,85,105,0.45)",  label: "AI" },
};

const COPY = {
  he: {
    title: "Master Agent",
    sub: "מומחה SAP פעיל לפי המודול שאתה קורא.",
    cta: "פתח שיחה",
    morph: "מתאים את עצמו לפי הספר הפעיל",
  },
  en: {
    title: "Master Agent",
    sub: "SAP specialist live-tuned to the book you are reading.",
    cta: "Open chat",
    morph: "Morphs per active book",
  },
} as const;

interface Props {
  module: string;
  onChat?: () => void;
}

export function MasterAgentOrb({ module, onChat }: Props) {
  const palette = ORB[module] ?? ORB.General;
  const language = useHubStore((s) => s.language);
  const [open, setOpen] = useState(false);
  const t = COPY[language];

  return (
    <div
      className={cn(
        "fixed bottom-5 z-40 flex flex-col items-end gap-2",
        language === "he" ? "end-5" : "end-5",
      )}
      style={{ pointerEvents: "auto" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel elev-3 max-w-xs rounded-3xl p-4"
            style={{ boxShadow: `0 24px 70px -22px ${palette.glow}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                }}
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">{t.morph}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-foreground/85">{t.sub}</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onChat?.();
              }}
              className="mt-3 w-full rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              }}
            >
              {t.cta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={t.title}
        onClick={() => setOpen((v) => !v)}
        layout
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          boxShadow: `0 18px 50px -16px ${palette.glow}, 0 0 0 1px rgba(255,255,255,0.25) inset`,
        }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.55, 0.2, 0.55] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: `0 0 38px 6px ${palette.glow}` }}
        />
        <Sparkles className="relative h-5 w-5 drop-shadow" />
        <span className="absolute -bottom-2 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[color:var(--foreground)] shadow">
          {palette.label}
        </span>
      </motion.button>
    </div>
  );
}
