"use client";

import { motion } from "framer-motion";
import { User2, Sparkles } from "lucide-react";
import { ChatMarkdown } from "./markdown";
import { Citations } from "./citations";
import { cn } from "@/lib/utils";
import type { ChatMessage, Language } from "@/lib/types";

export function MessageBubble({
  message,
  language,
  streaming,
  agentName,
}: {
  message: ChatMessage;
  language: Language;
  streaming?: boolean;
  agentName: string;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-gradient-to-br from-violet-600/50 to-fuchsia-500/40 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[min(80ch,86%)] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-foreground/10 bg-card/70 backdrop-blur",
        )}
      >
        {!isUser && (
          <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {agentName}
          </p>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        ) : (
          <>
            <ChatMarkdown text={message.content || (streaming ? "..." : "")} />
            {streaming && (
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-foreground/80 align-baseline" />
            )}
            <Citations citations={message.citations} language={language} />
          </>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5">
          <User2 className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
