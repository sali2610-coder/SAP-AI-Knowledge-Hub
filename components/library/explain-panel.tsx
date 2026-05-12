"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Quote, BookText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMarkdown } from "@/components/chat/markdown";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { AgentId, Citation } from "@/lib/types";

const COPY = {
  he: {
    title: "הסבר חכם",
    close: "סגור",
    source: "מתוך הקטע שנבחר",
    agent: "סוכן מומחה",
    fromBook: "מקור בספר",
    fromAgent: "ידע סוכן",
    askInChat: "המשך בצ׳אט",
    sources: "מקורות",
    loading: "מנסח הסבר...",
  },
  en: {
    title: "Smart explanation",
    close: "Close",
    source: "Selected passage",
    agent: "Specialist agent",
    fromBook: "Book source",
    fromAgent: "Agent knowledge",
    askInChat: "Continue in chat",
    sources: "Sources",
    loading: "Drafting explanation...",
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
              trimmed.split("\n").find((l) => l.startsWith("event:")) ?? "event: delta";
            const dataLine =
              trimmed.split("\n").find((l) => l.startsWith("data:")) ?? "data: {}";
            const ev = eventLine.slice(6).trim();
            const dataJson = dataLine.slice(5).trim();
            let data: unknown = {};
            try {
              data = JSON.parse(dataJson);
            } catch {
              // ignore
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
              "fixed inset-y-0 z-50 flex w-full max-w-xl flex-col border-foreground/10 bg-background/95 elev-3 backdrop-blur",
              language === "he" ? "start-0 border-e" : "end-0 border-s",
            )}
          >
            <header className="flex items-start justify-between gap-3 border-b border-foreground/8 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">
                    {t.title}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-semibold">{agentCopy.name}</h3>
                <p className="text-xs text-muted-foreground">{agentCopy.tagline}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label={t.close}
              >
                <X className="h-4 w-4" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <section className="rounded-xl border border-foreground/10 bg-card/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Quote className="h-3.5 w-3.5" />
                  {t.source} - {paragraph.chapterTitle}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {paragraph.text}
                </p>
              </section>

              <section className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.agent}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                      source === "book"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-amber-400/30 bg-amber-500/10 text-amber-300",
                    )}
                  >
                    <BookText className="h-3 w-3" />
                    {source === "book" ? t.fromBook : t.fromAgent}
                  </span>
                </div>

                {streaming && content.length === 0 ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                    <Skeleton className="h-3 w-3/6" />
                    <p className="mt-3 text-xs text-muted-foreground">{t.loading}</p>
                  </div>
                ) : (
                  <ChatMarkdown text={content} />
                )}

                {citations.length > 0 && !streaming && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.sources}
                    </span>
                    {citations.map((c, i) => (
                      <span
                        key={`${c.bookSlug}-${i}`}
                        className="inline-flex max-w-[280px] items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px]"
                      >
                        <BookText className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate">{c.bookTitle}</span>
                        {c.chapter && (
                          <span className="text-muted-foreground">- {c.chapter}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <footer className="border-t border-foreground/8 px-6 py-3">
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
