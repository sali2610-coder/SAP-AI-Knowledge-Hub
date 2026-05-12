"use client";

import { useState } from "react";
import {
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { Agent, Language } from "@/lib/types";

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

const ACCENT_TEXT: Record<string, string> = {
  amber: "text-amber-300",
  sky: "text-sky-300",
  violet: "text-violet-300",
  emerald: "text-emerald-300",
  rose: "text-rose-300",
  cyan: "text-cyan-300",
  indigo: "text-indigo-300",
  orange: "text-orange-300",
};

const ACCENT_GLOW: Record<string, string> = {
  amber: "rgba(251,191,36,0.35)",
  sky: "rgba(56,189,248,0.35)",
  violet: "rgba(167,139,250,0.35)",
  emerald: "rgba(52,211,153,0.35)",
  rose: "rgba(251,113,133,0.35)",
  cyan: "rgba(34,211,238,0.35)",
  indigo: "rgba(129,140,248,0.35)",
  orange: "rgba(251,146,60,0.35)",
};

export function AgentCard({
  agent,
  language,
  onClick,
  selected,
  compact,
}: {
  agent: Agent;
  language: Language;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}) {
  const copy = language === "he" ? agent.he : agent.en;
  const Icon = ICON_MAP[agent.icon] ?? Compass;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const glow = ACCENT_GLOW[agent.accent] ?? "rgba(255,255,255,0.25)";

  return (
    <HoverCard>
      <HoverCardTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            onClick={onClick}
            onMouseMove={(e) => {
              const t = e.currentTarget.getBoundingClientRect();
              setPos({ x: e.clientX - t.left, y: e.clientY - t.top });
            }}
            onMouseLeave={() => setPos(null)}
            className={cn(
              "group relative w-full overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 p-5 text-start backdrop-blur transition",
              "hover:-translate-y-0.5 hover:border-foreground/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected && "border-foreground/40 ring-1 ring-foreground/40",
              compact && "p-4",
            )}
          >
            {pos && (
              <span
                aria-hidden
                className="pointer-events-none absolute h-44 w-44 rounded-full blur-2xl"
                style={{
                  left: pos.x - 88,
                  top: pos.y - 88,
                  background: `radial-gradient(closest-side, ${glow} 0%, transparent 70%)`,
                }}
              />
            )}

            <div className="relative flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5",
                  ACCENT_TEXT[agent.accent],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{copy.name}</h3>
                  {!agent.primary && (
                    <span className="rounded-full border border-foreground/15 px-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Beta
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{copy.tagline}</p>
              </div>
            </div>

            {!compact && (
              <p className="relative mt-3 line-clamp-3 text-sm text-muted-foreground/90">
                {copy.description}
              </p>
            )}
          </button>
        )}
      />
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">{copy.name}</p>
            <p className="text-xs text-muted-foreground">{copy.description}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
              {language === "he" ? "דוגמאות לשאלות" : "Sample prompts"}
            </p>
            <ul className="mt-1 space-y-1">
              {copy.examples.map((ex) => (
                <li key={ex} className="text-xs text-foreground/90">
                  - {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

