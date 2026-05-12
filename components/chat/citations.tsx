"use client";

import { BookText } from "lucide-react";
import type { Citation, Language } from "@/lib/types";

export function Citations({
  citations,
  language,
}: {
  citations?: Citation[];
  language: Language;
}) {
  if (!citations || citations.length === 0) return null;
  const label = language === "he" ? "מקורות" : "Sources";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground/80">
        {label}
      </span>
      {citations.map((c, i) => (
        <span
          key={`${c.bookSlug}-${i}`}
          className="inline-flex max-w-[260px] items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/85"
          title={c.bookTitle}
        >
          <BookText className="h-3 w-3 shrink-0 text-primary" />
          <span className="truncate">{c.bookTitle}</span>
          {c.chapter && <span className="text-muted-foreground">- {c.chapter}</span>}
        </span>
      ))}
    </div>
  );
}
