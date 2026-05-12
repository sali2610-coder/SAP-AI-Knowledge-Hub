// Internal Tosca + SAP knowledge base. Hand-curated facts (no source PDF in
// the corpus), used by the /tosca FX Builder route. Every entry carries an
// explicit `source` label so the UI can show "Tosca KB - Internal" as the
// authoritative reference rather than masquerading as a SAP Press citation.

export type ToscaCategory =
  | "scan"
  | "module"
  | "formula"
  | "engine"
  | "recovery"
  | "runtime";

export interface ToscaEntry {
  id: string;
  category: ToscaCategory;
  accent: string;
  icon: string;
  he: { title: string; tagline: string; body: string; example: string };
  en: { title: string; tagline: string; body: string; example: string };
  source: string;
}

export const TOSCA_KB: ToscaEntry[] = [
  {
    id: "sap-scan",
    category: "scan",
    accent: "violet",
    icon: "Crosshair",
    source: "Tricentis - SAP Engine for Tosca (internal KB)",
    he: {
      title: "סריקה ב-SAP GUI",
      tagline: "Object Identification עם SAP Engine",
      body: "סריקה של מסך SAP GUI ב-Tosca משתמשת ב-Scripting Engine של SAP (sapgui/user_scripting=TRUE). כל אלמנט נקלט עם BusinessName, FullName ו-Id. ה-FullName יציב, אבל לעיתים יש להעדיף Anchors יחסיים כדי לעמוד בשינויי תפריט.",
      example:
        "Module: TBox Scan SAP GUI\nAnchor: GuiMainWindow\nControl: GuiTextField Vendor Number\n  Identification: FullName ENDSWITH wnd[0]/usr/ctxtRM06E-LIFNR",
    },
    en: {
      title: "Scan SAP GUI",
      tagline: "Object identification via SAP Engine",
      body: "Tosca's SAP GUI scan uses the SAP scripting engine (sapgui/user_scripting=TRUE). Each control is captured with BusinessName, FullName and Id. FullName is stable but relative anchors help against menu shifts.",
      example:
        "Module: TBox Scan SAP GUI\nAnchor: GuiMainWindow\nControl: GuiTextField Vendor Number\n  Identification: FullName ENDSWITH wnd[0]/usr/ctxtRM06E-LIFNR",
    },
  },
  {
    id: "module-xl5",
    category: "module",
    accent: "indigo",
    icon: "Boxes",
    source: "Tricentis - XL5 Module Reference",
    he: {
      title: "XL5 Modules",
      tagline: "מבנה Modules לאוטומציה של SAP",
      body: "XL5 הוא הפורמט המודולרי החדש של Tosca. כל מסך מומפה ל-Module אחד שכולל אובייקטים, סוגי Engine ו-DataType. שימוש חוזר ב-Modules הוא הבסיס לתחזוקה ארוכת טווח.",
      example:
        "Module: ME21N - Create PO\n  Header: Vendor (Input), PurchOrg (Input)\n  Item:   Material (Input), Qty (Input), Plant (Input)\n  Verify: StatusBar contains 'created'",
    },
    en: {
      title: "XL5 Modules",
      tagline: "Modular structure for SAP automation",
      body: "XL5 is Tosca's newer modular format. Each screen maps to a single Module that includes controls, engine types and DataTypes. Module reuse is the foundation for long-term maintenance.",
      example:
        "Module: ME21N - Create PO\n  Header: Vendor (Input), PurchOrg (Input)\n  Item:   Material (Input), Qty (Input), Plant (Input)\n  Verify: StatusBar contains 'created'",
    },
  },
  {
    id: "tbox-formula",
    category: "formula",
    accent: "amber",
    icon: "FunctionSquare",
    source: "Tricentis - T-Box Expression Reference",
    he: {
      title: "T-Box Expressions",
      tagline: "נוסחאות וביטויים דינמיים",
      body: "T-Box תומך בביטויים דינמיים בצורת {EXP[...]}. שימושים נפוצים: תאריך שוטף, חישובי מטבע, יצירת מספרי PO ייחודיים, ושליפת ערכים מ-Buffer.",
      example:
        "// Today plus 7 days\n{EXP[DATE(today, +7d, dd.MM.yyyy)]}\n\n// Unique PO number\nPO_{EXP[NEW_RANDOM(6, numeric)]}\n\n// Read buffer\n{B[PO_NUMBER]}",
    },
    en: {
      title: "T-Box expressions",
      tagline: "Dynamic formulas and expressions",
      body: "T-Box supports dynamic expressions in the {EXP[...]} form. Common uses: today's date, currency math, unique PO numbers, and reading values from a buffer.",
      example:
        "// Today plus 7 days\n{EXP[DATE(today, +7d, dd.MM.yyyy)]}\n\n// Unique PO number\nPO_{EXP[NEW_RANDOM(6, numeric)]}\n\n// Read buffer\n{B[PO_NUMBER]}",
    },
  },
  {
    id: "buffering",
    category: "formula",
    accent: "emerald",
    icon: "Database",
    source: "Tricentis - Tosca Buffer Cookbook",
    he: {
      title: "Buffering מורכב",
      tagline: "שמירה ושימוש חוזר בערכים",
      body: "Buffers שומרים נתוני זמן ריצה בין צעדים. בנוסף ל-{B[...]}, יש Buffer Scopes (TestCase / TestSet / Global). Buffering מורכב משלב Expression עם Substring וקריאה ל-Constraint.",
      example:
        "// Capture PO number after save\nStatusBar  Buffer       {SB[(?<num>\\d{10})]} -> PO_NUMBER\n\n// Reuse later with constraint\nPO Field   Constraint   {B[PO_NUMBER]}",
    },
    en: {
      title: "Advanced buffering",
      tagline: "Capture and reuse runtime values",
      body: "Buffers persist runtime data across steps. Besides {B[...]}, Tosca supports Buffer Scopes (TestCase / TestSet / Global). Advanced patterns combine Expression + Substring + Constraint reads.",
      example:
        "// Capture PO number after save\nStatusBar  Buffer       {SB[(?<num>\\d{10})]} -> PO_NUMBER\n\n// Reuse later with constraint\nPO Field   Constraint   {B[PO_NUMBER]}",
    },
  },
  {
    id: "engine-modes",
    category: "engine",
    accent: "sky",
    icon: "Settings2",
    source: "Tricentis - Engine ActionModes",
    he: {
      title: "Engine ActionModes",
      tagline: "Input / Verify / Buffer / Constraint / WaitOn",
      body: "כל שדה במודול Tosca מקבל ActionMode. Input כותב, Verify בודק, Buffer קולט ל-Buffer, Constraint מסנן לפי ערך, ו-WaitOn ממתין לשינוי. ערבוב נכון של מצבים הוא מפתח לטסטים יציבים.",
      example:
        "Field          ActionMode    Value\nVendor         Input         {VENDOR}\nPurch Org      Constraint    1000\nDoc Number     Buffer        {SB[(?<n>\\d+)]}\nStatus Bar     Verify        contains:created\nDialog Title   WaitOn        SAP GUI - Information",
    },
    en: {
      title: "Engine ActionModes",
      tagline: "Input / Verify / Buffer / Constraint / WaitOn",
      body: "Every field in a Tosca module takes an ActionMode. Input writes, Verify asserts, Buffer captures, Constraint filters and WaitOn blocks until a state appears. Mixing these correctly is key to stable tests.",
      example:
        "Field          ActionMode    Value\nVendor         Input         {VENDOR}\nPurch Org      Constraint    1000\nDoc Number     Buffer        {SB[(?<n>\\d+)]}\nStatus Bar     Verify        contains:created\nDialog Title   WaitOn        SAP GUI - Information",
    },
  },
  {
    id: "recovery",
    category: "recovery",
    accent: "rose",
    icon: "ShieldAlert",
    source: "Tricentis - Recovery Scenarios",
    he: {
      title: "Recovery Scenarios",
      tagline: "טיפול ב-Popups והפרעות SAP GUI",
      body: "Recovery Scenarios רצים אוטומטית כאשר צעד נכשל. ב-SAP נפוצים: דיאלוג Information (Enter), GuiSplash, ו-Update Termination. הגדר Scope (Test Step / Test Case) וסדר עדיפויות בין Scenarios.",
      example:
        "Recovery: Close Information Dialog\n  Trigger:   GuiModalWindow contains 'Information'\n  Action:    Press Enter\n\nRecovery: Cancel Update Termination\n  Trigger:   GuiMainWindow.StatusBar contains 'Update terminated'\n  Action:    Skip TestCase + Log Error",
    },
    en: {
      title: "Recovery scenarios",
      tagline: "Handle SAP GUI popups + interruptions",
      body: "Recovery scenarios fire automatically when a step fails. Common SAP ones: Information dialog (Enter), GuiSplash, Update Termination. Set the right Scope (TestStep / TestCase) and priority order.",
      example:
        "Recovery: Close Information Dialog\n  Trigger:   GuiModalWindow contains 'Information'\n  Action:    Press Enter\n\nRecovery: Cancel Update Termination\n  Trigger:   GuiMainWindow.StatusBar contains 'Update terminated'\n  Action:    Skip TestCase + Log Error",
    },
  },
  {
    id: "runtime-logs",
    category: "runtime",
    accent: "orange",
    icon: "Terminal",
    source: "Tricentis - Execution Logs",
    he: {
      title: "פענוח שגיאות הרצה",
      tagline: "Execution Logs ו-Trouble Shooting",
      body: "Execution Logs ב-Tosca כוללים: ActualValue, ExpectedValue, Engine Result. שגיאות נפוצות: 'Object not found' = שינוי במסך SAP - יש לסרוק מחדש. 'Buffer not found' = שלב Buffer לא רץ - בדוק שגרת Recovery קודמת.",
      example:
        "[ERROR] Object not found - GuiTextField 'Vendor'\n   -> Re-scan ME21N module, anchor moved to ssub[...]\n\n[ERROR] Buffer 'PO_NUMBER' not found\n   -> Previous step skipped by Recovery; tighten WaitOn",
    },
    en: {
      title: "Runtime log analysis",
      tagline: "Execution logs and troubleshooting",
      body: "Tosca execution logs include ActualValue, ExpectedValue and Engine Result. Common errors: 'Object not found' = SAP screen changed - re-scan. 'Buffer not found' = upstream step was skipped, audit Recovery first.",
      example:
        "[ERROR] Object not found - GuiTextField 'Vendor'\n   -> Re-scan ME21N module, anchor moved to ssub[...]\n\n[ERROR] Buffer 'PO_NUMBER' not found\n   -> Previous step skipped by Recovery; tighten WaitOn",
    },
  },
];

export const TOSCA_CATEGORIES: { id: ToscaCategory; he: string; en: string; accent: string }[] = [
  { id: "scan", he: "סריקה ב-SAP", en: "SAP Scan", accent: "violet" },
  { id: "module", he: "Modules", en: "Modules", accent: "indigo" },
  { id: "formula", he: "נוסחאות + Buffering", en: "Formulas + Buffering", accent: "amber" },
  { id: "engine", he: "Engine Modes", en: "Engine modes", accent: "sky" },
  { id: "recovery", he: "Recovery", en: "Recovery", accent: "rose" },
  { id: "runtime", he: "Runtime Errors", en: "Runtime errors", accent: "orange" },
];
