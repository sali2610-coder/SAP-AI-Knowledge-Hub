"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Factory,
  TestTube2,
  ShieldCheck,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useHubStore } from "@/lib/store";
import type { AgentId } from "@/lib/types";

const COPY = {
  he: {
    eyebrow: "שלושה סוכנים מרכזיים",
    title: "כל סוכן מומחה בתחומו - וכולם חולקים את אותו ה-Knowledge Base.",
    sub: "מוגדרים ב-AGENTS.md, מחויבים לחוקי CLAUDE.md, ומאמתים נתונים טכניים דרך sap-odata-explorer.",
    open: "פתח שיחה עם הסוכן",
  },
  en: {
    eyebrow: "Three principal agents",
    title: "Each persona specializes - all share the same knowledge base.",
    sub: "Defined in AGENTS.md, bound by CLAUDE.md project rules, technical data verified through sap-odata-explorer.",
    open: "Open conversation",
  },
} as const;

interface Persona {
  id: string;
  agentId: AgentId;
  icon: LucideIcon;
  accent: string;
  shadowColor: string;
  he: {
    name: string;
    scope: string;
    bullets: string[];
  };
  en: {
    name: string;
    scope: string;
    bullets: string[];
  };
}

const PERSONAS: Persona[] = [
  {
    id: "functional-expert",
    agentId: "pp",
    icon: Factory,
    accent: "from-[#0070f2] to-[#5baef7]",
    shadowColor: "rgba(0,112,242,0.45)",
    he: {
      name: "SAP Functional Expert",
      scope: "PP, PM, QM, CS",
      bullets: [
        "מבוסס על ספריית SAP Press המאונדקסת",
        "מצטט עמוד + פסקה בכל תשובה",
        "מבחין אוטומטית בין ECC ל-S/4HANA",
      ],
    },
    en: {
      name: "SAP Functional Expert",
      scope: "PP, PM, QM, CS",
      bullets: [
        "Grounded in the indexed SAP Press library",
        "Cites page + paragraph on every answer",
        "Auto-distinguishes ECC from S/4HANA",
      ],
    },
  },
  {
    id: "tosca-mastery",
    agentId: "tosca",
    icon: TestTube2,
    accent: "from-[#7c3aed] to-[#a855f7]",
    shadowColor: "rgba(124,58,237,0.45)",
    he: {
      name: "Tosca Mastery",
      scope: "אוטומציה ל-SAP",
      bullets: [
        "בניית TestCases ו-XL5 Modules",
        "T-Box Expressions ו-Buffering",
        "פענוח לוגי ריצה של Tosca",
      ],
    },
    en: {
      name: "Tosca Mastery",
      scope: "SAP test automation",
      bullets: [
        "Authors TestCases + XL5 modules",
        "T-Box expressions and buffering",
        "Decodes Tosca runtime logs",
      ],
    },
  },
  {
    id: "clean-core",
    agentId: "architect",
    icon: ShieldCheck,
    accent: "from-[#fa8b46] to-[#fbbf24]",
    shadowColor: "rgba(250,139,70,0.45)",
    he: {
      name: "Clean Core & Architecture",
      scope: "Z מול Standard ב-S/4HANA",
      bullets: [
        "Released APIs ו-Key User Extensibility",
        "מאמת זמינות בזמן אמת דרך OData",
        "ממיר User Exits ישנים ל-Clean Core",
      ],
    },
    en: {
      name: "Clean Core & Architecture",
      scope: "Z vs Standard on S/4HANA",
      bullets: [
        "Released APIs + Key User extensibility",
        "Live OData availability checks",
        "Migrates legacy User Exits to Clean Core",
      ],
    },
  },
];

export function PersonaGrid() {
  const language = useHubStore((s) => s.language);
  const setAgent = useHubStore((s) => s.setActiveAgent);
  const t = COPY[language];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-10 max-w-2xl"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-primary">
          {t.eyebrow}
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PERSONAS.map((p, i) => {
          const copy = language === "he" ? p.he : p.en;
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/chat"
                onClick={() => setAgent(p.agentId)}
                className="group glass-panel elev-2 hover:elev-3 relative flex h-full flex-col gap-4 rounded-3xl p-6 transition"
                style={{
                  boxShadow: `0 18px 60px -28px ${p.shadowColor}`,
                }}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${p.accent} opacity-70`}
                />

                <header className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.accent} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground/80">
                    {copy.scope}
                  </span>
                </header>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{copy.name}</h3>
                </div>

                <ul className="flex flex-col gap-1.5 text-sm text-foreground/90">
                  {copy.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  {t.open}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
