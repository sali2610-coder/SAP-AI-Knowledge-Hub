"use client";

import { Heart } from "lucide-react";
import { useHubStore } from "@/lib/store";

const COPY = {
  he: {
    line1: "נבנה עבור סלי חליף.",
    line2: "כל המידע נשאר בדפדפן שלך - אין שמירה בצד שרת.",
  },
  en: {
    line1: "Built for Sali Halif.",
    line2: "All chat history stays in your browser - nothing is stored server-side.",
  },
} as const;

export function SiteFooter() {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/5 bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-300" />
          <span>{t.line1}</span>
          <span aria-hidden>-</span>
          <span>{year}</span>
        </div>
        <p className="text-xs">{t.line2}</p>
      </div>
    </footer>
  );
}
