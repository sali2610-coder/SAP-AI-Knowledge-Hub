import type { AgentId, Citation, Language } from "./types";
import { getAgent } from "./agents";
import { kbIndex } from "./kb";
import { retrieve, isGrounded, formatCitation } from "./rag";

interface MockInput {
  prompt: string;
  agentId: AgentId;
  language: Language;
}

interface MockOutput {
  text: string;
  citations: Citation[];
}

function pickBooks(agentId: AgentId): { slug: string; title: string }[] {
  const agent = getAgent(agentId);
  const explicit = kbIndex.books.filter((b) => agent.bookSlugs.includes(b.slug));
  const byTag = kbIndex.books.filter((b) => b.agents.includes(agentId));
  const merged = [...explicit, ...byTag.filter((b) => !explicit.includes(b))];
  return merged.slice(0, 2).map((b) => ({ slug: b.slug, title: b.title }));
}

function pickTerms(agentId: AgentId, n = 6): string[] {
  const books = kbIndex.books.filter((b) => b.agents.includes(agentId));
  const bag = new Set<string>();
  for (const b of books) {
    for (const t of b.tcodes) bag.add(t);
    for (const t of b.terms.slice(0, 8)) bag.add(t);
    if (bag.size >= n * 2) break;
  }
  return [...bag].slice(0, n);
}

function ppAnswer(prompt: string, language: Language): string {
  if (language === "he") {
    return [
      `**MRP Live ב-S/4HANA** רץ ישירות מול ה-HANA Calculation Engine באמצעות הטרנזקציה \`MD01N\`, ובניגוד ל-MRP Classic לא מבצע פריסת חומרים ברמה של MARDH אלא חישוב on-the-fly.`,
      "",
      "### זרימה כללית",
      "",
      "```mermaid",
      "flowchart LR",
      "    A[\"דרישה שיווקית\"] --> B[\"Sales Order or Forecast\"]",
      "    B --> C[\"MD01N - MRP Live\"]",
      "    C --> D{\"מקור כיסוי\"}",
      "    D -->|ייצור| E[\"Planned Order\"]",
      "    D -->|רכש| F[\"Purchase Requisition\"]",
      "    E --> G[\"MD04 - Stock Requirements\"]",
      "    F --> G",
      "```",
      "",
      "### דוגמת ABAP - שליפת Planned Orders של חומר",
      "",
      "```abap",
      "SELECT planned_order, material, plant, quantity",
      "  FROM I_PlannedOrder",
      "  WHERE material = @lv_matnr",
      "    AND plant    = @lv_werks",
      "  INTO TABLE @DATA(lt_orders).",
      "```",
      "",
      `הערה: עבור מעבר מ-Classic ל-MRP Live כדאי לבדוק את ה-Customizing ב-SPRO תחת Production -> MRP -> MRP Live וב-Activate Materials.`,
    ].join("\n");
  }
  return [
    `**MRP Live in S/4HANA** runs directly on the HANA calculation engine via \`MD01N\`. Unlike classic MRP it does not persist results in MARDH and computes coverage on the fly.`,
    "",
    "### High-level flow",
    "",
    "```mermaid",
    "flowchart LR",
    "    A[\"Demand\"] --> B[\"Sales Order or Forecast\"]",
    "    B --> C[\"MD01N - MRP Live\"]",
    "    C --> D{\"Coverage source\"}",
    "    D -->|Make| E[\"Planned Order\"]",
    "    D -->|Buy| F[\"Purchase Req\"]",
    "    E --> G[\"MD04 - Stock Reqs\"]",
    "    F --> G",
    "```",
    "",
    "### ABAP sample - read Planned Orders for a material",
    "",
    "```abap",
    "SELECT planned_order, material, plant, quantity",
    "  FROM I_PlannedOrder",
    "  WHERE material = @lv_matnr",
    "    AND plant    = @lv_werks",
    "  INTO TABLE @DATA(lt_orders).",
    "```",
    "",
    "Reference: SPRO -> Production -> MRP -> MRP Live -> Activate Materials.",
  ].join("\n");
}

function toscaAnswer(prompt: string, language: Language): string {
  if (language === "he") {
    return [
      "**Tosca T-Box** למילוי שדות ב-SAP GUI נכתב לרוב באמצעות XL5 modules + Engine Mode.",
      "",
      "```tosca",
      "// TestCase: Create Purchase Order in ME21N",
      'TBox: "Login - SAP GUI" {Input}',
      "  Client    Input  100",
      "  User      Input  {USERNAME}",
      "  Password  Input  {PASSWORD}",
      "",
      'TBox: "ME21N - Header" {Input}',
      "  Vendor      Input  {VENDOR}",
      "  PurchOrg    Input  1000",
      "  PurchGroup  Input  001",
      "",
      'TBox: "ME21N - Item" {Input}',
      "  Material  Input   {MATERIAL}",
      "  Qty       Input   {QTY}",
      "  Plant     Input   1000",
      "",
      'TBox: "Verify PO Number" {Verify}',
      "  StatusBar  Verify  contains:Standard PO created",
      "```",
      "",
      "ב-Recovery Scenario כדאי להוסיף קלאסי `Close Popup` כדי לטפל בחלון Information שצף בסיום.",
    ].join("\n");
  }
  return [
    "**Tosca T-Box** for SAP GUI input is usually written with XL5 modules and explicit Engine ActionMode tokens.",
    "",
    "```tosca",
    "// TestCase: Create Purchase Order in ME21N",
    'TBox: "Login - SAP GUI" {Input}',
    "  Client    Input  100",
    "  User      Input  {USERNAME}",
    "  Password  Input  {PASSWORD}",
    "",
    'TBox: "ME21N - Header" {Input}',
    "  Vendor      Input  {VENDOR}",
    "  PurchOrg    Input  1000",
    "  PurchGroup  Input  001",
    "",
    'TBox: "ME21N - Item" {Input}',
    "  Material  Input   {MATERIAL}",
    "  Qty       Input   {QTY}",
    "  Plant     Input   1000",
    "",
    'TBox: "Verify PO Number" {Verify}',
    "  StatusBar  Verify  contains:Standard PO created",
    "```",
    "",
    "Add a `Close Popup` recovery scenario to catch the SAP information dialog at the end of save.",
  ].join("\n");
}

function abapAnswer(prompt: string, language: Language): string {
  if (language === "he") {
    return [
      "**Clean Core** ב-ABAP S/4 חוסם פיתוח ישיר על אובייקטים סטנדרטיים. במקום User Exit ישן, יש להשתמש ב-Released BAdI או ב-Custom Field via Key User.",
      "",
      "```abap",
      "CLASS zcl_extend_po DEFINITION",
      "  PUBLIC FINAL CREATE PUBLIC",
      "  FOR EVENTS OF if_purchaseorder_save.",
      "  PUBLIC SECTION.",
      "    INTERFACES if_badi_interface.",
      "    METHODS check_release_strategy",
      "      IMPORTING io_po TYPE REF TO i_purchaseorder.",
      "ENDCLASS.",
      "",
      "CLASS zcl_extend_po IMPLEMENTATION.",
      "  METHOD check_release_strategy.",
      "    DATA(lv_total) = io_po->get_total_amount( ).",
      "    IF lv_total > 100000.",
      "      RAISE EXCEPTION TYPE cx_po_release.",
      "    ENDIF.",
      "  ENDMETHOD.",
      "ENDCLASS.",
      "```",
      "",
      "כל פיתוח חדש - דרך Released APIs בלבד. אין לגעת בטבלאות סטנדרטיות.",
    ].join("\n");
  }
  return [
    "**Clean Core** in ABAP S/4 blocks direct modifications to standard objects. Replace legacy User Exits with Released BAdIs or Key User extensibility.",
    "",
    "```abap",
    "CLASS zcl_extend_po DEFINITION",
    "  PUBLIC FINAL CREATE PUBLIC",
    "  FOR EVENTS OF if_purchaseorder_save.",
    "  PUBLIC SECTION.",
    "    INTERFACES if_badi_interface.",
    "    METHODS check_release_strategy",
    "      IMPORTING io_po TYPE REF TO i_purchaseorder.",
    "ENDCLASS.",
    "",
    "CLASS zcl_extend_po IMPLEMENTATION.",
    "  METHOD check_release_strategy.",
    "    DATA(lv_total) = io_po->get_total_amount( ).",
    "    IF lv_total > 100000.",
    "      RAISE EXCEPTION TYPE cx_po_release.",
    "    ENDIF.",
    "  ENDMETHOD.",
    "ENDCLASS.",
    "```",
    "",
    "Always extend through Released APIs - do not touch standard tables.",
  ].join("\n");
}

function architectAnswer(prompt: string, language: Language): string {
  if (language === "he") {
    return [
      "**מסמך FS - Returns Management**",
      "",
      "1. רקע עסקי - הלקוח מבקש החזרה של פריט שלם או חלקי.",
      "2. תהליך AS-IS ב-ECC - VA01 עם סוג מסמך RE, החזרה לפי MIGO 651.",
      "3. תהליך TO-BE ב-S/4HANA - Advanced Returns Management עם תהליך Decision Code.",
      "",
      "```mermaid",
      "flowchart TD",
      "    A[\"Customer Request\"] --> B[\"Returns Order RE\"]",
      "    B --> C[\"Returns Delivery\"]",
      "    C --> D{\"Decision Code\"}",
      "    D -->|Refund| E[\"Credit Memo\"]",
      "    D -->|Replace| F[\"Free of Charge Delivery\"]",
      "    D -->|Scrap| G[\"Scrapping Cost Center\"]",
      "```",
      "",
      "**Open Issues / Risks**",
      "- אינטגרציה ל-FI - לוודא חשבון Clearing נכון.",
      "- מי האחראי לאישור Refund - Sales Manager או Finance?",
    ].join("\n");
  }
  return [
    "**FS - Returns Management**",
    "",
    "1. Business background - the customer requests a partial or full return.",
    "2. AS-IS in ECC - VA01 with order type RE plus MIGO 651 inbound.",
    "3. TO-BE in S/4HANA - Advanced Returns Management with a Decision Code stage.",
    "",
    "```mermaid",
    "flowchart TD",
    "    A[\"Customer Request\"] --> B[\"Returns Order RE\"]",
    "    B --> C[\"Returns Delivery\"]",
    "    C --> D{\"Decision Code\"}",
    "    D -->|Refund| E[\"Credit Memo\"]",
    "    D -->|Replace| F[\"Free of Charge Delivery\"]",
    "    D -->|Scrap| G[\"Scrapping Cost Center\"]",
    "```",
    "",
    "**Open issues / risks**",
    "- FI integration - confirm the clearing account.",
    "- Who signs off refunds - Sales Manager or Finance?",
  ].join("\n");
}

function genericAnswer(agentId: AgentId, prompt: string, language: Language): string {
  const ag = getAgent(agentId);
  const terms = pickTerms(agentId, 5);
  const copy = language === "he" ? ag.he : ag.en;
  const intro =
    language === "he"
      ? `שאלת אותי על: "${prompt.slice(0, 120)}". אני ${copy.name} - ${copy.tagline}.`
      : `You asked: "${prompt.slice(0, 120)}". I am the ${copy.name} - ${copy.tagline}.`;
  const termsLine =
    terms.length === 0
      ? ""
      : language === "he"
        ? `\n\nמושגי מפתח רלוונטיים מתוך הספרים: ${terms.join(", ")}.`
        : `\n\nKey terms surfaced from the books: ${terms.join(", ")}.`;
  return `${intro}${termsLine}`;
}

function isEccQuery(prompt: string): boolean {
  // Explicit ECC / R/3 mention, not in passing comparison.
  return /\b(ecc 6\.?0|ecc\b|r\/3|erp 6|netweaver|sap erp(?! s\/4))/i.test(prompt);
}

function eccDisclaimer(language: Language, agentName: string): string {
  if (language === "he") {
    return [
      `**הודעת מקור - ECC**`,
      "",
      `שאלת על SAP ECC, אבל ה-Knowledge Base שלנו אינדקס *רק* את ספרי ה-S/4HANA Press. אין לי מקטעי טקסט אמיתיים מ-ECC להצביע עליהם.`,
      "",
      `אני (${agentName}) יכול לתת תשובה כללית על ECC מתוך הידע של המודל, אבל אסור לי לערבב אותה עם ציטוטי S/4HANA שיש לי באינדקס. אם תרצה תשובה גנרית על ECC, ציין במפורש "ענה מידע מודל בלבד, ללא ספרים".`,
      "",
      `**נקודות מפתח לזיהוי ECC לעומת S/4:**`,
      "- ECC: טבלאות נפרדות (MARC, MARD, MBEW), MRP Classic, ABAP Classic, SAP GUI.",
      "- S/4: ACDOCA אחיד, MRP Live ב-HANA, CDS Views, Clean Core, Fiori.",
    ].join("\n");
  }
  return [
    `**Source notice - ECC**`,
    "",
    `You asked about SAP ECC, but the indexed Knowledge Base contains *only* S/4HANA Press titles. I have no real ECC passages to cite.`,
    "",
    `I (${agentName}) can offer a general ECC answer from model knowledge, but I will not mix it with the S/4HANA quotes I do have. If you want a pure model-knowledge ECC answer, say "model only, no books".`,
    "",
    `**Key markers to distinguish ECC vs S/4:**`,
    "- ECC: separate tables (MARC, MARD, MBEW), classic MRP, classic ABAP, SAP GUI.",
    "- S/4: unified ACDOCA, MRP Live on HANA, CDS Views, Clean Core, Fiori.",
  ].join("\n");
}

export function buildMockAnswer({ prompt, agentId, language }: MockInput): MockOutput {
  const lower = prompt.toLowerCase();
  const ecc = isEccQuery(prompt);
  const agentName = (language === "he" ? getAgent(agentId).he : getAgent(agentId).en).name;

  let text: string;
  if (ecc) {
    // Do NOT pivot to canned S/4 answers when the user explicitly asked about
    // ECC. The corpus is S/4-only - be honest about it.
    text = eccDisclaimer(language, agentName);
  } else if (agentId === "tosca" || /tosca|t-box|tbox/.test(lower)) {
    text = toscaAnswer(prompt, language);
  } else if (agentId === "abap-s4" || /abap|cds|clean core|badi|rap/.test(lower)) {
    text = abapAnswer(prompt, language);
  } else if (agentId === "architect" || /fs |fit[- ]?gap|returns|architect/.test(lower)) {
    text = architectAnswer(prompt, language);
  } else if (agentId === "pp" || /mrp|production|planned order|pp-?ds/.test(lower)) {
    text = ppAnswer(prompt, language);
  } else {
    text = genericAnswer(agentId, prompt, language);
  }

  // Retrieval-augmented: pull real passages from the indexed corpus.
  // Skip retrieval when the user asked about ECC since the corpus is S/4-only -
  // mixing S/4 quotes into an ECC answer is the exact failure we're guarding against.
  const hits = ecc ? [] : retrieve(prompt, 4);
  const grounded = isGrounded(hits);

  let citations: Citation[];
  if (grounded) {
    citations = hits.map(formatCitation);
    const retrievedBlock =
      language === "he"
        ? [
            "",
            "---",
            "**מקטעים שאוחזרו מהספרים (RAG):**",
            ...hits.slice(0, 3).map((h, i) => {
              const quote = h.doc.text.length > 200 ? h.doc.text.slice(0, 199) + "…" : h.doc.text;
              return `\n${i + 1}. *${h.doc.bookTitle}* - עמוד ${h.doc.page}, פסקה ${h.doc.chunkIndex + 1}\n   > ${quote}`;
            }),
          ].join("\n")
        : [
            "",
            "---",
            "**Retrieved passages (RAG):**",
            ...hits.slice(0, 3).map((h, i) => {
              const quote = h.doc.text.length > 200 ? h.doc.text.slice(0, 199) + "…" : h.doc.text;
              return `\n${i + 1}. *${h.doc.bookTitle}* - page ${h.doc.page}, paragraph ${h.doc.chunkIndex + 1}\n   > ${quote}`;
            }),
          ].join("\n");
    text = text + retrievedBlock;
  } else if (ecc) {
    // ECC path: no citations at all - we already disclosed the gap in body.
    citations = [];
  } else {
    // Fall back to default agent book mapping but mark clearly as world knowledge.
    const fallback = pickBooks(agentId);
    citations = fallback.map((b) => ({ bookSlug: b.slug, bookTitle: b.title }));
    const note =
      language === "he"
        ? "\n\n---\n_מידע זה אינו מופיע ישירות בספרות המקצועית - התשובה מבוססת על ידע מודל כללי._"
        : "\n\n---\n_This information is not directly cited in the indexed books - the answer is generated from world knowledge._";
    text = text + note;
  }

  return { text, citations };
}
