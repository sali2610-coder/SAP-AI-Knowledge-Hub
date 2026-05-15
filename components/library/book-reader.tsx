"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Check,
  Link2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExplainPanel } from "./explain-panel";
import { PdfPageView } from "./pdf-page-view";
import { InsightTiles } from "./insight-tiles";
import { MasterAgentOrb } from "./master-agent-orb";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { BookDocument } from "@/lib/book-loader";
import type { AgentId } from "@/lib/types";

const COPY = {
  he: {
    back: "כל הספרים",
    askAgent: "המשך בצ׳אט",
    intro: "צד ימין - המקור. צד שמאל - היועץ שלך. לחץ על כל פסקה כדי לפתוח הסבר אינטראקטיבי.",
    chapters: "פרקים",
    bookmark: "סמן פסקה",
    bookmarked: "סומן",
    share: "העתק קישור",
    shared: "הקישור הועתק",
    paragraph: "פסקה",
    page: "עמוד",
    expand: "פתח פרק",
    moduleAgent: "סוכן מומלץ",
  },
  en: {
    back: "All books",
    askAgent: "Continue in chat",
    intro: "Right - the source. Left - your consultant. Tap any passage to open an interactive briefing.",
    chapters: "Chapters",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    share: "Copy link",
    shared: "Link copied",
    paragraph: "passage",
    page: "page",
    expand: "Expand",
    moduleAgent: "Recommended agent",
  },
} as const;

const MODULE_BADGE: Record<string, string> = {
  PP: "bg-[#e6f1fe] text-[#0070f2]",
  "PP-DS": "bg-[#e6f1fe] text-[#0070f2]",
  PM: "bg-[#dff5e3] text-[#107e3e]",
  QM: "bg-[#dff7fb] text-[#0e7490]",
  WM: "bg-[#ecebfd] text-[#4f46e5]",
  MM: "bg-[#fff1e2] text-[#b8581b]",
  IBP: "bg-[#dff5e3] text-[#107e3e]",
  Fiori: "bg-[#f3e8ff] text-[#7c3aed]",
  Foundation: "bg-[#e0eaff] text-[#1d4ed8]",
  General: "bg-foreground/10 text-foreground/80",
};

export function BookReader({ document: doc }: { document: BookDocument }) {
  const language = useHubStore((s) => s.language);
  const setAgent = useHubStore((s) => s.setActiveAgent);
  const bookmarks = useHubStore((s) => s.bookmarks);
  const toggleBookmark = useHubStore((s) => s.toggleBookmark);
  const newConversation = useHubStore((s) => s.newConversation);
  const t = COPY[language];
  const HomeArrow = language === "he" ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();

  const recommendedAgentId =
    (doc.book.agents[0] as AgentId) ?? "architect";
  const recommended = getAgent(recommendedAgentId);
  const recCopy = language === "he" ? recommended.he : recommended.en;

  const [openParagraph, setOpenParagraph] = useState<{
    paragraphId: string;
    text: string;
    chapterTitle: string;
  } | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(
    doc.chapters[0]?.id ?? null,
  );
  const initialPdfPage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0
      ? Math.min(n, doc.book.pageCount)
      : 1;
  }, [searchParams, doc.book.pageCount]);

  const paragraphRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Deep-link via ?p= opens the explain panel and snaps the chapter open.
  useEffect(() => {
    const p = searchParams.get("p");
    if (!p) return;
    for (const ch of doc.chapters) {
      const match = ch.paragraphs.find((x) => x.id === p);
      if (match) {
        queueMicrotask(() => {
          setExpandedChapter(ch.id);
          setOpenParagraph({
            paragraphId: match.id,
            text: match.text,
            chapterTitle: ch.title,
          });
          setTimeout(() => {
            paragraphRefs.current[match.id]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 120);
        });
        return;
      }
    }
  }, [searchParams, doc.chapters]);

  const totalParagraphs = useMemo(
    () => doc.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0),
    [doc.chapters],
  );

  const moduleBadgeClass = MODULE_BADGE[doc.book.module] ?? MODULE_BADGE.General;

  return (
    <div
      className="relative min-h-svh"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(0,112,242,0.08), transparent 60%)," +
          "radial-gradient(1100px 600px at 90% 10%, rgba(250,139,70,0.07), transparent 60%)," +
          "#f0f2f5",
      }}
    >
      <header className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/library"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1 rounded-full bg-white/60 px-3 text-[color:var(--foreground)] shadow-sm ring-1 ring-foreground/5 backdrop-blur hover:bg-white",
            )}
          >
            <HomeArrow className="h-3.5 w-3.5" />
            {t.back}
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                moduleBadgeClass,
              )}
            >
              {doc.book.module}
            </span>
            <Link
              href="/chat"
              onClick={() => {
                setAgent(recommendedAgentId);
                newConversation(recommendedAgentId);
              }}
              className={cn(
                buttonVariants({ size: "sm" }),
                "gap-1 rounded-full px-3 text-xs",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t.askAgent}
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#0070f2]">
            {t.moduleAgent}: {recCopy.name}
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-[color:var(--foreground)] sm:text-3xl">
            {doc.book.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.intro}</p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="space-y-5 lg:order-1">
          <InsightTiles doc={doc} totalParagraphs={totalParagraphs} />

          <div className="rounded-3xl bg-white p-4 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0070f2]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0070f2]">
                {t.chapters}
              </p>
            </div>
            <ScrollArea className="max-h-[70svh] pe-1">
              <ul className="flex flex-col gap-2">
                {doc.chapters.map((ch) => {
                  const isOpen = expandedChapter === ch.id;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedChapter(isOpen ? null : ch.id)
                        }
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-sm transition",
                          isOpen
                            ? "bg-[#eef5ff] text-[#0070f2]"
                            : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10",
                        )}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {String(ch.number).padStart(2, "0")}
                        </span>
                        <span className="flex-1 line-clamp-1 font-medium">
                          {ch.title}
                        </span>
                        <span className="tnum rounded-full bg-white px-2 py-0.5 text-[10px] font-mono text-muted-foreground shadow-sm ring-1 ring-foreground/5">
                          {ch.paragraphs.length}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <ul className="flex flex-col gap-1.5 px-1 py-2">
                              {ch.paragraphs.map((p) => {
                                const isBookmarked = !!bookmarks[p.id];
                                const isActive =
                                  openParagraph?.paragraphId === p.id;
                                return (
                                  <li
                                    key={p.id}
                                    className="group/row relative flex gap-1"
                                  >
                                    <button
                                      type="button"
                                      ref={(el) => {
                                        paragraphRefs.current[p.id] = el;
                                      }}
                                      className={cn(
                                        "flex-1 rounded-xl border bg-white px-3 py-2 text-start text-[13px] leading-6 text-foreground/85 transition",
                                        isActive
                                          ? "border-[#0070f2]/50 bg-[#eef5ff] shadow-[0_10px_30px_-18px_rgba(0,112,242,0.55)]"
                                          : "border-foreground/8 hover:border-[#0070f2]/30 hover:bg-[#fbfdff]",
                                      )}
                                      onClick={() =>
                                        setOpenParagraph({
                                          paragraphId: p.id,
                                          text: p.text,
                                          chapterTitle: ch.title,
                                        })
                                      }
                                    >
                                      <span className="line-clamp-3">{p.text}</span>
                                    </button>
                                    <div className="flex shrink-0 items-start gap-0.5 opacity-0 transition group-hover/row:opacity-100">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        aria-label={
                                          isBookmarked ? t.bookmarked : t.bookmark
                                        }
                                        title={
                                          isBookmarked ? t.bookmarked : t.bookmark
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleBookmark({
                                            paragraphId: p.id,
                                            bookSlug: doc.book.slug,
                                            bookTitle: doc.book.title,
                                            excerpt: p.text.slice(0, 220),
                                            chapterTitle: ch.title,
                                            addedAt: Date.now(),
                                          });
                                        }}
                                        className={cn(
                                          "h-7 w-7 p-0 text-muted-foreground",
                                          isBookmarked && "text-[#0070f2]",
                                        )}
                                      >
                                        {isBookmarked ? (
                                          <BookmarkCheck className="h-3.5 w-3.5" />
                                        ) : (
                                          <Bookmark className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        aria-label={t.share}
                                        title={
                                          sharedId === p.id ? t.shared : t.share
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const url = `${window.location.origin}/library/${doc.book.slug}?p=${encodeURIComponent(p.id)}`;
                                          navigator.clipboard
                                            .writeText(url)
                                            .then(() => {
                                              setSharedId(p.id);
                                              setTimeout(
                                                () => setSharedId(null),
                                                1400,
                                              );
                                            });
                                        }}
                                        className="h-7 w-7 p-0 text-muted-foreground"
                                      >
                                        {sharedId === p.id ? (
                                          <Check className="h-3.5 w-3.5 text-[#107e3e]" />
                                        ) : (
                                          <Link2 className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        </section>

        <section className="lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] bg-white p-4 ring-1 ring-foreground/8"
            style={{
              boxShadow:
                "0 40px 100px -40px rgba(15,23,42,0.45), 0 12px 30px -16px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.04)",
            }}
          >
            <div className="h-[78svh] min-h-[600px]">
              <PdfPageView
                slug={doc.book.slug}
                initialPage={initialPdfPage}
                totalPages={doc.book.pageCount}
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-muted-foreground">
              <span>
                {t.page}{" "}
                <span className="tnum font-mono">{initialPdfPage}</span> /{" "}
                <span className="tnum font-mono">{doc.book.pageCount}</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {doc.book.module}
              </span>
            </div>
          </motion.div>
        </section>
      </main>

      <ExplainPanel
        bookSlug={doc.book.slug}
        agentId={recommendedAgentId}
        paragraph={openParagraph}
        onClose={() => setOpenParagraph(null)}
      />

      <MasterAgentOrb
        module={doc.book.module}
        onChat={() => {
          setAgent(recommendedAgentId);
          newConversation(recommendedAgentId);
          window.location.href = "/chat";
        }}
      />
    </div>
  );
}
