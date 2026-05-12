"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Globe, Plus, Trash2, MessageSquareText, ArrowLeft, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useHubStore } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { BackendBadge } from "@/components/site/backend-badge";
import { ThemeToggle } from "@/components/site/theme-toggle";

const COPY = {
  he: {
    title: "SAP AI Knowledge Hub",
    new: "שיחה חדשה",
    history: "שיחות אחרונות",
    switchLang: "English",
    empty: "אין שיחות עדיין",
    backHome: "חזרה לדף הבית",
  },
  en: {
    title: "SAP AI Knowledge Hub",
    new: "New conversation",
    history: "Recent conversations",
    switchLang: "עברית",
    empty: "No conversations yet",
    backHome: "Back to home",
  },
} as const;

export function Sidebar({ onSelect }: { onSelect?: () => void }) {
  const language = useHubStore((s) => s.language);
  const setLanguage = useHubStore((s) => s.setLanguage);
  const conversations = useHubStore((s) => s.conversations);
  const activeId = useHubStore((s) => s.activeId);
  const newConversation = useHubStore((s) => s.newConversation);
  const selectConversation = useHubStore((s) => s.selectConversation);
  const deleteConversation = useHubStore((s) => s.deleteConversation);
  const t = COPY[language];

  const sorted = useMemo(
    () => Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  const HomeArrow = language === "he" ? ArrowRight : ArrowLeft;

  return (
    <aside className="flex h-full w-full flex-col border-e border-foreground/5 bg-background/80 backdrop-blur sm:w-[280px]">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-amber-300" />
          <span className="truncate">{t.title}</span>
        </Link>
        <BackendBadge compact />
      </div>

      <div className="px-3">
        <Button
          type="button"
          onClick={() => {
            newConversation();
            onSelect?.();
          }}
          className="w-full justify-start gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          {t.new}
        </Button>
      </div>

      <Separator className="my-3 bg-foreground/5" />

      <p className="px-4 text-[11px] uppercase tracking-wider text-muted-foreground">
        {t.history}
      </p>

      <ScrollArea className="mt-2 flex-1 px-2">
        {sorted.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">{t.empty}</p>
        )}
        <ul className="flex flex-col gap-1 pb-3">
          {sorted.map((c) => {
            const agent = getAgent(c.agentId);
            const copy = language === "he" ? agent.he : agent.en;
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition",
                    active
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/80 hover:bg-foreground/5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      selectConversation(c.id);
                      onSelect?.();
                    }}
                    className="flex min-w-0 flex-1 items-start gap-2 text-start"
                  >
                    <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{c.title}</span>
                      <span className="text-[11px] text-muted-foreground">{copy.name}</span>
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0 p-0 opacity-0 transition group-hover:opacity-100"
                    onClick={() => deleteConversation(c.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      <Separator className="bg-foreground/5" />

      <div className="flex items-center justify-between gap-1 px-3 py-3">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1 text-xs text-muted-foreground",
          )}
        >
          <HomeArrow className="h-3.5 w-3.5" />
          {t.backHome}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "he" ? "en" : "he")}
            className="gap-1 text-xs"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.switchLang}
          </Button>
        </div>
      </div>
    </aside>
  );
}
