"use client";

import { useEffect, useRef } from "react";
import { RefreshCcw, Sparkles } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { Button } from "@/components/ui/button";
import { getAgent } from "@/lib/agents";
import type { ChatMessage, AgentId, Language } from "@/lib/types";

const EMPTY = {
  he: {
    title: "התחל שיחה",
    sub: "בחר שאלה לדוגמה או נסח שאלה משלך. הסוכן יענה עם תרשימים, קוד ואזכורי מקור.",
  },
  en: {
    title: "Start a conversation",
    sub: "Pick a sample prompt or write your own. The agent will reply with diagrams, code and source citations.",
  },
} as const;

const REGEN = {
  he: "צור תשובה מחדש",
  en: "Regenerate response",
} as const;

export function MessageList({
  messages,
  streamingMessageId,
  agentId,
  language,
  onSampleClick,
  onRegenerate,
}: {
  messages: ChatMessage[];
  streamingMessageId: string | null;
  agentId: AgentId;
  language: Language;
  onSampleClick?: (prompt: string) => void;
  onRegenerate?: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const agent = getAgent(agentId);
  const copy = language === "he" ? agent.he : agent.en;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingMessageId]);

  if (messages.length === 0) {
    const t = EMPTY[language];
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30">
          <Sparkles className="h-7 w-7 text-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {copy.name} - {t.title}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">{t.sub}</p>
        </div>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
          {copy.examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onSampleClick?.(ex)}
              className="rounded-xl border border-foreground/10 bg-card/60 px-4 py-3 text-start text-sm text-foreground/90 transition hover:border-foreground/30 hover:bg-card/80"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const last = messages[messages.length - 1];
  const canRegenerate =
    Boolean(onRegenerate) &&
    streamingMessageId === null &&
    last !== undefined &&
    (last.role === "assistant" || last.role === "user") &&
    messages.some((m) => m.role === "user");

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-6 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            language={language}
            agentName={copy.name}
            streaming={m.id === streamingMessageId}
          />
        ))}
        {canRegenerate && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="gap-2 rounded-full"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {REGEN[language]}
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
