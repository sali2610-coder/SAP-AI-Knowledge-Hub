"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHubStore } from "@/lib/store";

const COPY = {
  he: {
    title: "סימניות",
    sub: "כל הפסקאות שסימנת ב-Library. נשמרות מקומית בדפדפן.",
    empty: "עדיין אין סימניות. פתח ספר ולחץ על אייקון הסימנייה ליד פסקה.",
    open: "פתח פסקה",
    remove: "הסר",
    badge: "Horizon · מקומי",
  },
  en: {
    title: "Bookmarks",
    sub: "Every paragraph you bookmarked in the Library. Stored locally in your browser.",
    empty: "No bookmarks yet. Open a book and tap the bookmark icon next to a paragraph.",
    open: "Open paragraph",
    remove: "Remove",
    badge: "Horizon · Local",
  },
} as const;

export function BookmarksList() {
  const language = useHubStore((s) => s.language);
  const bookmarks = useHubStore((s) => s.bookmarks);
  const remove = useHubStore((s) => s.removeBookmark);
  const t = COPY[language];

  const entries = Object.values(bookmarks).sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-2xl space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-primary ring-1 ring-primary/25">
          <Sparkles className="h-3.5 w-3.5" />
          {t.badge}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </header>

      {entries.length === 0 && (
        <div className="glass-panel elev-1 rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {t.empty}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {entries.map((b) => (
          <li
            key={b.paragraphId}
            className="glass-panel elev-1 hover:elev-2 flex flex-col gap-2 rounded-2xl p-5 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-primary">
                  <Bookmark className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-wider">
                    {b.chapterTitle}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 font-medium">{b.bookTitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/library/${b.bookSlug}?p=${encodeURIComponent(b.paragraphId)}`}
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
                  aria-label={t.open}
                  title={t.open}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={t.remove}
                  title={t.remove}
                  onClick={() => remove(b.paragraphId)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              {b.excerpt}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
