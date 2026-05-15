"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  Factory,
  Code2,
  TestTube2,
  Compass,
  Wrench,
  ShieldCheck,
  Boxes,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { AgentId, Language } from "@/lib/types";

const COPY = {
  he: {
    title: "החלף סוכן",
    sub: "כל סוכן מקבל הקשר ופרסונה שונה. בחר את הסוכן שמתאים לשאלה הנוכחית.",
    current: "סוכן נוכחי",
    active: "פעיל",
  },
  en: {
    title: "Switch agent",
    sub: "Each agent uses a different persona and context. Pick the right one for the question at hand.",
    current: "Current agent",
    active: "Active",
  },
} as const;

const ICON_MAP: Record<string, LucideIcon> = {
  Factory,
  Code2,
  TestTube2,
  Compass,
  Wrench,
  ShieldCheck,
  Boxes,
  ShoppingCart,
};

// Module-coded gradient + glow. PP - SAP Belize, PM - green, MM - mango,
// Tosca - violet, etc. Glow strength matches the accent ring.
const MODULE_COLOR: Record<
  AgentId,
  { from: string; to: string; ring: string; glow: string; chip: string }
> = {
  pp:        { from: "#0070f2", to: "#5baef7", ring: "ring-[#0070f2]/70", glow: "rgba(0,112,242,0.55)",  chip: "bg-[#0070f2]/12 text-[#0070f2]" },
  pm:        { from: "#107e3e", to: "#36a41d", ring: "ring-[#107e3e]/70", glow: "rgba(16,126,62,0.55)",  chip: "bg-[#107e3e]/12 text-[#107e3e] dark:text-emerald-300" },
  qm:        { from: "#0891b2", to: "#22d3ee", ring: "ring-cyan-400/70",  glow: "rgba(34,211,238,0.55)", chip: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300" },
  wm:        { from: "#6366f1", to: "#8b5cf6", ring: "ring-indigo-400/70",glow: "rgba(99,102,241,0.55)", chip: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300" },
  mm:        { from: "#fa8b46", to: "#fbbf24", ring: "ring-orange-400/70",glow: "rgba(250,139,70,0.55)", chip: "bg-orange-500/12 text-orange-600 dark:text-orange-300" },
  tosca:     { from: "#7c3aed", to: "#a855f7", ring: "ring-violet-400/70",glow: "rgba(124,58,237,0.55)", chip: "bg-violet-500/12 text-violet-600 dark:text-violet-300" },
  "abap-s4": { from: "#1e40af", to: "#3b82f6", ring: "ring-sky-400/70",   glow: "rgba(59,130,246,0.55)", chip: "bg-sky-500/12 text-sky-600 dark:text-sky-300" },
  architect: { from: "#0f766e", to: "#10b981", ring: "ring-emerald-400/70",glow: "rgba(16,185,129,0.55)",chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300" },
};

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
  const activeStyle = MODULE_COLOR[activeAgentId] ?? MODULE_COLOR.architect;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full border-foreground/15 bg-card/70 px-3 backdrop-blur",
              "ring-1 ring-inset",
              activeStyle.ring,
            )}
          >
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.current}
            </span>
            <span className="font-medium">{copy.name}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      />
      <DialogContent className="glass-panel max-w-4xl border-foreground/10">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.sub}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a, i) => {
            const c = MODULE_COLOR[a.id] ?? MODULE_COLOR.architect;
            const Icon = ICON_MAP[a.icon] ?? Compass;
            const acopy = language === "he" ? a.he : a.en;
            const isActive = a.id === activeAgentId;
            return (
              <motion.button
                key={a.id}
                type="button"
                onClick={() => {
                  setAgent(a.id);
                  setOpen(false);
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "group glass-panel elev-1 hover:elev-2 relative overflow-hidden rounded-2xl p-4 text-start transition focus:outline-none",
                  isActive && "ring-2 ring-offset-2 ring-offset-background",
                  isActive && c.ring,
                )}
                style={
                  isActive
                    ? { boxShadow: `0 14px 50px -22px ${c.glow}, 0 0 0 1px ${c.glow}` }
                    : undefined
                }
              >
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
                  }}
                />
                <header className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{acopy.name}</p>
                      {isActive && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                            c.chip,
                          )}
                        >
                          {t.active}
                        </span>
                      )}
                      {!a.primary && (
                        <span className="rounded-full border border-foreground/15 px-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Beta
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {acopy.tagline}
                    </p>
                  </div>
                </header>
                <p className="mt-3 line-clamp-3 text-xs text-foreground/80">
                  {acopy.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
