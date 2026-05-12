"use client";

import { useBackendStatus } from "@/lib/hooks/use-backend-status";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const COPY = {
  he: {
    live: "Backend חי",
    mock: "Mock",
    liveHint: "מחובר ל-SAP_AI_ENDPOINT",
    mockHint: "ה-/api/chat מחזיר תשובות דמו - הגדר SAP_AI_ENDPOINT ב-.env.local",
  },
  en: {
    live: "Live backend",
    mock: "Mock mode",
    liveHint: "Connected to SAP_AI_ENDPOINT",
    mockHint:
      "/api/chat is returning demo answers - set SAP_AI_ENDPOINT in .env.local to go live",
  },
} as const;

export function BackendBadge({ compact = false }: { compact?: boolean }) {
  const language = useHubStore((s) => s.language);
  const status = useBackendStatus();
  const t = COPY[language];

  const label = status.live ? t.live : t.mock;
  const title = status.live ? t.liveHint : t.mockHint;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]",
        status.live
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-400/30 bg-amber-500/10 text-amber-300",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status.live ? "bg-emerald-400" : "bg-amber-400",
        )}
      />
      {!compact && label}
    </span>
  );
}
