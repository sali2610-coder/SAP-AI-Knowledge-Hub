"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookText,
  MessageSquare,
  Quote,
  Sparkles,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMarkdown } from "@/components/chat/markdown";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { AgentId, Citation } from "@/lib/types";

const COPY = {
  he: {
    title: "הסבר של יועץ בכיר",
    close: "סגור",
    source: "הקטע שבחרת",
    agent: "סוכן מומחה",
    fromBook: "מתוך הספר",
    fromAgent: "יועץ בכיר",
    askInChat: "המשך בצ׳אט",
    sources: "מקורות מצולבים",
    loading: "היועץ מנסח תשובה...",
    seniorTag: "יועץ SAP",
    page: "עמוד",
  },
  en: {
    title: "Senior consultant briefing",
    close: "Close",
    source: "Selected passage",
    agent: "Specialist agent",
    fromBook: "From the book",
    fromAgent: "Senior consultant",
    askInChat: "Continue in chat",
    sources: "Cross-references",
    loading: "Consultant drafting answer...",
    seniorTag: "SAP consultant",
    page: "page",
  },
} as const;

interface Props {
  bookSlug: string;
  agentId: AgentId;
  paragraph:
    | { paragraphId: string; text: string; chapterTitle: string }
    | null;
  onClose: () => void;
}

export function ExplainPanel({ bookSlug, agentId, paragraph, onClose }: Props) {
  const language = useHubStore((s) => s.language);
  const setActiveAgent = useHubStore((s) => s.setActiveAgent);
  const newConversation = useHubStore((s) => s.newConversation);
  const t = COPY[language];

  const agent = getAgent(agentId);
  const agentCopy = language === "he" ? agent.he : agent.en;

  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [source, setSource] = useState<"book" | "agent">("book");
  const abortRef = useRef<AbortController | null>(null);

  // Close panel on Escape.
  useEffect(() => {
    if (!paragraph) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paragraph, onClose]);

  useEffect(() => {
    if (!paragraph) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setContent("");
    setCitations([]);
    setSource("book");
    setStreaming(true);

    (async () => {
      try {
        const resp = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookSlug,
            paragraphId: paragraph.paragraphId,
            agent: agentId,
            language,
          }),
          signal: controller.signal,
        });
        if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          if (controller.signal.aborted) {
            await reader.cancel();
            break;
          }
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            const trimmed = evt.trim();
            if (!trimmed) continue;
            const eventLine =
              trimmed.split("\n").find((l) => l.startsWith("event:")) ??
              "event: delta";
            const dataLine =
              trimmed.split("\n").find((l) => l.startsWith("data:")) ?? "data: {}";
            const ev = eventLine.slice(6).trim();
            const dataJson = dataLine.slice(5).trim();
            let data: unknown = {};
            try {
              data = JSON.parse(dataJson);
            } catch {
              // ignore malformed event payload
            }
            if (ev === "delta") {
              const c = (data as { content?: string }).content ?? "";
              setContent((prev) => prev + c);
            } else if (ev === "meta") {
              setSource((data as { source?: "book" | "agent" }).source ?? "book");
            } else if (ev === "citations") {
              setCitations(((data as { citations?: Citation[] }).citations) ?? []);
            } else if (ev === "done") {
              break;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setContent(
            (prev) =>
              prev +
              (language === "he"
                ? `\n\n_שגיאה: ${(err as Error).message}_`
                : `\n\n_Error: ${(err as Error).message}_`),
          );
        }
      } finally {
        setStreaming(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [paragraph, bookSlug, agentId, language]);

  const handleContinueInChat = () => {
    setActiveAgent(agentId);
    newConversation(agentId);
  };

  return (
    <AnimatePresence>
      {paragraph && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: language === "he" ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: language === "he" ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "glass-panel elev-3 fixed inset-y-0 z-50 flex w-full max-w-xl flex-col overflow-hidden",
              language === "he"
                ? "start-0 border-e border-foreground/10"
                : "end-0 border-s border-foreground/10",
            )}
            role="dialog"
            aria-label={t.title}
          >
            <div
              aria-hidden
              className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-amber-400"
            />
            <header className="flex items-start justify-between gap-3 border-b border-foreground/8 px-6 py-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-primary ring-1 ring-primary/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.seniorTag}
                </div>
                <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold leading-tight tracking-tight">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  {agentCopy.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {agentCopy.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="rounded-full bg-foreground/5 p-2 transition hover:bg-foreground/10"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 ring-1 ring-inset ring-primary/10">
                <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary/80">
                  <Quote className="h-3.5 w-3.5" />
                  {t.source}
                  {paragraph.chapterTitle && (
                    <span className="text-muted-foreground">
                      · {paragraph.chapterTitle}
                    </span>
                  )}
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">
                  {paragraph.text}
                </p>
              </section>

              <section className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.agent}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ring-1",
                      source === "book"
                        ? "bg-primary/12 text-primary ring-primary/25"
                        : "bg-amber-500/12 text-amber-600 dark:text-amber-300 ring-amber-400/30",
                    )}
                  >
                    <BookText className="h-3 w-3" />
                    {source === "book" ? t.fromBook : t.fromAgent}
                  </span>
                </div>

                {streaming && content.length === 0 ? (
                  <div className="space-y-2.5">
                    <Skeleton className="h-3 w-2/3 skeleton" />
                    <Skeleton className="h-3 w-5/6 skeleton" />
                    <Skeleton className="h-3 w-4/6 skeleton" />
                    <Skeleton className="h-3 w-3/6 skeleton" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t.loading}
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "prose prose-sm max-w-none dark:prose-invert",
                      "[&_code]:rounded [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:text-primary [&_code]:font-mono [&_code]:text-[0.85em]",
                      "[&_blockquote]:border-s-2 [&_blockquote]:border-primary/40 [&_blockquote]:ps-3 [&_blockquote]:text-foreground/80 [&_blockquote]:not-italic",
                      "[&_h1]:text-base [&_h2]:text-sm [&_h2]:mt-4 [&_h3]:text-sm",
                      "[&_strong]:text-foreground [&_strong]:font-semibold",
                    )}
                  >
                    <ChatMarkdown text={content} />
                  </div>
                )}

                {citations.length > 0 && !streaming && (
                  <div className="mt-6">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.sources}
                    </p>
                    <ul className="space-y-2">
                      {citations.map((c, i) => {
                        const params = new URLSearchParams();
                        if (c.paragraphId) params.set("p", c.paragraphId);
                        if (c.page) params.set("page", String(c.page));
                        const qs = params.toString();
                        const href = qs
                          ? `/library/${c.bookSlug}?${qs}`
                          : `/library/${c.bookSlug}`;
                        return (
                          <li
                            key={`${c.bookSlug}-${i}`}
                            className="border-s-2 border-primary/40 ps-3"
                          >
                            <Link
                              href={href}
                              className="block text-[13px] leading-snug text-foreground/85 transition hover:text-primary"
                            >
                              <span className="block font-medium">{c.bookTitle}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                {c.chapter ?? ""}
                                {c.page ? ` · ${t.page} ${c.page}` : ""}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </section>
            </div>

            <footer className="border-t border-foreground/8 px-6 py-4">
              <Link
                href="/chat"
                onClick={handleContinueInChat}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full justify-center gap-2",
                )}
              >
                <MessageSquare className="h-4 w-4" />
                {t.askInChat}
              </Link>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
