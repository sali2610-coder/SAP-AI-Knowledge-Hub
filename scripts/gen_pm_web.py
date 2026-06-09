# -*- coding: utf-8 -*-
"""
SAP PM (Plant Maintenance / EAM) "Migration Blueprint Portal" - 100% OFFLINE standalone HTML.
Same unified Cockpit+Blueprint architecture as the PP-PI portal, fed with the PM master data
(pm_data + pm_ext_data + pm_rel_data). Tailwind replaced by an EMBEDDED utility CSS (CDN-free):
renders in any browser, behind a corporate firewall, and even by double-clicking the file.

Run:  python3 scripts/gen_pm_web.py   ->  index_pm_standalone.html
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pm_data import TOPICS
from pm_ext_data import EXTENSIONS, SIMPLIFICATION
from pm_rel_data import key_type, JOINS, CONFIG_GUIDE

# ---------------------------------------------------------------------------
# Data-type / length lookup for common PM fields (verify version-sensitive in SE11)
# ---------------------------------------------------------------------------
DT = {
 "TPLNR": ("CHAR", "30->40"), "STRNO": ("CHAR", "40"), "FLTYP": ("CHAR", "2"), "TPLKZ": ("CHAR", "8"),
 "TPLMA": ("CHAR", "30->40"), "TPLVL": ("NUMC", "2"), "BEGRU": ("CHAR", "4"), "OBJNR": ("CHAR", "22"),
 "ILOAN": ("CHAR", "12"), "KOSTL": ("CHAR", "10"), "KOSTV": ("CHAR", "10"), "SWERK": ("CHAR", "4"),
 "INGRP": ("CHAR", "3"), "GEWRK": ("NUMC", "8"), "EQUNR": ("CHAR", "18"), "EQTYP": ("CHAR", "1"),
 "EQART": ("CHAR", "10"), "HERST": ("CHAR", "30"), "TYPBZ": ("CHAR", "20"), "DATBI": ("DATS", "8"),
 "HEQUI": ("CHAR", "18"), "EQLFN": ("NUMC", "6"), "EQKTX": ("CHAR", "40"), "OBKNR": ("NUMC", "10"),
 "SERNR": ("CHAR", "18"), "MATNR": ("CHAR", "18->40"), "SERNP": ("CHAR", "4"), "TASER": ("CHAR", "8"),
 "ARBPL": ("CHAR", "8"), "OBJID": ("NUMC", "8"), "OBJTY": ("CHAR", "2"), "WERKS": ("CHAR", "4"),
 "VERWE": ("CHAR", "4"), "VERAN": ("CHAR", "3"), "SPRAS": ("LANG", "1"), "KTEXT": ("CHAR", "40"),
 "STLNR": ("CHAR", "8"), "STLTY": ("CHAR", "1"), "STLAL": ("CHAR", "2"), "STLAN": ("CHAR", "1"),
 "POSNR": ("CHAR", "4"), "IDNRK": ("CHAR", "18->40"), "MENGE": ("QUAN", "13"), "MEINS": ("UNIT", "3"),
 "STLKN": ("NUMC", "8"), "POSTP": ("CHAR", "1"), "STASZ": ("NUMC", "8"), "SUMNR": ("NUMC", "4"),
 "POINT": ("CHAR", "12"), "MPOBJ": ("CHAR", "22"), "MPTYP": ("CHAR", "1"), "ATINN": ("NUMC", "10"),
 "INDCT": ("CHAR", "1"), "DECIM": ("INT1", "1"), "MDOCM": ("CHAR", "12"), "RECDV": ("QUAN", "22"),
 "READG": ("QUAN", "22"), "CNTRR": ("QUAN", "22"), "CDIFF": ("QUAN", "22"), "CNTRC": ("QUAN", "22"),
 "KATALOGART": ("CHAR", "1"), "CODEGRUPPE": ("CHAR", "8"), "CODE": ("CHAR", "4"), "VERSION": ("CHAR", "6"),
 "STATUS": ("CHAR", "1"), "VERWMERKM": ("CHAR", "10"), "RBNR": ("CHAR", "8"), "AUSWAHLMGE": ("CHAR", "8"),
 "AUSWMENGEN": ("CHAR", "8"), "HERKZ": ("CHAR", "1"), "QMNUM": ("CHAR", "12"), "QMART": ("CHAR", "2"),
 "QMTXT": ("CHAR", "40"), "FENUM": ("NUMC", "4"), "FEGRP": ("CHAR", "8"), "FECOD": ("CHAR", "4"),
 "OTGRP": ("CHAR", "8"), "OTEIL": ("CHAR", "4"), "URNUM": ("NUMC", "4"), "URGRP": ("CHAR", "8"),
 "URCOD": ("CHAR", "4"), "MANUM": ("NUMC", "4"), "MNGRP": ("CHAR", "8"), "MNCOD": ("CHAR", "4"),
 "PSTER": ("DATS", "8"), "PRIOK": ("CHAR", "1"), "ARTPR": ("CHAR", "2"), "AUFNR": ("CHAR", "12"),
 "AUART": ("CHAR", "4"), "AUFPL": ("NUMC", "10"), "GSTRP": ("DATS", "8"), "GLTRP": ("DATS", "8"),
 "PLNBEZ": ("CHAR", "18"), "PSAMG": ("QUAN", "13"), "ILART": ("CHAR", "3"), "VORNR": ("CHAR", "4"),
 "STEUS": ("CHAR", "4"), "ARBEI": ("QUAN", "9"), "ARBID": ("NUMC", "8"), "APLZL": ("NUMC", "8"),
 "RUECK": ("NUMC", "10"), "RMZHL": ("NUMC", "8"), "MBLNR": ("CHAR", "10"), "STAT": ("CHAR", "5"),
 "INACT": ("CHAR", "1"), "CHGNR": ("NUMC", "6"), "ISTAT": ("CHAR", "5"), "TXT04": ("CHAR", "4"),
 "TXT30": ("CHAR", "30"), "STSMA": ("CHAR", "8"), "ESTAT": ("CHAR", "5"), "VRGNG": ("CHAR", "8"),
 "ANWND": ("CHAR", "8"), "OBTYP": ("CHAR", "2"), "CHGKZ": ("CHAR", "1"), "RSNUM": ("NUMC", "10"),
 "RSPOS": ("NUMC", "4"), "BDMNG": ("QUAN", "13"), "ENMNG": ("QUAN", "13"), "BWART": ("CHAR", "3"),
 "BANFN": ("CHAR", "10"), "BNFPO": ("NUMC", "5"), "KNTTP": ("CHAR", "1"), "PSTYP": ("CHAR", "1"),
 "EBELN": ("CHAR", "10"), "EBELP": ("NUMC", "5"), "LIFNR": ("CHAR", "10"), "ZEILE": ("NUMC", "4"),
 "MJAHR": ("NUMC", "4"), "BLDAT": ("DATS", "8"), "BUDAT": ("DATS", "8"), "USNAM": ("CHAR", "12"),
 "SAKTO": ("CHAR", "10"), "KSTAR": ("CHAR", "10"), "WRTTP": ("CHAR", "1"), "GJAHR": ("NUMC", "4"),
 "WTG001": ("CURR", "23"), "PARGB": ("CHAR", "4"), "BUREG": ("CHAR", "3"), "PERBZ": ("CHAR", "3"),
 "ERLKZ": ("CHAR", "1"), "KONTY": ("CHAR", "2"), "EMPGE": ("CHAR", "18"), "PROZS": ("DEC", "5"),
 "PLNNR": ("CHAR", "8"), "PLNAL": ("CHAR", "2"), "PLNTY": ("CHAR", "1"), "STATU": ("CHAR", "1"),
 "WARPL": ("CHAR", "12"), "MPTYP_P": ("CHAR", "2"), "STRAT": ("CHAR", "6"), "HORIZ": ("DEC", "3"),
 "ABRHO": ("DEC", "3"), "WAPOS": ("NUMC", "4"), "ABNUM": ("NUMC", "8"), "NPLDA": ("DATS", "8"),
 "NTERM": ("DATS", "8"), "ABRUF": ("CHAR", "1"), "AUSVN": ("DATS", "8"), "AUSBS": ("DATS", "8"),
 "AUSZT": ("DEC", "11"), "MAUEH": ("UNIT", "3"), "IDAT2": ("DATS", "8"), "ERDAT": ("DATS", "8"),
 "RUNID": ("CHAR", "20"), "OBJECT": ("CHAR", "10"), "GENER_DATE": ("DATS", "8"), "ANLNR": ("CHAR", "12"),
 "BEBER": ("CHAR", "3"), "PLANV": ("CHAR", "3"), "BMENG": ("QUAN", "13"), "BMEIN": ("UNIT", "3"),
 "STLST": ("NUMC", "2"), "AENNR": ("CHAR", "12"), "BERID": ("CHAR", "10"), "MNGRP2": ("CHAR", "8"),
}
def dtype(field):
    return DT.get(field, ("-", "-"))

# ---------------------------------------------------------------------------
# PM T-code directory -> Fiori App + ID
# (tcode, area, hebrew, s4_change, fiori_name, fiori_id, fiori_landscape_he)
# ---------------------------------------------------------------------------
PM_TCODES = [
 ("IL01 / IL02 / IL03", "מבנה ארגוני", "יצירה / שינוי / תצוגה של מיקום פונקציונלי (Functional Location) - מבנה ההיררכיה של הנכסים והמתקנים.",
  "ללא שינוי מבני; TPLNR מורחב; אסטרטגי Fiori.", "Manage Technical Objects", "F2079",
  "ב-Fiori 'Manage Technical Objects' (F2079) מאחד מיקומים, ציוד ורשימות; Object Page לכל אובייקט עם היררכיה אינטראקטיבית."),
 ("IH01 / IH06", "מבנה ארגוני", "תצוגת מבנה היררכי (IH01) ורשימת מיקומים פונקציונליים (IH06).",
  "מוחלף ב-List Report + Object Page של Fiori.", "Manage Technical Objects", "F2079",
  "ב-Fiori המבנה ההיררכי נצפה כעץ אינטראקטיבי; הרשימה היא List Report עם פילטרים חכמים."),
 ("IE01 / IE02 / IE03", "ציוד", "יצירה / שינוי / תצוגה של ציוד (Equipment) - רשומת אב הנכס הפיזי.",
  "ללא שינוי מבני; ניהול דרך Fiori.", "Manage Technical Objects", "F2079",
  "ב-Fiori ניהול הציוד ב-'Manage Technical Objects'; Object Page עם היסטוריה, מדידות, מסמכים."),
 ("IE4N", "ציוד", "התקנה ופירוק ציוד (Install/Dismantle) - ניהול שינויי המיקום וההיררכיה לאורך זמן.",
  "נתמך; Fiori.", "Manage Technical Objects", "F2079",
  "ב-Fiori פעולת התקנה/פירוק נגישה מ-Object Page של הציוד/המיקום."),
 ("IH08 / IE05", "ציוד", "רשימת ציוד (IH08) ושינוי רשימתי (IE05).", "List Report ב-Fiori.",
  "Manage Technical Objects", "F2079",
  "List Report עם בחירה מרובה לעריכה המונית."),
 ("IQ01 / IQ02 / IQ03", "ציוד", "ניהול מספרים סידוריים (Serialization) של חומר/ציוד.",
  "ללא שינוי.", "Manage Technical Objects", "F2079",
  "ב-Fiori ניהול סריאלים משולב ב-Object Page של הציוד/החומר."),
 ("IB01 / IB11 / CS01", "עץ מוצר", "יצירת עץ מוצר לציוד (IB01), למיקום (IB11) ולחומר (CS01).",
  "ללא שינוי; IDNRK מורחב.", "Manage Bills of Material", "(אמת ID)",
  "ב-Fiori 'Manage Bills of Material' עם Object Page ופיצוץ אינטראקטיבי."),
 ("IK01 / IK02 / IK03", "מדידה", "יצירה / שינוי / תצוגה של נקודת מדידה / מונה (Measuring Point / Counter).",
  "ללא שינוי.", "Manage Technical Objects / Measurement", "F2079",
  "ב-Fiori נקודות המדידה מנוהלות מ-Object Page; קליטת קריאות ב-'Enter Measurement Readings'."),
 ("IK11 / IK21", "מדידה", "יצירת מסמך מדידה (IK11) וקליטה מרוכזת (IK21) - קריאות מונה/ערך.",
  "ללא שינוי; IoT אופציונלי.", "Enter Measurement Readings", "(אמת ID)",
  "ב-Fiori קליטת קריאות מהירה מבוססת תפקיד; אינטגרציית IoT/Asset Central לקריאות אוטומטיות."),
 ("QS41 / QS51", "קטלוגים", "תחזוקת סוגי קטלוג (QS41) וקבוצות קוד/קודים (QS51) - קודי ליקוי/סיבה/פעולה.",
  "ללא שינוי (Customizing).", "Customizing (SPRO)", "(אין ייעודי)",
  "קונפיגורציה דרך SPRO; הקודים נצרכים בפריסות מסך ההודעות."),
 ("IW21 / IW22 / IW23", "הודעות", "יצירה / שינוי / תצוגה של הודעת אחזקה (Notification) - תקלה (M2), בקשה (M1), פעילות (M3).",
  "ללא שינוי מבני; Fiori 'Report Malfunction'.", "Report Malfunction", "F2215",
  "ב-Fiori 'Report Malfunction' (F2215) לדיווח תקלה מבוסס תפקיד; 'Find Maintenance Notification' לחיפוש."),
 ("IW24 / IW25 / IW26", "הודעות", "יצירת הודעה לפי סוג: תקלה (IW24), פעילות (IW25), בקשה (IW26).",
  "נתמך; Fiori.", "Report Malfunction / Create Request", "F2215",
  "ב-Fiori סוגי ההודעה מפוצלים לאפליקציות מבוססות תפקיד (תקלה / בקשת אחזקה)."),
 ("IW28 / IW29", "הודעות", "רשימת/שינוי הודעות (IW28 שינוי, IW29 תצוגה) לפי סטטוס, אובייקט ותקופה.",
  "List Report ב-Fiori.", "Find Maintenance Notification", "(אמת ID)",
  "ב-Fiori List Report עם פילטרים ו-Analytical tiles (תקלות לפי אובייקט/קוד)."),
 ("IW31 / IW32 / IW33", "פקודות עבודה", "יצירה / שינוי / תצוגה של פקודת עבודה (פק\"ע / Maintenance Order) - ליבת ביצוע האחזקה.",
  "מודל מותאם; עלויות ל-ACDOCA.", "Find Maintenance Order", "F2393",
  "ב-Fiori 'Find Maintenance Order' (F2393) + 'Create Maintenance Order'; Object Page עם פעולות, רכיבים ועלות."),
 ("IW34", "פקודות עבודה", "יצירת פק\"ע מתוך הודעה (Order from Notification).", "נתמך; Fiori.",
  "Create Maintenance Order", "(אמת ID)",
  "ב-Fiori יצירת פק\"ע מההודעה כפעולה ישירה מ-Object Page."),
 ("IW38 / IW39", "פקודות עבודה", "רשימת פק\"ע (IW38 שינוי, IW39 תצוגה) - הדוח התפעולי המרכזי לפק\"ע.",
  "List Report + Analytical.", "Find Maintenance Order", "F2393",
  "ב-Fiori List Report עם בחירה מרובה לעיבוד המוני + KPIs (פק\"ע פתוחות, פיגורים)."),
 ("IW41 / IW42", "פקודות עבודה", "דיווח ביצוע: זמן לפעולה (IW41) ודיווח השלמה כולל (IW42).",
  "ללא שינוי; Fiori Confirmation.", "Confirm Maintenance Order", "(אמת ID)",
  "ב-Fiori דיווח מבוסס תפקיד טכנאי, מותאם למסך מגע/נייד בשטח."),
 ("IW3D / IW3K", "פקודות עבודה", "הדפסת פק\"ע (IW3D) ודיווח (IW3K).", "Output Management חדש (BRF+/Adobe).",
  "Output Management", "(אמת ID)",
  "ב-S/4 ההדפסה דרך Output Management החדש (BRF+, Adobe Forms) במקום SAPscript/NACE."),
 ("IA05 / IA06 / IA01", "אחזקה מונעת", "רשימות פעולות אחזקה: כללית (IA05), שינוי (IA06), לציוד (IA01).",
  "ללא שינוי.", "Manage Task Lists", "(אמת ID)",
  "ב-Fiori 'Manage Task Lists' עם Object Page לכל רשימת פעולות."),
 ("IP01 / IP02 / IP03", "אחזקה מונעת", "יצירה / שינוי / תצוגה של תכנית אחזקה (Maintenance Plan) מבוססת זמן/ביצועים.",
  "ללא שינוי; Fiori 'Manage Maintenance Plans'.", "Manage Maintenance Plans", "(אמת ID)",
  "ב-Fiori 'Manage Maintenance Plans' מרכז תכניות, פריטים ותזמון; Object Page לכל תכנית."),
 ("IP10 / IP30", "אחזקה מונעת", "תזמון תכנית אחזקה (IP10) וניטור מועדים ברקע (IP30) - שחרור אוטומטי של פק\"ע מונעת.",
  "ללא שינוי; ריצת רקע נשמרת.", "Schedule Maintenance Plans", "(אמת ID)",
  "ב-Fiori 'Schedule Maintenance Plans'; IP30 כ-Application Job ברקע לשחרור קריאות."),
 ("IP41 / IP42 / IP43", "אחזקה מונעת", "תכניות: מחזור יחיד (IP41), אסטרטגיה (IP42), מבוססת מונים (IP43).",
  "ללא שינוי.", "Manage Maintenance Plans", "(אמת ID)",
  "ב-Fiori סוגי התכניות מנוהלים באפליקציה אחת עם בחירת אסטרטגיה/מחזור."),
 ("IW64 / IW65", "היסטוריה", "תצוגת הודעות היסטוריות וניתוח אמינות (MTBF/MTTR).",
  "ניתוח דרך Embedded Analytics/CDS.", "Maintenance Backlog / Analytics", "(אמת ID)",
  "ב-Fiori ניתוח האמינות עובר ל-Analytical Apps מבוססי CDS במקום דוחות PMIS קלאסיים."),
 ("KO88 / KO8G", "עלויות", "התחשבנות פק\"ע: בודדת (KO88) ומרוכזת (KO8G) - העברת עלויות ליעד.",
  "התחשבנות ל-ACDOCA (Universal Journal).", "Run Settlement / Maintenance Order Actuals", "(אמת ID)",
  "ב-Fiori ההתחשבנות מבוססת ACDOCA; עלויות הפק\"ע נצפות ב-Analytical Apps."),
 ("MB1A / MIGO", "מלאי ורכש", "פליטת חומר לפק\"ע (MB1A, תנועה 261) ותנועת מלאי כללית (MIGO).",
  "תנועות ב-MATDOC; נתמך.", "Post Goods Movement", "(אמת ID)",
  "ב-Fiori 'Post Goods Movement' מאוחד; פליטה לפק\"ע גם דרך מסופים ניידים."),
 ("ME51N / ME21N", "מלאי ורכש", "דרישת רכש (ME51N) והזמנת רכש (ME21N) לשירותים/חומרים חיצוניים בפק\"ע.",
  "ספקים דרך BP; נתמך.", "Manage Purchase Requisitions / Orders", "(אמת ID)",
  "ב-Fiori ניהול PR/PO מבוסס תפקיד; ספק חיצוני מנוהל כ-Business Partner (CVI)."),
 ("BS02 / BS22 / BS23", "סטטוסים", "פרופיל סטטוס משתמש (BS02) וסטטוסי מערכת (BS22/BS23) - בקרת מחזור חיי פק\"ע (CRTD/REL/TECO/CLSD).",
  "ללא שינוי; ניהול סטטוס זהה.", "מוטמע באפליקציות (אין ייעודי)", "(אין ייעודי)",
  "ב-Fiori ניהול הסטטוס מוטמע באפליקציות הפק\"ע/ההודעה; פרופילים מוגדרים ב-Backend."),
 ("SARA", "ארכיון", "ניהול ארכוב נתונים (Archiving) - אובייקטים PM_ORDER / PM_QMEL.",
  "נתמך; SAP ILM אופציונלי.", "Data Archiving / ILM", "(אמת ID)",
  "ב-S/4 ארכוב דרך SARA + SAP ILM אופציונלי לניהול מחזור חיי מידע."),
]

# ---------------------------------------------------------------------------
# Build the DATA model (PP-PI portal shape)
# ---------------------------------------------------------------------------
HELP = "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE"
def parse_fiori(s):
    s = (s or "").strip()
    if "(" in s:
        name = s[:s.rfind("(")].strip(); fid = s[s.rfind("(") + 1:s.rfind(")")].strip()
    else:
        name, fid = s, "-"
    return name, fid

# per-table join string from JOINS (child -> parent)
joinmap = {}
for (c, fk, p, pk, card, d) in JOINS:
    joinmap.setdefault(c, []).append((f"FROM {c} JOIN {p} ON {c}.{fk} = {p}.{pk}", d))

topics, cockpit, joins = [], [], []
for ti, t in enumerate(TOPICS):
    tabs = []
    # ops layer for the stream
    ops_tcodes, seen_tc = [], set()
    ops_progs, seen_pg = [], set()
    for tb in t["tables"]:
        fn, fid = parse_fiori(tb["fiori"])
        if tb["tcodes"] not in seen_tc:
            ops_tcodes.append([tb["tcodes"], fn, fid]); seen_tc.add(tb["tcodes"])
        for n, d in tb["progs"]:
            if n not in seen_pg:
                ops_progs.append([n, d]); seen_pg.add(n)
        jl = joinmap.get(tb["name"])
        join_str = "\n".join(x[0] for x in jl) if jl else "(header / root object - joined by its child tables)"
        s4 = f'{tb["s4_status"]}. חלופי: {tb["s4_repl"]}. טרנז\' S/4: {tb["s4_tcode"]}. Fiori: {tb["fiori"]}'
        tabs.append({
            "name": tb["name"], "he": tb["he"], "en": tb["en"], "tcodes": tb["tcodes"],
            "join": join_str, "guide": f'{tb["he"]} ({tb["en"]}).', "s4": s4,
            "help_url": HELP, "help_lbl": "SAP Help - Plant Maintenance / EAM",
            "funcs": tb["funcs"], "progs": tb["progs"],
            "fields": [{"tech": f[0], "en": f[1], "he": f[2],
                        "dt": dtype(f[0])[0], "len": dtype(f[0])[1], "key": key_type(tb["name"], f[0])}
                       for f in tb["fields"]],
        })
        cockpit.append({"table": tb["name"], "he": tb["he"], "topic": t["title"]})
    ext = EXTENSIONS[ti]
    interfaces = [["User Exit", c, d] for c, d in ext["exits"]] + \
                 [["BAdI", c, d] for c, d in ext["badis"]] + \
                 [["ECC↔S/4", "—", a] for a in ext["arch"]]
    topics.append({"idx": ti, "title": t["title"], "theme": t["theme"], "tables": tabs,
                   "ops": {"tcodes": ops_tcodes, "interfaces": interfaces, "programs": ops_progs}})

for (c, fk, p, pk, card, d) in JOINS:
    joins.append({"table": c, "join": f"{c}.{fk} = {p}.{pk}", "he": d})

simplification = [[o, ti2, n, c, im] for (o, ti2, n, c, im) in SIMPLIFICATION]
config = [[o, tc, g, term, hu, hl, eu, el] for (o, tc, g, term, hu, hl, eu, el) in CONFIG_GUIDE]

DATA = {"topics": topics, "cockpit": cockpit, "joins": joins,
        "simplification": simplification, "config": config, "tcodes_dir": PM_TCODES,
        "statuses": ["Not started", "In analysis", "In conversion", "Tested", "Done"]}

# ---------------------------------------------------------------------------
# HTML (embedded utility CSS - NO Tailwind CDN)
# ---------------------------------------------------------------------------
UTIL_CSS = r"""
*,*::before,*::after{box-sizing:border-box}
h1,p,div,figure,table{margin:0}
button{background:none;border:0;cursor:pointer;font:inherit;color:inherit;padding:0}
input,select,button,textarea{font:inherit}
svg{display:block;max-width:100%}
.flex{display:flex}.flex-col{flex-direction:column}.flex-1{flex:1 1 0%}.flex-shrink-0{flex-shrink:0}
.inline-block{display:inline-block}.inline-flex{display:inline-flex}
.grid{display:grid}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.items-center{align-items:center}.justify-between{justify-content:space-between}
.min-h-screen{min-height:100vh}.min-w-0{min-width:0}.max-w-full{max-width:100%}
.w-full{width:100%}.w-72{width:18rem}.w-44{width:11rem}.w-24{width:6rem}.w-8{width:2rem}
.h-44{height:11rem}.h-5{height:1.25rem}
.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}
.fixed{position:fixed}.sticky{position:sticky}.inset-y-0{top:0;bottom:0}.right-0{right:0}.top-0{top:0}
.z-20{z-index:20}.z-30{z-index:30}
.transition-transform{transition:transform .25s ease}.translate-x-full{transform:translateX(100%)}
.hidden{display:none}.mx-auto{margin-left:auto;margin-right:auto}.cursor-pointer{cursor:pointer}
.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.shadow{box-shadow:0 1px 3px rgba(0,0,0,.12)}.shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,.06)}
.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}
.p-3{padding:.75rem}.p-4{padding:1rem}
.px-2{padding-left:.5rem;padding-right:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}
.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}
.pt-3{padding-top:.75rem}.pb-1{padding-bottom:.25rem}
.m-3{margin:.75rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-5{margin-bottom:1.25rem}
.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.ml-2{margin-left:.5rem}.mr-3{margin-right:.75rem}
.leading-7{line-height:1.75rem}
.text-xs{font-size:.75rem;line-height:1.1rem}.text-sm{font-size:.875rem;line-height:1.3rem}.text-lg{font-size:1.125rem}.text-2xl{font-size:1.5rem}.text-3xl{font-size:1.875rem;line-height:2.1rem}.text-\[11px\]{font-size:11px}
.font-bold{font-weight:700}.font-extrabold{font-weight:800}.font-normal{font-weight:400}
.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}
.text-white{color:#fff}
.text-white\/40{color:rgba(255,255,255,.4)}.text-white\/50{color:rgba(255,255,255,.5)}.text-white\/60{color:rgba(255,255,255,.6)}.text-white\/70{color:rgba(255,255,255,.7)}.text-white\/80{color:rgba(255,255,255,.8)}
.text-slate-400{color:#94a3b8}.text-slate-500{color:#64748b}.text-slate-600{color:#475569}.text-slate-800{color:#1e293b}
.bg-white{background:#fff}.bg-slate-50{background:#f8fafc}.bg-slate-100{background:#f1f5f9}.bg-white\/15{background:rgba(255,255,255,.15)}
.rounded{border-radius:.25rem}.rounded-lg{border-radius:.5rem}.rounded-xl{border-radius:.75rem}
.border{border:1px solid #e5e7eb}.border-b{border-bottom:1px solid #e5e7eb}.border-t{border-top:1px solid #e5e7eb}
.border-white\/10{border-color:rgba(255,255,255,.1)}
.opacity-60{opacity:.6}.opacity-70{opacity:.7}
.hover\:bg-slate-50:hover{background:#f8fafc}.hover\:opacity-90:hover{opacity:.9}
@media (min-width:640px){.sm\:block{display:block}}
@media (min-width:768px){
 .md\:static{position:static}.md\:translate-x-0{transform:translateX(0)}.md\:hidden{display:none}
 .md\:p-6{padding:1.5rem}
 .md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
 .md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
 .md\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}
}
"""

HTML = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAP PM (EAM) Migration Blueprint Portal - CBC Israel</title>
<style>
 :root{--red:#D62027;--redhot:#F40009;--slate:#1E1E24;--silver:#8A9EA7;--zebra:#F9FAFB;--grid:#E5E7EB;--ink:#1F2937;}
 *{font-family:'Segoe UI',system-ui,Arial,sans-serif;} body{background:#F7F8FA;color:var(--ink);}
 .navbtn{transition:.15s;border-right:3px solid transparent;cursor:pointer;} .navbtn:hover{background:#2B2B33;}
 .navbtn.active{background:#2B2B33;border-right:3px solid var(--redhot);}
 table{border-collapse:collapse;width:100%;} th,td{border:1px solid var(--grid);padding:6px 8px;font-size:13px;vertical-align:top;}
 thead th{background:var(--slate);color:#fff;} tbody tr:nth-child(even){background:var(--zebra);}
 code{font-family:Consolas,monospace;color:#0B5394;font-weight:700;background:#EEF2F7;padding:1px 5px;border-radius:4px;white-space:pre-wrap;}
 a.sap{color:#0563C1;text-decoration:underline;font-weight:600;}
 .badge{display:inline-block;padding:1px 7px;border-radius:9px;font-size:11px;font-weight:700;}
 .pk{background:#FCE4E6;color:#B01722;}.fk{background:#ECEFF1;color:#37474F;}.pkfk{background:#FBE3E4;color:var(--red);}.non{background:#F3F4F6;color:#9AA3AF;}
 .acc-body{display:none;} .acc.open>.acc-body{display:block;}
 .acc.open>.acc-head .chev{transform:rotate(90deg);} .chev{transition:.2s;display:inline-block;}
 @media (max-width:640px){
   table.resp thead{display:none;}
   table.resp tr{display:block;margin-bottom:10px;border:1px solid var(--grid);border-radius:8px;overflow:hidden;}
   table.resp td{display:flex;justify-content:space-between;gap:10px;border:none;border-bottom:1px solid #eef;}
   table.resp td::before{content:attr(data-label);font-weight:700;color:#475569;flex:0 0 42%;}
 }
 ::-webkit-scrollbar{height:9px;width:9px;}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px;}
__UTILCSS__
</style></head>
<body>
<div class="flex min-h-screen">
 <aside id="side" class="text-white w-72 flex-shrink-0 flex flex-col fixed md:static inset-y-0 right-0 z-30 translate-x-full md:translate-x-0 transition-transform" style="background:#1E1E24">
   <div class="p-4 border-b border-white/10">
     <div class="inline-block px-3 py-1 rounded font-extrabold text-white text-lg" style="background:#D62027">CBC ISRAEL</div>
     <div class="mt-1 text-sm text-white/70 font-bold">Migration Blueprint Portal &middot; PM (EAM)</div>
     <div class="text-[11px] text-white/40 font-bold">Plant Maintenance &middot; ECC 6.0 &rarr; S/4HANA</div>
     <div class="text-[11px] font-bold" style="color:#9be19b">✓ Offline / Standalone (ללא אינטרנט)</div>
   </div>
   <input id="search" placeholder="חיפוש (טבלה / שדה / T-code / קוד)..." oninput="doSearch(this.value)" class="m-3 px-3 py-2 rounded text-slate-800 text-sm"/>
   <nav id="nav" class="flex-1 overflow-y-auto text-sm"></nav>
   <div class="p-3 border-t border-white/10 text-xs">
     <div class="font-bold text-white/80 mb-1">🖥️ פתיחה</div>
     <div class="text-white/60 mb-2">פתח בלחיצה כפולה (file://) או הרץ שרת מקומי לשיתוף:</div>
     <div class="flex items-center gap-1"><code style="color:#9be19b;background:#0d1117;">python -m http.server 8000</code>
       <button onclick="navigator.clipboard&&navigator.clipboard.writeText('python -m http.server 8000')" class="text-white px-2 py-1 rounded text-[11px] font-bold" style="background:#D62027">העתק</button></div>
   </div>
 </aside>
 <div class="flex-1 min-w-0">
   <header class="text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow" style="background:#D62027">
     <button class="md:hidden text-2xl" onclick="document.getElementById('side').classList.toggle('translate-x-full')">☰</button>
     <h1 id="hdr" class="font-extrabold text-lg truncate">SAP PM (EAM) - Migration Cockpit & Blueprint</h1>
     <div class="text-xs bg-white/15 px-2 py-1 rounded font-bold hidden sm:block">PM (EAM) &middot; JOIN ON &middot; Fiori</div>
   </header>
   <main id="main" class="p-3 md:p-6 max-w-full"></main>
   <footer class="text-center text-xs text-slate-400 py-6">SAP PM Migration Blueprint Portal &middot; CBC Israel</footer>
 </div>
</div>
<script>
const DATA = {{DATA}};
const STK="cbc_pm_v1"; const store=JSON.parse(localStorage.getItem(STK)||"{}");
const save=()=>localStorage.setItem(STK,JSON.stringify(store));
const getS=t=>store[t]||"Not started";
const SC={"Not started":["#FCE4E6","#B01722"],"In analysis":["#ECEFF1","#475569"],"In conversion":["#E1E6EA","#37474F"],"Tested":["#DCE6EC","#2A4A57"],"Done":["#DCEFE0","#1E5A44"]};
const esc=s=>(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function fioriLink(s){const m=String(s).match(/F\d{3,5}/);return m?`<a class="sap" target="_blank" rel="noopener" href="https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/detail/Apps('${m[0]}')">${esc(s)}</a>`:esc(s);}
function noteLink(n){const m=String(n).match(/^\d{6,}$/);return m?`<a class="sap" target="_blank" rel="noopener" href="https://launchpad.support.sap.com/#/notes/${n}">${esc(n)}</a>`:esc(n);}
function keyBadge(k){const c=k==="PK"?"pk":k==="FK"?"fk":k==="PK/FK"?"pkfk":"non";return `<span class="badge ${c}">${esc(k)}</span>`;}

function kpis(){let k={total:DATA.cockpit.length,"Done":0,"Tested":0,"In analysis":0,"In conversion":0,"Not started":0};
 DATA.cockpit.forEach(o=>k[getS(o.table)]++); k.prog=k["In analysis"]+k["In conversion"]; k.pct=k.total?Math.round(k.Done/k.total*100):0; return k;}
function kpiCard(l,v,bg,fg){return `<div class="rounded-xl p-4 text-center shadow-sm" style="background:${bg}"><div class="text-3xl font-extrabold" style="color:${fg}">${v}</div><div class="text-xs font-bold mt-1" style="color:${fg}">${l}</div></div>`;}
function kpiCards(k){return [kpiCard("סה״כ אובייקטים",k.total,"#ECEFF1","#1E1E24"),kpiCard("הושלם (Done)",k.Done,"#DCEFE0","#1E5A44"),kpiCard("נבדק (Tested)",k.Tested,"#DCE6EC","#2A4A57"),kpiCard("בתהליך",k.prog,"#E1E6EA","#37474F"),kpiCard("פתוח (Open)",k["Not started"],"#FCE4E6","#B01722"),kpiCard("% השלמה",k.pct+"%","#FBE3E4","#D62027")].join("");}
function charts(){
 const k=kpis(); const order=["Done","Tested","In conversion","In analysis","Not started"];
 const total=k.total||1; const C=2*Math.PI*70; let off=0;
 const arcs=order.map(s=>{const v=k[s]||0;const len=C*v/total;const seg=`<circle r="70" cx="100" cy="100" fill="none" stroke="${SC[s][0]}" stroke-width="34" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"/>`;off+=len;return seg;}).join("");
 const donut=`<svg viewBox="0 0 200 200" class="w-44 h-44 mx-auto"><circle r="70" cx="100" cy="100" fill="none" stroke="#eee" stroke-width="34"/>${arcs}<text x="100" y="96" text-anchor="middle" font-size="34" font-weight="800" fill="#1E1E24">${k.pct}%</text><text x="100" y="120" text-anchor="middle" font-size="13" fill="#64748B">הושלם</text></svg>`;
 const bars=order.slice().reverse().map(s=>{const v=k[s]||0;const w=Math.round(v/total*100);return `<div class="flex items-center gap-2 text-xs mb-2"><div class="w-24 text-left font-bold" style="color:${SC[s][1]}">${s}</div><div class="flex-1 bg-slate-100 rounded h-5 overflow-hidden"><div class="h-5 rounded" style="width:${w}%;background:${SC[s][0]};min-width:${v?'14px':'0'}"></div></div><div class="w-8 font-bold">${v}</div></div>`;}).join("");
 const legend=order.map(s=>`<span class="inline-flex items-center gap-1 mr-3 text-xs"><span style="width:11px;height:11px;border-radius:3px;background:${SC[s][0]};display:inline-block"></span>${s}</span>`).join("");
 return `<div class="grid md:grid-cols-2 gap-4 bg-white rounded-xl shadow-sm p-4 border" style="border-color:#E5E7EB">
   <div class="text-center"><div class="font-bold mb-2" style="color:#1E1E24">התפלגות סטטוס (Donut)</div>${donut}<div class="mt-2">${legend}</div></div>
   <div><div class="font-bold mb-2" style="color:#1E1E24">התקדמות לפי סטטוס (Bar)</div>${bars}</div></div>`;
}
function opsBlock(ops){
 const tm=ops.tcodes.map(x=>`<tr><td data-label="ECC"><code>${esc(x[0])}</code></td><td data-label="Fiori App">${esc(x[1])}</td><td data-label="Fiori ID">${fioriLink(x[2])}</td></tr>`).join("");
 const ic=ops.interfaces.map(x=>`<tr><td data-label="Type"><b style="color:#D62027">${esc(x[0])}</b></td><td data-label="Name"><code>${esc(x[1])}</code></td><td data-label="תיאור">${esc(x[2])}</td></tr>`).join("");
 const pg=ops.programs.map(x=>`<tr><td data-label="Program"><code>${esc(x[0])}</code></td><td data-label="תיאור">${esc(x[1])}</td></tr>`).join("");
 const blk=(t,h)=>`<div><div class="font-bold mb-1 text-sm" style="color:#1E1E24">${t}</div><div class="overflow-x-auto"><table class="resp text-xs">${h}</table></div></div>`;
 return `<div class="grid md:grid-cols-3 gap-4">
   ${blk('T-codes ◄► Fiori App','<thead><tr><th>ECC T-code</th><th>S/4 Fiori App</th><th>Fiori ID</th></tr></thead><tbody>'+tm+'</tbody>')}
   ${blk('User Exits / BAdIs / ארכיטקטורה','<thead><tr><th>Type</th><th>Code</th><th>תיאור</th></tr></thead><tbody>'+ic+'</tbody>')}
   ${blk('תוכניות רקע ודוחות','<thead><tr><th>Program</th><th>תיאור ומטרה</th></tr></thead><tbody>'+pg+'</tbody>')}
 </div>`;
}
function blueprint(tb){
 const rows=tb.fields.map(f=>`<tr><td data-label="שדה טכני"><b style="color:#D62027">${esc(f.tech)}</b></td><td data-label="Type">${esc(f.dt)}</td><td data-label="Len">${esc(f.len)}</td><td data-label="Key">${keyBadge(f.key)}</td><td data-label="English">${esc(f.en)}</td><td data-label="עברית">${esc(f.he)}</td></tr>`).join("");
 return `<div class="overflow-x-auto mb-3"><table class="resp"><thead><tr><th>שדה טכני</th><th>Type</th><th>Len</th><th>Key</th><th>English</th><th>עברית</th></tr></thead><tbody>${rows}</tbody></table></div>
   <div class="grid md:grid-cols-2 gap-3 text-xs mb-3">
     <div><b style="color:#1E1E24">פונקציות / BAPIs:</b>${tb.funcs.map(x=>`<div><code>${esc(x[0])}</code> - ${esc(x[1])}</div>`).join("")}</div>
     <div><b style="color:#1E1E24">תוכניות / דוחות:</b>${tb.progs.map(x=>`<div><code>${esc(x[0])}</code> - ${esc(x[1])}</div>`).join("")}</div>
   </div>
   <div class="grid md:grid-cols-2 gap-3 text-xs mb-2">
     <div><b style="color:#1E1E24">JOIN ON (SQL/CDS):</b><br><code>${esc(tb.join)}</code></div>
     <div style="background:#FBF1E6;border-radius:8px;padding:8px"><b style="color:#9A5A23">מעבר S/4HANA:</b><br>${esc(tb.s4)}</div>
   </div>
   <div class="text-sm leading-7"><b style="color:#1E1E24">הסבר פונקציונלי:</b> ${esc(tb.guide)}</div>
   <div class="text-sm mt-1">🔗 <a class="sap" target="_blank" rel="noopener" href="${esc(tb.help_url)}">${esc(tb.help_lbl)}</a> &middot; <span class="text-slate-400">T-codes: ${esc(tb.tcodes)}</span></div>`;
}
function statusSel(tbl){const s=getS(tbl);const st=`background:${SC[s][0]};color:${SC[s][1]};font-weight:700;border:1px solid #E5E7EB;border-radius:6px;padding:3px 6px;`;
 return `<select data-tbl="${esc(tbl)}" onclick="event.stopPropagation()" onchange="setStatus('${esc(tbl)}',this.value,this)" style="${st}">${DATA.statuses.map(o=>`<option ${o===s?'selected':''}>${o}</option>`).join("")}</select>`;}
function objRow(tb,gi,oi){
 return `<div class="acc border-b" style="border-color:#E5E7EB" id="o_${gi}_${oi}">
   <div class="acc-head flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer" onclick="this.parentElement.classList.toggle('open')">
     <span class="chev text-slate-400">▸</span>
     <span class="font-bold flex-1 min-w-0 truncate" style="color:#D62027">${esc(tb.name)} <span class="text-slate-500 font-normal text-xs">${esc(tb.he)}</span></span>
     ${statusSel(tb.name)}
   </div>
   <div class="acc-body bg-slate-50 p-3 border-t" style="border-color:#E5E7EB">${blueprint(tb)}</div></div>`;
}
function streamProg(t){let d=0;t.tables.forEach(tb=>{if(getS(tb.name)==="Done")d++;});return Math.round(d/t.tables.length*100);}
function streamSection(t){
 const objs=t.tables.map((tb,oi)=>objRow(tb,t.idx,oi)).join("");
 return `<section id="st-${t.idx}" class="bg-white rounded-xl shadow-sm mb-5 border overflow-hidden" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold flex items-center justify-between" style="background:#1E1E24">
     <span>📄 ${esc(t.title)} <span class="opacity-60 text-xs">(${t.tables.length} אובייקטים)</span></span>
     <span class="text-xs bg-white/15 px-2 py-1 rounded" id="sp-${t.idx}">${streamProg(t)}% Done</span></div>
   <details class="border-b" style="border-color:#E5E7EB"><summary class="px-3 py-2 cursor-pointer font-bold text-sm" style="color:#D62027">🔧 שכבה תפעולית (T-codes ◄► Fiori | User Exits/BAdIs | תוכניות רקע)</summary><div class="p-3" style="background:#FAFAFB">${opsBlock(t.ops)}</div></details>
   <div>${objs}</div></section>`;
}
function viewHome(){
 const k=kpis();
 return `<div class="text-white px-4 py-3 rounded-lg font-extrabold text-lg mb-1" style="background:#D62027">🚀 Migration Cockpit - מצב פריסת PM/EAM חי</div>
   <div class="text-xs text-slate-500 mb-3">עדכן סטטוס לכל אובייקט -> ה-KPI והגרפים מתעדכנים מיד. לחץ על אובייקט כדי לחשוף את ה-Blueprint הטכני המלא (שדות, JOIN ON, BAPIs, הסבר עברי).</div>
   <div id="kpiStrip" class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">${kpiCards(k)}</div>
   <div id="chartBox" class="mb-5">${charts()}</div>
   <div class="text-white px-4 py-2 rounded-lg font-bold mb-3" style="background:#1E1E24">📘 Blueprint Layer - מילון טכני (לחץ אובייקט להרחבה)</div>
   ${DATA.topics.map(streamSection).join("")}`;
}
function setStatus(t,v,el){store[t]=v;save();
 const k=kpis(); const ks=document.getElementById("kpiStrip"); if(ks)ks.innerHTML=kpiCards(k);
 const cb=document.getElementById("chartBox"); if(cb)cb.innerHTML=charts();
 if(el){el.style.background=SC[v][0];el.style.color=SC[v][1];}
 DATA.topics.forEach(tp=>{const sp=document.getElementById("sp-"+tp.idx);if(sp)sp.textContent=streamProg(tp)+"% Done";});
}
function viewER(){
 const rows=DATA.joins.map((j,i)=>`<tr><td data-label="#" class="text-center">${i+1}</td><td data-label="טבלה" class="font-bold" style="color:#D62027">${esc(j.table)}</td><td data-label="JOIN ON"><code>${esc(j.join)}</code></td><td data-label="תיאור">${esc(j.he)}</td></tr>`).join("");
 return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#1E1E24">⇄ ER - Join Map &middot; JOIN ON (SQL / CDS Views)</div>
   <div class="overflow-x-auto"><table class="resp"><thead><tr><th>#</th><th>טבלה (ילד)</th><th>JOIN ON (SQL/CDS)</th><th>תיאור</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function areaBadge(s){return `<span class="badge" style="background:#1E1E24;color:#fff">${esc(s)}</span>`;}
function viewTcodes(){
 const rows=DATA.tcodes_dir.map((x,i)=>`<tr id="tcd_${i}"><td data-label="#" class="text-center">${i+1}</td><td data-label="ECC T-Code"><b style="color:#D62027">${esc(x[0])}</b></td><td data-label="תחום" class="text-center">${areaBadge(x[1])}</td><td data-label="הסבר">${esc(x[2])}</td><td data-label="שינוי S/4" style="color:#9A5A23">${esc(x[3])}</td><td data-label="Fiori App + ID">${fioriLink(x[4]+" ("+x[5]+")")}</td><td data-label="נוף Fiori">${esc(x[6])}</td></tr>`).join("");
 return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#D62027">🛠 PM Transactions Directory - מדריך טרנזקציות PM ◄► Fiori (${DATA.tcodes_dir.length})</div>
   <div class="p-3 text-xs text-slate-500">מיפוי מלא של טרנזקציות ה-PM (IW21/IW31/IW28...) לאפליקציות Fiori + ID, עם הסבר עברי ושינוי מבני ב-S/4HANA.</div>
   <div class="overflow-x-auto"><table class="resp"><thead><tr><th>#</th><th>ECC T-Code</th><th>תחום</th><th>הסבר פונקציונלי (Hebrew)</th><th>שינוי S/4HANA</th><th>Fiori App + ID</th><th>נוף Fiori מורחב</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function viewSimp(){
 const rows=DATA.simplification.map((x,i)=>`<tr id="sim_${i}"><td data-label="#" class="text-center">${i+1}</td><td data-label="תחום">${esc(x[0])}</td><td data-label="פריט"><b>${esc(x[1])}</b></td><td data-label="SAP Note" class="text-center"><b style="color:#D62027">${noteLink(x[2])}</b></td><td data-label="קטגוריה">${esc(x[3])}</td><td data-label="השפעה">${esc(x[4])}</td></tr>`).join("");
 return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#D62027">★ Simplification Item List - SAP Notes למיגרציית PM/EAM</div>
   <div class="overflow-x-auto"><table class="resp"><thead><tr><th>#</th><th>תחום</th><th>Simplification Item</th><th>SAP Note</th><th>קטגוריה</th><th>השפעה והמלצה</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function viewCfg(){
 return DATA.config.map((c,i)=>`<div id="cfg_${i}" class="bg-white rounded-xl shadow-sm mb-4 border overflow-hidden" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#1E1E24">${esc(c[0])} <span class="opacity-60 text-xs">&middot; ${esc(c[1])}</span></div>
   <div class="p-3 text-sm leading-7">${esc(c[2])}</div>
   <div class="px-3 pb-3 grid md:grid-cols-2 gap-3">
     <div class="text-xs" style="background:#f8fafc;border-radius:6px;padding:8px"><b style="color:#1E1E24">תרגום מונחים:</b><br>${esc(c[3]).replace(/\n/g,"<br>")}</div>
     <div class="text-sm flex items-center gap-3" style="flex-wrap:wrap">
       <a class="sap" target="_blank" rel="noopener" href="${esc(c[4])}">🔗 ${esc(c[5])}</a>
       <a class="sap" target="_blank" rel="noopener" href="${esc(c[6])}">🔗 ${esc(c[7])}</a>
     </div></div></div>`).join("");
}
const NAV=[{id:"home",icon:"🚀",label:"Migration Cockpit (Home)"},
 {group:"נושאי ה-PM (Core Streams)"},
 ...DATA.topics.map(t=>({id:"st-"+t.idx,icon:"📄",label:t.title})),
 {group:"רפרנס וכלים (Reference)"},
 {id:"tcd",icon:"🛠",label:"מדריך טרנזקציות PM"},{id:"simp",icon:"★",label:"Simplification (SAP Notes)"},
 {id:"cfg",icon:"📖",label:"Config Guide"},{id:"er",icon:"⇄",label:"ER - Join Map"}];
function renderNav(a){document.getElementById("nav").innerHTML=NAV.map(n=> n.group?`<div class="px-4 pt-3 pb-1 text-[11px] font-bold text-white/40">${esc(n.group)}</div>`:`<button class="navbtn w-full text-right px-4 py-2 ${n.id===a?'active':''}" onclick="show('${n.id}')"><span class="opacity-70 ml-2">${n.icon}</span>${esc(n.label)}</button>`).join("");}
let CURRENT="home";
function show(id){
 if(window.innerWidth<768)document.getElementById("side").classList.add("translate-x-full");
 const m=document.getElementById("main"),h=document.getElementById("hdr");
 if(id.startsWith("st-")){
   if(CURRENT!=="home"){m.innerHTML=viewHome();CURRENT="home";}
   renderNav(id);
   const sec=document.getElementById(id); if(sec){sec.scrollIntoView({behavior:"smooth",block:"start"});}
   h.textContent="SAP PM (EAM) - Cockpit & Blueprint"; return;
 }
 renderNav(id); CURRENT=id;
 if(id==="home"){h.textContent="SAP PM (EAM) - Migration Cockpit & Blueprint";m.innerHTML=viewHome();}
 else if(id==="er"){h.textContent="ER - Join Map";m.innerHTML=viewER();}
 else if(id==="tcd"){h.textContent="מדריך טרנזקציות PM";m.innerHTML=viewTcodes();}
 else if(id==="simp"){h.textContent="Simplification Item List";m.innerHTML=viewSimp();}
 else if(id==="cfg"){h.textContent="Config Guide";m.innerHTML=viewCfg();}
 window.scrollTo(0,0);
}
function doSearch(q){q=q.trim().toLowerCase();if(!q)return;
 for(const t of DATA.topics)for(let oi=0;oi<t.tables.length;oi++){const tb=t.tables[oi];
   if(tb.name.toLowerCase().includes(q)||tb.he.includes(q)||tb.tcodes.toLowerCase().includes(q)||
      tb.fields.some(f=>f.tech.toLowerCase().includes(q)||f.he.includes(q)||(f.en||"").toLowerCase().includes(q))){
     if(CURRENT!=="home"){show("home");}
     renderNav("st-"+t.idx);
     setTimeout(()=>{const o=document.getElementById("o_"+t.idx+"_"+oi);if(o){o.classList.add("open");o.scrollIntoView({behavior:"smooth",block:"center"});o.querySelector(".acc-head").style.background="#FFF2A8";}},60);
     return;}}
 for(let i=0;i<DATA.tcodes_dir.length;i++){const x=DATA.tcodes_dir[i];if(x.join(" ").toLowerCase().includes(q)){show("tcd");setTimeout(()=>{const r=document.getElementById("tcd_"+i);if(r){r.scrollIntoView({block:"center"});r.style.background="#FFF2A8";}},60);return;}}
 for(let i=0;i<DATA.simplification.length;i++){if(DATA.simplification[i].join(" ").toLowerCase().includes(q)){show("simp");setTimeout(()=>{const r=document.getElementById("sim_"+i);if(r){r.scrollIntoView({block:"center"});r.style.background="#FFF2A8";}},60);return;}}
 for(let i=0;i<DATA.config.length;i++){if(DATA.config[i].join(" ").toLowerCase().includes(q)){show("cfg");setTimeout(()=>{const r=document.getElementById("cfg_"+i);if(r){r.scrollIntoView({block:"center"});}},60);return;}}
 for(const j of DATA.joins)if(j.join.toLowerCase().includes(q)){show("er");return;}
 alert("לא נמצא: "+q);}
show("home");
</script></body></html>"""

html = HTML.replace("__UTILCSS__", UTIL_CSS).replace("{{DATA}}", json.dumps(DATA, ensure_ascii=False))
with open("index_pm_standalone.html", "w", encoding="utf-8") as fh:
    fh.write(html)
nt = sum(len(t["tables"]) for t in TOPICS); nf = sum(len(tb["fields"]) for t in TOPICS for tb in t["tables"])
print(f"OK -> index_pm_standalone.html ({len(html)//1024} KB) | OFFLINE/CDN-free")
print(f"   topics:{len(TOPICS)} tables:{nt} fields:{nf} joins:{len(JOINS)} tcodes_dir:{len(PM_TCODES)} simp:{len(SIMPLIFICATION)} config:{len(CONFIG_GUIDE)}")
