# -*- coding: utf-8 -*-
# Shared relationship + config-knowledge layer (single source for xlsx + web portal).

HELP_PM   = "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE"
COMM_EAM  = "https://community.sap.com/topics/enterprise-asset-management"
FIORI_LIB = "https://fioriappslibrary.hana.ondemand.com/"
SIC_CAT   = "https://launchpad.support.sap.com/#/sic"
def NOTE(n): return f"https://launchpad.support.sap.com/#/notes/{n}"

PK = {
 "IFLOT": {"TPLNR"}, "IFLOS": {"TPLNR"}, "ILOA": {"ILOAN"},
 "CRHD": {"OBJID", "OBJTY"}, "CRTX": {"OBJID", "SPRAS"}, "T370T": {"SPRAS", "FLTYP"},
 "EQUI": {"EQUNR"}, "EQKT": {"EQUNR", "SPRAS"}, "EQUZ": {"EQUNR", "DATBI", "EQLFN"},
 "OBJK": {"OBKNR"},
 "STKO": {"STLNR", "STLTY", "STLAL"}, "STPO": {"STLNR", "POSNR"},
 "MAST": {"MATNR", "WERKS", "STLAN", "STLNR"}, "EQST": {"EQUNR", "STLAL"}, "TPST": {"TPLNR", "STLAL"},
 "IMPTT": {"POINT"}, "IMRG": {"MDOCM"},
 "QPCD": {"KATALOGART", "CODEGRUPPE", "CODE", "VERSION"}, "QPGR": {"KATALOGART", "CODEGRUPPE"},
 "T352B": {"RBNR", "KATALOGART"}, "T352": {"RBNR"},
 "QMEL": {"QMNUM"}, "QMFE": {"QMNUM", "FENUM"}, "QMUR": {"QMNUM", "FENUM", "URNUM"},
 "QMMA": {"QMNUM", "MANUM"}, "QMSM": {"QMNUM", "MANUM"}, "TQ80": {"QMART"},
 "AUFK": {"AUFNR"}, "AFKO": {"AUFNR"}, "AFVC": {"AUFPL", "APLZL"}, "AFPO": {"AUFNR", "POSNR"},
 "AFIH": {"AUFNR"}, "AFWI": {"RUECK", "RMZHL"}, "T003O": {"AUART"},
 "JEST": {"OBJNR", "STAT"}, "JSTO": {"OBJNR"}, "TJ02T": {"ISTAT", "SPRAS"},
 "TJ30T": {"STSMA", "ESTAT", "SPRAS"}, "TJ30": {"STSMA", "ESTAT"},
 "RESB": {"RSNUM", "RSPOS"}, "EBAN": {"BANFN", "BNFPO"}, "EBKN": {"BANFN", "BNFPO"},
 "MSEG": {"MBLNR", "ZEILE"}, "MKPF": {"MBLNR", "MJAHR"}, "BUT000": {"PARTNER"},
 "COSP": {"OBJNR", "GJAHR", "WRTTP", "KSTAR"}, "COSS": {"OBJNR", "GJAHR", "WRTTP", "KSTAR"},
 "COBRA": {"OBJNR"}, "COBRB": {"OBJNR", "BUREG"},
 "PLKO": {"PLNTY", "PLNNR", "PLNAL"}, "PLPO": {"PLNTY", "PLNNR"},
 "MPLA": {"WARPL"}, "MPOS": {"WAPOS"}, "MHIO": {"WARPL", "ABNUM"}, "MHIS": {"WARPL", "ABNUM"},
 "ADMI_RUN": {"RUNID"},
}

FK = {
 "IFLOT": {"TPLMA", "OBJNR"}, "IFLOS": {"TPLNR", "TPLKZ"}, "ILOA": {"KOSTL", "SWERK", "INGRP", "GEWRK", "TPLNR"},
 "CRHD": {"WERKS"}, "CRTX": {"OBJID"}, "T370T": set(),
 "EQUI": {"OBJNR"}, "EQKT": {"EQUNR"}, "EQUZ": {"EQUNR", "HEQUI", "ILOAN"}, "OBJK": {"EQUNR", "MATNR"},
 "STKO": set(), "STPO": {"IDNRK"}, "MAST": {"MATNR", "STLNR"}, "EQST": {"EQUNR", "STLNR"}, "TPST": {"TPLNR", "STLNR"},
 "IMPTT": {"MPOBJ", "ATINN"}, "IMRG": {"POINT"},
 "QPCD": set(), "QPGR": set(), "T352B": {"CODEGRUPPE"}, "T352": set(),
 "QMEL": {"EQUNR", "TPLNR", "OBJNR", "QMART"}, "QMFE": {"QMNUM"}, "QMUR": {"QMNUM", "FENUM"},
 "QMMA": {"QMNUM"}, "QMSM": {"QMNUM"}, "TQ80": {"RBNR", "AUART"},
 "AUFK": {"OBJNR", "KOSTV", "AUART"}, "AFKO": {"AUFNR", "AUFPL", "PLNBEZ"}, "AFVC": {"AUFPL", "ARBID"},
 "AFPO": {"AUFNR", "MATNR"}, "AFIH": {"AUFNR", "EQUNR", "TPLNR", "GEWRK"}, "AFWI": {"RUECK", "MBLNR", "MATNR"},
 "T003O": {"STSMA"},
 "JEST": {"OBJNR"}, "JSTO": {"STSMA"}, "TJ02T": set(), "TJ30T": set(), "TJ30": {"STSMA"}, "BUT000": set(),
 "RESB": {"MATNR", "AUFNR"}, "EBAN": {"MATNR"}, "EBKN": {"BANFN", "BNFPO", "AUFNR", "KOSTL", "SAKTO"},
 "MSEG": {"MBLNR", "MATNR", "AUFNR"}, "MKPF": set(),
 "COSP": {"OBJNR", "KSTAR"}, "COSS": {"OBJNR", "KSTAR", "PARGB"}, "COBRA": {"OBJNR"}, "COBRB": {"OBJNR", "EMPGE"},
 "PLKO": set(), "PLPO": {"ARBID"}, "MPLA": {"STRAT"}, "MPOS": {"WARPL", "EQUNR", "TPLNR", "PLNNR"},
 "MHIO": {"WARPL", "AUFNR"}, "MHIS": {"WARPL"}, "ADMI_RUN": set(),
}

def key_type(table, field):
    pk = field in PK.get(table, set())
    fk = field in FK.get(table, set())
    if pk and fk: return "PK/FK"
    if pk: return "PK"
    if fk: return "FK"
    return "-"

JOINS = [
 # -- Org structure & technical objects --
 ("IFLOS", "TPLNR", "IFLOT", "TPLNR", "1:1", "תווית מיקום פונקציונלי מצורפת לרשומת האב"),
 ("IFLOT", "TPLMA", "IFLOT", "TPLNR", "N:1", "היררכיית מיקומים - מיקום אב (self-join)"),
 ("IFLOT", "OBJNR", "JSTO", "OBJNR", "1:1", "אובייקט הסטטוס של המיקום הפונקציונלי"),
 ("ILOA",  "TPLNR", "IFLOT", "TPLNR", "N:1", "נתוני מיקום/חיוב משויכים למיקום הפונקציונלי"),
 ("ILOA",  "GEWRK", "CRHD",  "OBJID", "N:1", "מרכז עבודה ראשי אחראי"),
 ("CRTX",  "OBJID", "CRHD",  "OBJID", "N:1", "טקסטים של מרכז העבודה (לפי שפה)"),
 # -- Equipment --
 ("EQKT",  "EQUNR", "EQUI",  "EQUNR", "N:1", "טקסטים של הציוד (לפי שפה)"),
 ("EQUZ",  "EQUNR", "EQUI",  "EQUNR", "N:1", "פלחי זמן של הציוד (התקנות לאורך זמן)"),
 ("EQUZ",  "HEQUI", "EQUI",  "EQUNR", "N:1", "ציוד עליון בהיררכיה (self-join דרך EQUI)"),
 ("EQUZ",  "ILOAN", "ILOA",  "ILOAN", "N:1", "נתוני מיקום/חיוב של הציוד בפלח הזמן"),
 ("EQUI",  "OBJNR", "JSTO",  "OBJNR", "1:1", "אובייקט הסטטוס של הציוד"),
 ("OBJK",  "EQUNR", "EQUI",  "EQUNR", "N:1", "מספר סידורי משויך לרשומת ציוד"),
 # -- BOM --
 ("STPO",  "STLNR", "STKO",  "STLNR", "N:1", "פריטי עץ המוצר תחת הכותרת"),
 ("MAST",  "STLNR", "STKO",  "STLNR", "N:1", "קישור חומר לכותרת עץ המוצר"),
 ("EQST",  "STLNR", "STKO",  "STLNR", "N:1", "קישור ציוד לעץ המוצר"),
 ("EQST",  "EQUNR", "EQUI",  "EQUNR", "N:1", "עץ המוצר של הציוד"),
 ("TPST",  "STLNR", "STKO",  "STLNR", "N:1", "קישור מיקום לעץ המוצר"),
 ("TPST",  "TPLNR", "IFLOT", "TPLNR", "N:1", "עץ המוצר של המיקום הפונקציונלי"),
 # -- Measuring --
 ("IMRG",  "POINT", "IMPTT", "POINT", "N:1", "מסמכי מדידה תחת נקודת המדידה"),
 # -- Catalogs --
 ("QPCD",  "CODEGRUPPE", "QPGR", "CODEGRUPPE", "N:1", "קודים בתוך קבוצת הקוד"),
 ("T352B", "CODEGRUPPE", "QPGR", "CODEGRUPPE", "N:1", "קבוצות קוד מותרות בפרופיל הקטלוג"),
 # -- Notifications --
 ("QMFE",  "QMNUM", "QMEL",  "QMNUM", "N:1", "פריטי הליקוי תחת ההודעה"),
 ("QMUR",  "QMNUM", "QMFE",  "QMNUM", "N:1", "סיבות תחת פריט ההודעה (דרך QMNUM+FENUM)"),
 ("QMMA",  "QMNUM", "QMEL",  "QMNUM", "N:1", "פעילויות שבוצעו תחת ההודעה"),
 ("QMSM",  "QMNUM", "QMEL",  "QMNUM", "N:1", "משימות לטיפול תחת ההודעה"),
 ("QMEL",  "EQUNR", "EQUI",  "EQUNR", "N:1", "ההודעה מתייחסת לציוד"),
 ("QMEL",  "TPLNR", "IFLOT", "TPLNR", "N:1", "ההודעה מתייחסת למיקום פונקציונלי"),
 ("QMEL",  "OBJNR", "JSTO",  "OBJNR", "1:1", "אובייקט הסטטוס של ההודעה"),
 ("QMEL",  "QMART", "TQ80",  "QMART", "N:1", "סוג ההודעה מגדיר פריסת מסך ופרופיל קטלוג"),
 ("TQ80",  "RBNR",  "T352",  "RBNR",  "N:1", "סוג ההודעה מפנה לפרופיל הקטלוג (קודים מותרים)"),
 ("TQ80",  "AUART", "T003O", "AUART", "N:1", "סוג ההודעה מגדיר סוג פק\"ע ברירת מחדל"),
 # -- Orders --
 ("AFKO",  "AUFNR", "AUFK",  "AUFNR", "1:1", "כותרת נתוני האחזקה/ייצור של הפק\"ע"),
 ("AFPO",  "AUFNR", "AUFK",  "AUFNR", "N:1", "פריטי הפק\"ע"),
 ("AFIH",  "AUFNR", "AUFK",  "AUFNR", "1:1", "כותרת נתוני האחזקה (PM) של הפק\"ע"),
 ("AFVC",  "AUFPL", "AFKO",  "AUFPL", "N:1", "פעולות הפק\"ע תחת תוכנית הפעולות"),
 ("AFVC",  "ARBID", "CRHD",  "OBJID", "N:1", "מרכז העבודה המבצע את הפעולה"),
 ("AFIH",  "EQUNR", "EQUI",  "EQUNR", "N:1", "הפק\"ע מתייחסת לציוד"),
 ("AFIH",  "TPLNR", "IFLOT", "TPLNR", "N:1", "הפק\"ע מתייחסת למיקום פונקציונלי"),
 ("AUFK",  "OBJNR", "JSTO",  "OBJNR", "1:1", "אובייקט הסטטוס/CO של הפק\"ע"),
 ("AUFK",  "AUART", "T003O", "AUART", "N:1", "סוג הפקודה מגדיר פרמטרים, טווח מספרים ופרופיל סטטוס"),
 # -- Status --
 ("JEST",  "OBJNR", "JSTO",  "OBJNR", "N:1", "סטטוסים פעילים תחת אובייקט הסטטוס"),
 ("JSTO",  "STSMA", "TJ30",  "STSMA", "N:1", "פרופיל הסטטוס מגדיר את סטטוסי המשתמש"),
 ("T003O", "STSMA", "TJ30",  "STSMA", "N:1", "פרופיל הסטטוס המשויך לסוג הפקודה"),
 # -- MM integration --
 ("RESB",  "AUFNR", "AUFK",  "AUFNR", "N:1", "הזמנות רכיבים של הפק\"ע"),
 ("MSEG",  "MBLNR", "MKPF",  "MBLNR", "N:1", "פריטי מסמך החומר תחת הכותרת"),
 ("MSEG",  "AUFNR", "AUFK",  "AUFNR", "N:1", "תנועת המלאי מחויבת לפק\"ע"),
 ("EBKN",  "BANFN", "EBAN",  "BANFN", "N:1", "חיוב דרישת הרכש"),
 ("EBKN",  "AUFNR", "AUFK",  "AUFNR", "N:1", "דרישת הרכש מחויבת לפק\"ע"),
 ("EBAN",  "FLIEF", "BUT000","PARTNER","N:1", "ספק קבוע בדרישת הרכש - ב-S/4 דרך Business Partner (CVI)"),
 # -- CO integration --
 ("COSP",  "OBJNR", "AUFK",  "OBJNR", "N:1", "סך עלויות חיצוניות לפי אובייקט הפק\"ע"),
 ("COSS",  "OBJNR", "AUFK",  "OBJNR", "N:1", "סך עלויות פנימיות לפי אובייקט הפק\"ע"),
 ("COBRA", "OBJNR", "AUFK",  "OBJNR", "1:1", "כותרת חוק ההתחשבנות של הפק\"ע"),
 ("COBRB", "OBJNR", "COBRA", "OBJNR", "N:1", "פריטי חוק ההתחשבנות (חוקי חלוקה)"),
 # -- Preventive maintenance --
 ("MPOS",  "WARPL", "MPLA",  "WARPL", "N:1", "פריטי תכנית האחזקה"),
 ("MPOS",  "EQUNR", "EQUI",  "EQUNR", "N:1", "פריט התכנית מתייחס לציוד"),
 ("MPOS",  "PLNNR", "PLKO",  "PLNNR", "N:1", "רשימת הפעולות המשויכת לפריט"),
 ("MHIO",  "WARPL", "MPLA",  "WARPL", "N:1", "אובייקטי קריאת התכנית"),
 ("MHIO",  "AUFNR", "AUFK",  "AUFNR", "N:1", "הפק\"ע שנוצרה מהקריאה"),
 ("MHIS",  "WARPL", "MPLA",  "WARPL", "N:1", "היסטוריית התזמון של התכנית"),
 ("PLPO",  "PLNNR", "PLKO",  "PLNNR", "N:1", "פעולות רשימת הפעולות תחת הכותרת"),
 ("PLPO",  "ARBID", "CRHD",  "OBJID", "N:1", "מרכז העבודה של הפעולה ברשימה"),
]

CONFIG_GUIDE = [
 ("T003O - סוגי פק\"ע (Order Types; הוגדר כ-T350)", "SPRO; OIOA",
  "מגדיר את סוגי פקודות העבודה (PM01 שגרתי, PM02 שירות חיצוני, PM03 השבתה). לכל סוג קובעים טווח מספרים, "
  "קטגוריית פקודה (30=PM), פרופיל סטטוס, פרופיל התחשבנות וברירות מחדל. נתיב SPRO: Plant Maintenance and "
  "Customer Service ◄ Maintenance and Service Orders ◄ Functions and Settings for Order Types ◄ Configure "
  "Order Types. ל-CBC: הפרדת סוגי פק\"ע לפי זרם עבודה (מפעל/קו ייצור) מאפשרת בקרת עלות ודיווח נפרדים, "
  "והקצאת פרופיל סטטוס ייעודי לכל תהליך.",
  "סוג פקודה = Order Type\nקטגוריית פקודה = Order Category\nטווח מספרים = Number Range\nפרופיל התחשבנות = Settlement Profile",
  HELP_PM, "SAP Help - PM Orders", COMM_EAM, "SAP Community EAM"),
 ("T356 - עדיפויות (Priorities)", "SPRO; OIOH",
  "מגדיר את טבלת העדיפויות (1=דחוף ... 4=נמוך) וסוגי העדיפות (Priority Type) המקושרים לסוגי הודעה/פק\"ע. "
  "לכל עדיפות נקבע מרווח זמן יחסי לחישוב אוטומטי של תאריך התחלה/סיום נדרש (Relative Start/End). ל-CBC: "
  "עדיפות 'תקלת קו ייצור' מתורגמת אוטומטית למועד טיפול מיידי (SLA), ומאפשרת ניטור הפרות SLA בדוחות PMIS.",
  "עדיפות = Priority\nסוג עדיפות = Priority Type\nתאריך התחלה נדרש = Required Start\nמרווח יחסי = Relative Interval",
  HELP_PM, "SAP Help - Priorities", COMM_EAM, "SAP Community EAM"),
 ("TQ80 - סוגי הודעה (Notification Types)", "OIAL; SPRO, QCC0",
  "מגדיר את סוגי הודעת האחזקה (M1 בקשה, M2 תקלה, M3 פעילות) ומקשר לכל סוג: פרופיל קטלוג (קודים מותרים), "
  "פריסת מסך (OIAL), סוג פק\"ע ברירת מחדל וטווח מספרים. ל-CBC: הפרדה בין הודעת תקלה (M2) לבקשת שיפור (M1) "
  "מאפשרת ניתוח אמינות (MTBF/MTTR) נפרד וזרימת אישורים שונה לכל סוג.",
  "סוג הודעה = Notification Type\nפרופיל קטלוג = Catalog Profile\nפריסת מסך = Screen Layout\nקבוצת קוד = Code Group",
  HELP_PM, "SAP Help - Notifications", FIORI_LIB, "Report Malfunction F2215"),
 ("TJ30 - פרופיל סטטוס משתמש (User Status Profile)", "BS02; OIBS",
  "מגדיר פרופיל סטטוס משתמש ובתוכו סטטוסים מותאמים אישית (למשל 'ממתין לחלקים', 'אושר תקציב') עם סדר מעבר, "
  "חסימה/התרה של תהליכים עסקיים (Business Transactions), וסטטוס ראשוני. נתיב: BS02. ל-CBC: סטטוס 'אישור "
  "בטיחות' חוסם שחרור פק\"ע (REL) עד לאישור, ואוכף תהליך עבודה ארגוני מעבר לסטטוס המערכת הקבוע.",
  "פרופיל סטטוס = Status Profile\nסטטוס משתמש = User Status\nתהליך עסקי = Business Transaction\nסטטוס ראשוני = Initial Status",
  HELP_PM, "SAP Help - Status Mgmt", COMM_EAM, "SAP Community EAM"),
 ("TJ30T - טקסטים של סטטוס משתמש (User Status Texts)", "BS02; BS03",
  "מאחסן את הטקסטים הרב-לשוניים של סטטוסי המשתמש שהוגדרו ב-TJ30: קוד מקוצר (TXT04) ותיאור ארוך (TXT30) "
  "לפי שפה (SPRAS). ל-CBC: מאפשר תצוגת סטטוסים בעברית ובאנגלית לפי שפת המשתמש, וחיוני לדוחות דו-לשוניים "
  "ולממשקי Fiori.",
  "טקסט סטטוס = Status Text\nקוד מקוצר = Short Code (TXT04)\nתיאור ארוך = Long Text (TXT30)\nשפה = Language Key",
  HELP_PM, "SAP Help - Status Texts", COMM_EAM, "SAP Community EAM"),
 ("BUT000 - שותף עסקי (Business Partner / Partner Profiles)", "BP; (ECC: XK01/MK01)",
  "ב-S/4HANA ספקי שירותי האחזקה (קבלני משנה) מנוהלים כ-Business Partner (BP) במקום רשומת ספק קלאסית. "
  "נדרש CVI (Customer/Vendor Integration) להמרת LFA1 ל-BUT000 לפני/במהלך ההמרה. נתיב: tcode BP. ל-CBC: "
  "כל קבלן אחזקה חיצוני בפק\"ע (פעולת PM02) חייב BP פעיל עם תפקיד ספק (FLVN00/FLVN01); היעדר CVI יכשיל "
  "את ה-Pre-Check של SUM. ראה SAP Note 2265093 (S4TWL - Business Partner Approach).",
  "שותף עסקי = Business Partner\nתפקיד BP = BP Role\nקבוצת שותף = BP Grouping\nאינטגרציית ספק = CVI",
  NOTE(2265093), "SAP Note 2265093 (BP)", SIC_CAT, "Simplification Item Catalog"),
]
