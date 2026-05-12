import type { Agent, AgentId } from "./types";

export const AGENTS: Agent[] = [
  {
    id: "pp",
    accent: "amber",
    icon: "Factory",
    primary: true,
    bookSlugs: [
      "production-planning-with-sap-s4hana",
      "pp-ds-with-sap-s4hana",
      "sales-and-operations-planning-with-sap-ibp",
    ],
    he: {
      name: "מומחה PP",
      tagline: "תכנון ייצור ו-MRP Live ב-S/4HANA",
      description:
        "מלווה אותך בתהליכי תכנון ייצור, MRP Live, PP-DS, תמחיר תפעולי וטרנזקציות SPRO של מודול PP. מתבסס על ספרי SAP Press לתכנון ייצור ו-IBP.",
      examples: [
        "מה ההבדל בין MRP Classic ל-MRP Live ב-S/4HANA?",
        "הסבר את תהליך Repetitive Manufacturing ב-PP-DS",
        "תרשים זרימה ל-Make-to-Order מול Make-to-Stock",
      ],
    },
    en: {
      name: "PP Module Expert",
      tagline: "Production Planning and MRP Live for S/4HANA",
      description:
        "Guides you through production planning, MRP Live, PP-DS, operational costing and SPRO configuration in the PP module. Grounded in SAP Press production planning and IBP titles.",
      examples: [
        "Difference between MRP Classic and MRP Live on S/4HANA",
        "Explain Repetitive Manufacturing in PP-DS",
        "Flowchart Make-to-Order vs Make-to-Stock",
      ],
    },
    systemPromptHint: {
      he: "אתה מומחה SAP PP - השב בעברית עסקית עם מונחים טכניים באנגלית.",
      en: "You are an SAP PP expert. Respond in concise English with precise SAP terminology.",
    },
  },
  {
    id: "abap-s4",
    accent: "sky",
    icon: "Code2",
    primary: true,
    bookSlugs: [],
    he: {
      name: "מפתח ABAP S/4",
      tagline: "Clean Core, CDS Views ו-RAP",
      description:
        "כותב ABAP מודרני ל-S/4HANA - Clean Core, CDS Views, OData V4 ו-RAP. מסייע במעבר מ-Classic ABAP ל-ABAP Cloud.",
      examples: [
        "כתוב CDS View לחישוב Open POs לפי Vendor",
        "המר Function Module ישן ל-RAP Behavior Implementation",
        "דוגמת BAdI ב-S/4HANA למקום User Exit ישן",
      ],
    },
    en: {
      name: "ABAP S/4 Developer",
      tagline: "Clean Core, CDS Views and RAP",
      description:
        "Writes modern ABAP for S/4HANA - Clean Core, CDS Views, OData V4 and RAP. Helps migrate Classic ABAP to ABAP Cloud.",
      examples: [
        "Write a CDS View for Open POs by Vendor",
        "Convert a legacy Function Module to a RAP Behavior Implementation",
        "BAdI example replacing an old User Exit",
      ],
    },
    systemPromptHint: {
      he: "אתה מפתח ABAP S/4 בכיר. דבוק ב-Clean Core; אל תציע פתרונות שמגעים ב-Standard.",
      en: "You are a senior ABAP S/4 developer. Stick to Clean Core; never propose modifications to SAP standard objects.",
    },
  },
  {
    id: "tosca",
    accent: "violet",
    icon: "TestTube2",
    primary: true,
    bookSlugs: [],
    he: {
      name: "מומחה Tosca",
      tagline: "אוטומציה ב-Tricentis Tosca",
      description:
        "כותב TestCases, Modules ו-T-Box Formulas ל-Tosca. מסביר Recovery, TDM ו-Distributed Execution.",
      examples: [
        "תן לי דוגמת T-Box ליצירת PO ב-ME21N",
        "איך מגדירים Recovery Scenario לפתיחת חלון Popup ב-SAP GUI",
        "מבנה ה-Modules לאוטומציה של Fiori App",
      ],
    },
    en: {
      name: "Tosca Automation Expert",
      tagline: "Tricentis Tosca automation specialist",
      description:
        "Writes TestCases, Modules and T-Box formulas for Tosca. Covers Recovery, TDM and Distributed Execution.",
      examples: [
        "Show a T-Box example for creating a PO via ME21N",
        "Set up a Recovery Scenario for SAP GUI popups",
        "Module structure for automating a Fiori app",
      ],
    },
    systemPromptHint: {
      he: "אתה אוטומציון Tosca. החזר דוגמאות בפורמט TBox ו-XL5 כפי שמופיע במסמכים הרשמיים של Tricentis.",
      en: "You are a Tosca automation engineer. Return TBox / XL5 examples that match Tricentis official syntax.",
    },
  },
  {
    id: "architect",
    accent: "emerald",
    icon: "Compass",
    primary: true,
    bookSlugs: [
      "sap-fiori-apps-for-sap-s4hana-the-quick-reference-guide",
      "sales-and-operations-planning-with-sap-ibp",
    ],
    he: {
      name: "אפיון פתרונות",
      tagline: "מסמכי FS ו-Fit-Gap ל-S/4HANA",
      description:
        "מסייע באפיון תהליכים עסקיים ב-S/4HANA, Fit-Gap, FS מקצועיים וסקירת אפליקציות Fiori. מתורגם מספרי הליבה של SAP Press.",
      examples: [
        "כתוב טיוטת FS לתהליך Returns Management",
        "מה ההבדל בין Fiori Elements ל-Freestyle UI5?",
        "תרשים Fit-Gap ל-Procurement במעבר מ-ECC ל-S/4HANA",
      ],
    },
    en: {
      name: "Solution Architect",
      tagline: "Functional Specs and Fit-Gap for S/4HANA",
      description:
        "Helps with business process design on S/4HANA, Fit-Gap analysis, professional FS docs and Fiori app discovery. Grounded in SAP Press core titles.",
      examples: [
        "Draft an FS for Returns Management",
        "Difference between Fiori Elements and Freestyle UI5",
        "Fit-Gap chart for Procurement when moving from ECC to S/4HANA",
      ],
    },
    systemPromptHint: {
      he: "אתה ארכיטקט פתרונות SAP. כתוב מסמכי FS מסודרים, ציין הנחות, סיכונים ותלויות.",
      en: "You are an SAP solution architect. Produce structured FS docs, call out assumptions, risks and dependencies.",
    },
  },
  {
    id: "pm",
    accent: "rose",
    icon: "Wrench",
    primary: false,
    bookSlugs: [
      "plant-maintenance-with-sap-s4hana-business-user-guide",
      "configuring-plant-maintenance-in-sap-s4hana",
    ],
    he: {
      name: "מומחה PM",
      tagline: "תחזוקה מונעת ופקודות עבודה",
      description:
        "תחזוקה מונעת, פקודות עבודה, נקודות מדידה, ציוד והודעות תחזוקה ב-S/4HANA Asset Management.",
      examples: [
        "מבנה ה-Maintenance Order ב-S/4HANA",
        "הסבר Strategy-Based Preventive Maintenance",
        "אילו Fiori Apps רלוונטיות לטכנאי שטח?",
      ],
    },
    en: {
      name: "PM Module Expert",
      tagline: "Asset management and work orders",
      description:
        "Preventive maintenance, work orders, measuring points, equipment and notifications across S/4HANA Asset Management.",
      examples: [
        "Maintenance Order structure in S/4HANA",
        "Strategy-Based Preventive Maintenance",
        "Fiori apps for field technicians",
      ],
    },
    systemPromptHint: {
      he: "אתה מומחה SAP PM. השב עם מבנים ברורים של Order Types, Notifications ו-Maintenance Strategies.",
      en: "You are an SAP PM expert. Use clear references to Order Types, Notifications and Maintenance Strategies.",
    },
  },
  {
    id: "qm",
    accent: "cyan",
    icon: "ShieldCheck",
    primary: false,
    bookSlugs: ["quality-management-with-sap-s4hana"],
    he: {
      name: "מומחה QM",
      tagline: "בדיקות איכות ו-QIE",
      description:
        "אפיוני Inspection Plans, Inspection Lots, QM Engineering ו-Quality Certificates ב-S/4HANA.",
      examples: [
        "תהליך In-Process Inspection במהלך ייצור",
        "הגדרת Inspection Type לקבלת חומר ממוכר",
        "תעודות איכות אוטומטיות מול לקוח",
      ],
    },
    en: {
      name: "QM Module Expert",
      tagline: "Inspection plans and quality certificates",
      description:
        "Inspection plans, lots, QIE and quality certificates on S/4HANA Quality Management.",
      examples: [
        "In-Process Inspection during production",
        "Inspection Type for goods receipt from vendor",
        "Automated quality certificates to customers",
      ],
    },
    systemPromptHint: {
      he: "אתה מומחה SAP QM. הסבר מהלכי בדיקה בפועל וסעיפים ב-SPRO הרלוונטיים.",
      en: "You are an SAP QM expert. Explain actual inspection flows and the matching SPRO nodes.",
    },
  },
  {
    id: "wm",
    accent: "indigo",
    icon: "Boxes",
    primary: false,
    bookSlugs: ["integrating-warehouse-management-in-sap-s4hana"],
    he: {
      name: "מומחה WM/EWM",
      tagline: "ניהול מחסן ושילוב EWM",
      description:
        "ניהול מחסן ב-S/4HANA - Decentralized EWM, אסטרטגיות Putaway/Picking, RF Transactions ו-Stock Removal.",
      examples: [
        "אסטרטגיות Putaway ב-EWM",
        "הקמת Storage Type חדש ב-EWM",
        "אינטגרציה בין IM ל-EWM ב-S/4HANA",
      ],
    },
    en: {
      name: "WM / EWM Expert",
      tagline: "Warehouse management and EWM integration",
      description:
        "Warehouse management on S/4HANA - Decentralized EWM, putaway/picking strategies, RF transactions and stock removal.",
      examples: [
        "Putaway strategies in EWM",
        "Configure a new Storage Type in EWM",
        "IM to EWM integration on S/4HANA",
      ],
    },
    systemPromptHint: {
      he: "אתה מומחה SAP WM/EWM. ציין אסטרטגיות תהליך והעדפות RF/Pallet.",
      en: "You are an SAP WM/EWM expert. Call out the relevant strategies and RF/pallet preferences.",
    },
  },
  {
    id: "mm",
    accent: "orange",
    icon: "ShoppingCart",
    primary: false,
    bookSlugs: ["sourcing-and-procurement-with-sap-s4hana"],
    he: {
      name: "מומחה MM",
      tagline: "Sourcing & Procurement",
      description:
        "Sourcing, Purchase Requisitions, Purchase Orders, Outline Agreements ו-Invoice Verification ב-S/4HANA.",
      examples: [
        "תהליך Source Determination ב-S/4HANA",
        "מתי משתמשים ב-Contract מול Scheduling Agreement?",
        "אפיון Approval Workflow ל-PO",
      ],
    },
    en: {
      name: "MM Module Expert",
      tagline: "Sourcing and Procurement",
      description:
        "Sourcing, PRs, POs, outline agreements and invoice verification on S/4HANA Sourcing and Procurement.",
      examples: [
        "Source Determination in S/4HANA",
        "Contract vs Scheduling Agreement",
        "Designing a PO approval workflow",
      ],
    },
    systemPromptHint: {
      he: "אתה מומחה SAP MM. ציין טרנזקציות עיקריות (ME21N, ME51N, MIRO וכו') והסעיפים ב-SPRO.",
      en: "You are an SAP MM expert. Reference the main tcodes (ME21N, ME51N, MIRO, ...) and the matching SPRO nodes.",
    },
  },
];

export const AGENT_MAP: Record<AgentId, Agent> = AGENTS.reduce(
  (acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  },
  {} as Record<AgentId, Agent>,
);

export function getAgent(id: AgentId): Agent {
  return AGENT_MAP[id];
}

export const DEFAULT_AGENT_ID: AgentId = "pp";

export const PRIMARY_AGENTS = AGENTS.filter((a) => a.primary);
export const SECONDARY_AGENTS = AGENTS.filter((a) => !a.primary);
