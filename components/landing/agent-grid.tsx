"use client";

import Link from "next/link";
import { PRIMARY_AGENTS, SECONDARY_AGENTS } from "@/lib/agents";
import { useHubStore } from "@/lib/store";
import { AgentCard } from "./agent-card";

const COPY = {
  he: {
    title: "ארבעה מומחים, שפה אחת.",
    sub: "כל סוכן מקבל הקשר עסקי שונה ומשנה את אסטרטגיית התשובה. בחר סוכן כדי להתחיל שיחה ממוקדת.",
    moreTitle: "מומחים נוספים לפי מודול",
  },
  en: {
    title: "Four specialists, one language.",
    sub: "Each agent gets its own business context and answer strategy. Pick one to start a focused conversation.",
    moreTitle: "More module specialists",
  },
} as const;

export function AgentGrid() {
  const language = useHubStore((s) => s.language);
  const setAgent = useHubStore((s) => s.setActiveAgent);
  const t = COPY[language];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRIMARY_AGENTS.map((agent) => (
          <Link
            key={agent.id}
            href="/chat"
            onClick={() => setAgent(agent.id)}
            className="contents"
          >
            <AgentCard agent={agent} language={language} />
          </Link>
        ))}
      </div>

      <h3 className="mt-12 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {t.moreTitle}
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SECONDARY_AGENTS.map((agent) => (
          <Link
            key={agent.id}
            href="/chat"
            onClick={() => setAgent(agent.id)}
            className="contents"
          >
            <AgentCard agent={agent} language={language} compact />
          </Link>
        ))}
      </div>
    </section>
  );
}
