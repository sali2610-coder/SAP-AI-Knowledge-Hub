"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, MessageSquare, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExplainPanel } from "./explain-panel";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { BookDocument } from "@/lib/book-loader";
import type { AgentId } from "@/lib/types";

const COPY = {
  he: {
    chapters: "פרקים",
    pageCount: "עמודים",
    paragraphs: "פסקאות",
    askAgent: "שאל סוכן",
    backToLibrary: "חזרה לספרייה",
    intro: "הקטעים הבאים הוצאו מתוך הספר. לחץ על שורה כדי לקבל הסבר בעברית מהסוכן המתאים, עם קישור חזרה למקור.",
    moduleAgent: "סוכן מומלץ:",
  },
  en: {
    chapters: "Chapters",
    pageCount: "pages",
    paragraphs: "paragraphs",
    askAgent: "Ask agent",
    backToLibrary: "Back to library",
    intro: "The following passages were extracted from the book. Click any line for an English explanation from the matching agent, with a deep link back to the source.",
    moduleAgent: "Recommended agent:",
  },
} as const;

export function BookReader({ document }: { document: BookDocument }) {
  const language = useHubStore((s) => s.language);
  const setAgent = useHubStore((s) => s.setActiveAgent);
  const t = COPY[language];
  const HomeArrow = language === "he" ? ArrowRight : ArrowLeft;

  const recommendedAgentId = (document.book.agents[0] as AgentId) ?? "architect";
  const recommended = getAgent(recommendedAgentId);
  const recCopy = language === "he" ? recommended.he : recommended.en;

  const [activeChapterId, setActiveChapterId] = useState(
    document.chapters[0]?.id ?? null,
  );
  const [openParagraph, setOpenParagraph] = useState<{
    paragraphId: string;
    text: string;
    chapterTitle: string;
  } | null>(null);

  const chapterRefs = useRef<Record<string, HTMLElement | null>>({});

  // IntersectionObserver to sync sidebar selection with scroll position.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveChapterId(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const ch of document.chapters) {
      const el = chapterRefs.current[ch.id];
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [document.chapters]);

  const onSelectChapter = (id: string) => {
    chapterRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalParagraphs = useMemo(
    () => document.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0),
    [document.chapters],
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="glass-panel elev-1 sticky top-20 hidden h-[calc(100svh-7rem)] flex-col gap-4 rounded-2xl p-4 lg:flex">
        <Link
          href="/library"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 w-fit gap-1 px-1 text-xs text-muted-foreground",
          )}
        >
          <HomeArrow className="h-3.5 w-3.5" />
          {t.backToLibrary}
        </Link>

        <div>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-4 w-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {document.book.module}
            </span>
          </div>
          <h2 className="mt-1 line-clamp-3 text-sm font-semibold leading-snug">
            {document.book.title}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {document.book.pageCount} {t.pageCount} - {totalParagraphs} {t.paragraphs}
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {t.chapters}
        </p>
        <ScrollArea className="-mx-1 flex-1">
          <ul className="flex flex-col gap-0.5 px-1 pb-2">
            {document.chapters.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectChapter(c.id)}
                  className={cn(
                    "row-interactive flex w-full items-start gap-2 px-2 py-1.5 text-start text-sm",
                    activeChapterId === c.id && "bg-primary/12 text-primary",
                  )}
                >
                  <span className="mt-0.5 inline-block min-w-6 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <div className="rounded-xl border border-foreground/10 bg-card/60 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.moduleAgent}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">{recCopy.name}</span>
            <Link
              href="/chat"
              onClick={() => setAgent(recommendedAgentId)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "gap-1",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t.askAgent}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="space-y-8 pb-16">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel elev-1 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Click to explain
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
            {document.book.title}
          </h1>
          <p className="mt-3 max-w-prose text-sm text-muted-foreground">{t.intro}</p>
        </motion.section>

        {document.chapters.map((ch, idx) => (
          <section
            key={ch.id}
            id={ch.id}
            ref={(el) => {
              chapterRefs.current[ch.id] = el;
            }}
            className="glass-panel elev-1 rounded-2xl p-6 sm:p-8"
          >
            <header className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-sm text-muted-foreground">
                {String(ch.number).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-semibold tracking-tight">{ch.title}</h2>
            </header>

            <div className="flex flex-col gap-3 text-[15px] leading-7 text-foreground/90">
              {ch.paragraphs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {language === "he"
                    ? "אין פסקאות באינדקס לפרק זה."
                    : "No indexed paragraphs for this chapter."}
                </p>
              )}
              {ch.paragraphs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="row-interactive text-start"
                  data-active={openParagraph?.paragraphId === p.id ? "true" : "false"}
                  onClick={() =>
                    setOpenParagraph({
                      paragraphId: p.id,
                      text: p.text,
                      chapterTitle: ch.title,
                    })
                  }
                >
                  {p.text}
                </button>
              ))}
            </div>

            {idx === document.chapters.length - 1 && (
              <p className="mt-6 text-xs text-muted-foreground">
                {language === "he"
                  ? "אינדקס מקוצר: כ-80 עמודים ראשונים מתוך הספר. לפרקים נוספים, הרץ npm run kb:index לאחר עדכון הספר."
                  : "Trimmed index: roughly the first 80 pages of the book. Re-run npm run kb:index to refresh after updating the source PDF."}
              </p>
            )}
          </section>
        ))}
      </main>

      <ExplainPanel
        bookSlug={document.book.slug}
        agentId={recommendedAgentId}
        paragraph={openParagraph}
        onClose={() => setOpenParagraph(null)}
      />
    </div>
  );
}
