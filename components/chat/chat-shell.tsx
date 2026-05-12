"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { AgentSelector } from "./agent-selector";
import { MessageList } from "./message-list";
import { Composer } from "./composer";
import { ConversationMenu } from "./conversation-menu";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import type { Citation } from "@/lib/types";

const COPY = {
  he: { openMenu: "תפריט" },
  en: { openMenu: "Menu" },
} as const;

export function ChatShell() {
  const language = useHubStore((s) => s.language);
  const activeAgentId = useHubStore((s) => s.activeAgentId);
  const activeId = useHubStore((s) => s.activeId);
  const conversations = useHubStore((s) => s.conversations);
  const newConversation = useHubStore((s) => s.newConversation);
  const appendUserMessage = useHubStore((s) => s.appendUserMessage);
  const appendAssistantPlaceholder = useHubStore((s) => s.appendAssistantPlaceholder);
  const patchAssistantMessage = useHubStore((s) => s.patchAssistantMessage);
  const prepareRegenerate = useHubStore((s) => s.prepareRegenerate);
  const hydrated = useHubStore((s) => s.hydrated);

  const [input, setInput] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Bootstrap one conversation per agent on first paint.
  useEffect(() => {
    if (!hydrated) return;
    if (!activeId || !conversations[activeId]) {
      newConversation();
    }
  }, [hydrated, activeId, conversations, newConversation]);

  const activeConv = activeId ? conversations[activeId] : undefined;
  const agent = getAgent(activeAgentId);
  const t = COPY[language];

  const messages = activeConv?.messages ?? [];

  const handleSubmit = useCallback(
    async (overridePrompt?: string, opts?: { skipAppendUser?: boolean }) => {
      const prompt = (overridePrompt ?? input).trim();
      if (!prompt || streamingMessageId) return;

      if (!opts?.skipAppendUser) {
        const userRef = appendUserMessage(prompt);
        if (!userRef) return;
        setInput("");
      }

      const placeholderRef = appendAssistantPlaceholder();
      if (!placeholderRef) return;
      setStreamingMessageId(placeholderRef.messageId);

      const controller = new AbortController();
      abortRef.current = controller;

      const conv = useHubStore.getState().conversations[placeholderRef.conversationId];
      const payload = {
        agent: activeAgentId,
        language,
        messages:
          conv?.messages
            .filter((m) => m.role !== "assistant" || m.content.length > 0)
            .map((m) => ({ role: m.role, content: m.content })) ?? [],
      };

      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!resp.ok || !resp.body) {
          throw new Error(`Request failed (${resp.status})`);
        }
        await consumeStream(resp.body, controller.signal, {
          onDelta: (chunk) =>
            patchAssistantMessage(placeholderRef.conversationId, placeholderRef.messageId, {
              append: chunk,
            }),
          onCitations: (citations) =>
            patchAssistantMessage(placeholderRef.conversationId, placeholderRef.messageId, {
              citations,
            }),
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          patchAssistantMessage(placeholderRef.conversationId, placeholderRef.messageId, {
            append:
              language === "he"
                ? `\n\n_שגיאה בקבלת תשובה: ${(err as Error).message}_`
                : `\n\n_Error while streaming: ${(err as Error).message}_`,
          });
        }
      } finally {
        setStreamingMessageId(null);
        abortRef.current = null;
      }
    },
    [
      input,
      streamingMessageId,
      activeAgentId,
      language,
      appendUserMessage,
      appendAssistantPlaceholder,
      patchAssistantMessage,
    ],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleRegenerate = useCallback(() => {
    if (streamingMessageId) return;
    const ref = prepareRegenerate();
    if (!ref) return;
    handleSubmit(ref.lastUserText, { skipAppendUser: true });
  }, [streamingMessageId, prepareRegenerate, handleSubmit]);

  const composerBusy = streamingMessageId !== null;

  const headerAgentName = useMemo(() => {
    return language === "he" ? agent.he.name : agent.en.name;
  }, [agent, language]);

  return (
    <div className="flex min-h-svh flex-1">
      <div className="hidden sm:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b border-foreground/5 bg-background/70 px-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={(props) => (
                  <Button
                    {...props}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="sm:hidden"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">{t.openMenu}</span>
                  </Button>
                )}
              />
              <SheetContent
                side={language === "he" ? "right" : "left"}
                className="w-[300px] p-0"
              >
                <SheetTitle className="sr-only">{t.openMenu}</SheetTitle>
                <Sidebar onSelect={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="truncate text-sm font-medium">{headerAgentName}</span>
          </div>
          <div className="flex items-center gap-1">
            <AgentSelector activeAgentId={activeAgentId} language={language} />
            <ConversationMenu conversation={activeConv} language={language} />
          </div>
        </header>

        <MessageList
          messages={messages}
          streamingMessageId={streamingMessageId}
          agentId={activeAgentId}
          language={language}
          onSampleClick={(prompt) => handleSubmit(prompt)}
          onRegenerate={handleRegenerate}
        />

        <Composer
          value={input}
          onChange={setInput}
          onSubmit={() => handleSubmit()}
          onStop={handleStop}
          busy={composerBusy}
          language={language}
        />
      </div>
    </div>
  );
}

interface StreamHandlers {
  onDelta: (chunk: string) => void;
  onCitations: (citations: Citation[]) => void;
}

async function consumeStream(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  handlers: StreamHandlers,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal.aborted) {
      await reader.cancel();
      break;
    }
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const trimmed = rawEvent.trim();
      if (!trimmed) continue;
      const eventLine = trimmed.split("\n").find((l) => l.startsWith("event:")) ?? "event: delta";
      const dataLine = trimmed.split("\n").find((l) => l.startsWith("data:")) ?? "data: {}";
      const event = eventLine.slice(6).trim();
      const dataJson = dataLine.slice(5).trim();
      let data: unknown;
      try {
        data = JSON.parse(dataJson);
      } catch {
        // Fallback: treat data as raw text chunk.
        handlers.onDelta(dataJson);
        continue;
      }
      if (event === "delta" && typeof (data as { content?: string }).content === "string") {
        handlers.onDelta((data as { content: string }).content);
      } else if (event === "citations") {
        handlers.onCitations(((data as { citations?: Citation[] }).citations) ?? []);
      } else if (event === "done") {
        return;
      }
    }
  }
}
