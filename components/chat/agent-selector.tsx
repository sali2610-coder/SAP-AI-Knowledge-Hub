"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AGENTS, getAgent } from "@/lib/agents";
import { useHubStore } from "@/lib/store";
import { AgentCard } from "@/components/landing/agent-card";
import type { AgentId, Language } from "@/lib/types";

const COPY = {
  he: {
    title: "החלף סוכן",
    sub: "כל סוכן מקבל הקשר ופרסונה שונה. בחר את הסוכן שמתאים לשאלה הנוכחית.",
    current: "סוכן נוכחי",
  },
  en: {
    title: "Switch agent",
    sub: "Each agent uses a different persona and context. Pick the right one for the question at hand.",
    current: "Current agent",
  },
} as const;

export function AgentSelector({
  activeAgentId,
  language,
}: {
  activeAgentId: AgentId;
  language: Language;
}) {
  const [open, setOpen] = useState(false);
  const setAgent = useHubStore((s) => s.setActiveAgent);
  const t = COPY[language];
  const agent = getAgent(activeAgentId);
  const copy = language === "he" ? agent.he : agent.en;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-foreground/15 bg-card/60 px-3"
          >
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.current}
            </span>
            <span className="font-medium">{copy.name}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      />
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.sub}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AGENTS.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              language={language}
              selected={a.id === activeAgentId}
              onClick={() => {
                setAgent(a.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
