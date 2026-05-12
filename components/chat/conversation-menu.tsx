"use client";

import { useState } from "react";
import { Check, Copy, FileJson, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  conversationToJson,
  conversationToMarkdown,
  safeFilename,
  triggerDownload,
} from "@/lib/export";
import type { Conversation, Language } from "@/lib/types";

const COPY = {
  he: {
    label: "פעולות שיחה",
    title: "ייצוא שיחה",
    copyMd: "העתק כ-Markdown",
    downloadMd: "הורד .md",
    downloadJson: "הורד .json",
    copied: "הועתק",
    empty: "אין הודעות לייצוא",
  },
  en: {
    label: "Conversation actions",
    title: "Export conversation",
    copyMd: "Copy as Markdown",
    downloadMd: "Download .md",
    downloadJson: "Download .json",
    copied: "Copied",
    empty: "No messages to export",
  },
} as const;

export function ConversationMenu({
  conversation,
  language,
}: {
  conversation: Conversation | undefined;
  language: Language;
}) {
  const [copied, setCopied] = useState(false);
  const t = COPY[language];
  const disabled = !conversation || conversation.messages.length === 0;

  const handleCopyMd = async () => {
    if (!conversation) return;
    const md = conversationToMarkdown(conversation);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked, fall back to download.
      triggerDownload(safeFilename(conversation.title, "md"), "text/markdown", md);
    }
  };

  const handleDownload = (kind: "md" | "json") => {
    if (!conversation) return;
    if (kind === "md") {
      triggerDownload(
        safeFilename(conversation.title, "md"),
        "text/markdown",
        conversationToMarkdown(conversation),
      );
    } else {
      triggerDownload(
        safeFilename(conversation.title, "json"),
        "application/json",
        conversationToJson(conversation),
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={t.label}
            className="gap-1"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyMd} disabled={disabled}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? t.copied : t.copyMd}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("md")} disabled={disabled}>
          <FileText className="h-4 w-4" />
          {t.downloadMd}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("json")} disabled={disabled}>
          <FileJson className="h-4 w-4" />
          {t.downloadJson}
        </DropdownMenuItem>
        {disabled && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
              {t.empty}
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

