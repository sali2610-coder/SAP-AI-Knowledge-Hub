import type { AgentId, Citation, Language } from "./types";
import { getAgent } from "./agents";
import { getBook } from "./kb";
import { retrieve, isGrounded, formatCitation } from "./rag";

interface ExplainInput {
  text: string;
  bookSlug?: string;
  paragraphId?: string;
  chapterTitle?: string;
  agentId: AgentId;
  language: Language;
}

interface ExplainOutput {
  text: string;
  citations: Citation[];
  source: "book" | "agent";
}

// ECC -> S/4HANA evolution table. Matches when paragraph text mentions
// an ECC artifact - we surface the S/4 successor and the implementer impact.
export interface EccS4Pair {
  ecc: string;
  s4: string;
  impactHe: string;
  impactEn: string;
}

export const ECC_TO_S4: EccS4Pair[] = [
  {
    ecc: "MBEW",
    s4: "ACDOCA + MATDOC",
    impactHe:
      "ערכי חומר עברו ל-`ACDOCA` (Universal Journal). מסמכי מלאי מאוחדים תחת `MATDOC` - אין יותר טבלת mirror נפרדת.",
    impactEn:
      "Material valuation moved to `ACDOCA` (Universal Journal). Material documents unified under `MATDOC` - no separate mirror table.",
  },
  {
    ecc: "MARD",
    s4: "Stock derived from MATDOC",
    impactHe:
      "סטוק חי בכמות נגזר מ-`MATDOC` ב-S/4HANA. `MARD` נשאר כ-compatibility view בלבד - אל תקרא אותו בפיתוחים חדשים.",
    impactEn:
      "Live quantity stock derived from `MATDOC` on S/4HANA. `MARD` remains as a compatibility view only - do not read it in new developments.",
  },
  {
    ecc: "MSEG",
    s4: "MATDOC unified",
    impactHe:
      "פריטי מסמכי מלאי מאוחדים תחת `MATDOC` ב-S/4HANA. עדיין נחשף כ-compatibility view, אך הקריאה הפרודוקטיבית מתבצעת מ-`MATDOC`.",
    impactEn:
      "Material document items unified under `MATDOC` on S/4HANA. Still exposed as compatibility view, but production reads target `MATDOC`.",
  },
  {
    ecc: "BSEG",
    s4: "ACDOCA",
    impactHe:
      "פוסטינגים פיננסיים מאוחדים ב-`ACDOCA` (Universal Journal) - חוצה FI/CO/AA/ML/PA. `BSEG` נשמר ל-compat.",
    impactEn:
      "Financial postings unified in `ACDOCA` (Universal Journal) - cross FI/CO/AA/ML/PA. `BSEG` kept for compatibility.",
  },
  {
    ecc: "KO88",
    s4: "Simplified settlement",
    impactHe:
      "Settlement של פקעי תחזוקה והזמנות פנימיות פשוט יותר ב-S/4HANA דרך `ACDOCA` - פחות טבלאות שונות לנקות.",
    impactEn:
      "Settlement of maintenance orders and internal orders is simpler on S/4HANA via `ACDOCA` - fewer scattered tables to reconcile.",
  },
  {
    ecc: "MD01",
    s4: "MRP Live (MD01N)",
    impactHe:
      "`MD01N` רץ ישר על HANA, מתעלם מ-`MDVL` הישן וכותב ל-`PPH_*`. שדרוג מהותי בזמני ריצה לפלנינג גדול.",
    impactEn:
      "`MD01N` runs natively on HANA, ignores legacy `MDVL` and writes to `PPH_*`. Major runtime upgrade for large planning runs.",
  },
  {
    ecc: "ANEK",
    s4: "ACDOCA (Asset)",
    impactHe:
      "פוסטינגים של רכוש קבוע מאוחדים ב-`ACDOCA`. Asset Accounting `new` הוא ברירת המחדל ב-S/4.",
    impactEn:
      "Asset accounting postings unified in `ACDOCA`. Asset Accounting `new` is the S/4 default.",
  },
];

// Per-agent core tcodes - keep in sync with AGENTS.md persona blocks.
export const T_CODE_HINTS: Record<AgentId, string[]> = {
  pp: ["MD04", "MD01N", "MD02", "CO01", "COR1", "CS01", "CA01", "CR01"],
  pm: ["IW21", "IW28", "IW31", "IW32", "IW33", "IW41", "IL01", "IE01", "IP10"],
  qm: ["QP01", "QA01", "QA32", "QE51N", "QM01", "QC51N", "QA11"],
  mm: ["ME21N", "ME51N", "ME53N", "MIGO", "MIRO", "MB51", "ME2L", "MB5B"],
  wm: ["/SCWM/MON", "/SCWM/PRDI", "/SCWM/PRDO", "/SCWM/RFUI", "LT01", "LT03"],
  "abap-s4": ["SE80", "ADT", "SE16N", "SAT", "ST22", "SLG1"],
  tosca: [],
  architect: ["SPRO", "/UI2/FLPD_CUST", "/UI2/FLP", "SICF"],
};

function extractEccHits(text: string): EccS4Pair[] {
  const lower = text.toUpperCase();
  return ECC_TO_S4.filter((p) => {
    const re = new RegExp(`\\b${p.ecc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    return re.test(lower);
  }).slice(0, 2);
}

function extractTcodes(s: string): string[] {
  const out = new Set<string>();
  for (const m of s.matchAll(/\b([A-Z]{2,4}[0-9]{1,3}[A-Z]?)\b/g)) {
    if (m[1].length <= 6) out.add(m[1]);
  }
  return [...out].slice(0, 6);
}

function shortQuote(s: string, max = 280): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

function code(arr: string[]): string {
  return arr.map((x) => "`" + x + "`").join(", ");
}

export function buildExplain({
  text,
  bookSlug,
  paragraphId,
  chapterTitle,
  agentId,
  language,
}: ExplainInput): ExplainOutput {
  const book = bookSlug ? getBook(bookSlug) : undefined;
  const agent = getAgent(agentId);
  const copy = language === "he" ? agent.he : agent.en;
  const personaHint = language === "he" ? agent.systemPromptHint.he : agent.systemPromptHint.en;
  const quote = shortQuote(text);
  const source: "book" | "agent" = book ? "book" : "agent";

  const eccHits = extractEccHits(text);
  const tcodesInText = extractTcodes(text);
  const personaTcodes = T_CODE_HINTS[agentId] ?? [];
  const checklistTcodes = [
    ...new Set([...tcodesInText.filter((t) => personaTcodes.includes(t)), ...personaTcodes.slice(0, 4)]),
  ].slice(0, 5);

  const lines: string[] = [];
  if (language === "he") {
    lines.push(`_${personaHint}_`);
    lines.push("");
    lines.push("**מה זה אומר על הקרקע**");
    lines.push("");
    lines.push(
      `הקטע מתוך **${book?.title ?? "ידע פנימי"}**${
        chapterTitle ? ` (פרק "${chapterTitle}")` : ""
      } מתאר נקודת פעולה ב-${book?.module ?? "SAP S/4HANA"}. כיועץ ${copy.name} - הנה איך לתרגם זאת ליום עבודה.`,
    );
    lines.push("");
    lines.push("> " + quote);
    lines.push("");

    if (eccHits.length) {
      lines.push("**המעבר ECC -> S/4HANA**");
      lines.push("");
      for (const h of eccHits) {
        lines.push(`- ECC: \`${h.ecc}\`  →  S/4HANA: \`${h.s4}\``);
        lines.push(`  ${h.impactHe}`);
      }
      lines.push("");
    }

    if (checklistTcodes.length) {
      lines.push("**Checklist מיידי למיישם**");
      lines.push("");
      lines.push(`1. הרץ ${code(checklistTcodes.slice(0, 3))} כדי לראות תמונת מצב נוכחית.`);
      lines.push("2. בדוק SPRO תחת הסעיף הרלוונטי למודול לפני שינוי קונפיגורציה.");
      lines.push("3. אמת נתוני אב (Material/Equipment/Vendor) לפני שמדווחים על תקלה.");
      lines.push("");
    }

    lines.push("**השלכות חוצות מודולים**");
    lines.push("");
    lines.push(
      "פעולה במודול אחד כמעט תמיד נוגעת ב-FI/CO. בדוק האם הצעד הזה יוצר פוסטינג ב-`ACDOCA`, מפחית `RESB`, או משפיע על Availability Control (`AVAC`) של WBS/תקציב.",
    );
    lines.push("");

    lines.push(
      source === "book"
        ? `**מקור**: ${book?.title}${chapterTitle ? `, פרק "${chapterTitle}"` : ""}.`
        : `**מקור**: הופק על ידי הסוכן **${copy.name}** מתוך ידע מודל - אמת מול SAP Help Portal לפני יישום.`,
    );
  } else {
    lines.push(`_${personaHint}_`);
    lines.push("");
    lines.push("**What this means on the floor**");
    lines.push("");
    lines.push(
      `The passage from **${book?.title ?? "internal knowledge"}**${
        chapterTitle ? ` (chapter "${chapterTitle}")` : ""
      } describes an actionable point in ${book?.module ?? "SAP S/4HANA"}. As a ${copy.name} - here is how to translate it into day-to-day implementer work.`,
    );
    lines.push("");
    lines.push("> " + quote);
    lines.push("");

    if (eccHits.length) {
      lines.push("**ECC -> S/4HANA evolution**");
      lines.push("");
      for (const h of eccHits) {
        lines.push(`- ECC: \`${h.ecc}\`  →  S/4HANA: \`${h.s4}\``);
        lines.push(`  ${h.impactEn}`);
      }
      lines.push("");
    }

    if (checklistTcodes.length) {
      lines.push("**Implementer Checklist**");
      lines.push("");
      lines.push(`1. Run ${code(checklistTcodes.slice(0, 3))} to get a current snapshot.`);
      lines.push("2. Inspect the matching SPRO node before touching configuration.");
      lines.push("3. Validate master data (Material / Equipment / Vendor) before reporting a defect.");
      lines.push("");
    }

    lines.push("**Cross-module impact**");
    lines.push("");
    lines.push(
      "Any action in one module almost always touches FI/CO. Verify whether this step posts to `ACDOCA`, consumes `RESB`, or hits WBS budget Availability Control (`AVAC`).",
    );
    lines.push("");

    lines.push(
      source === "book"
        ? `**Source**: ${book?.title}${chapterTitle ? `, chapter "${chapterTitle}"` : ""}.`
        : `**Source**: Generated by the **${copy.name}** agent from model knowledge - validate against SAP Help Portal before implementing.`,
    );
  }

  const body = lines.join("\n");

  let citations: Citation[] = book
    ? [
        {
          bookSlug: book.slug,
          bookTitle: book.title,
          chapter: chapterTitle,
          paragraphId,
        },
      ]
    : [];

  const hits = retrieve(text, 3);
  if (isGrounded(hits)) {
    const extras = hits
      .map(formatCitation)
      .filter(
        (c) =>
          !citations.some(
            (existing) =>
              existing.bookSlug === c.bookSlug && existing.chapter === c.chapter,
          ),
      );
    citations = [...citations, ...extras].slice(0, 4);
  }

  return { text: body, citations, source };
}
