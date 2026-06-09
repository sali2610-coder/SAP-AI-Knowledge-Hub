# -*- coding: utf-8 -*-
"""
Technical extensions + S/4HANA Simplification Item data for the SAP PM workbook.

EXTENSIONS  - aligned 1:1 with TOPICS order in pm_data.py (12 entries). Each:
   exits : [(code, hebrew_desc)]   classic SMOD/CMOD user exits & customer functions
   badis : [(code, hebrew_desc)]   BAdIs / enhancement spots (SE18/SE19)
   arch  : [hebrew_note, ...]       ECC 6.0 vs S/4HANA architecture / functional differences

SIMPLIFICATION - rows for the dedicated "Simplification Item list" sheet.
   (object, item_title, sap_note, category, impact_he)

Accuracy: enhancement/BAdI names are real classic SAP objects; where a specific
object/Note is version-sensitive it is marked "(אמת...)". Verify exits in SMOD/SE18 and
SAP Notes in the SAP ONE Support Launchpad Simplification List before relying on them.
"""

# --- 12 entries, same order as pm_data.TOPICS -------------------------------
EXTENSIONS = [
# 0 - Org structure & technical objects
 {"exits": [("ITOB0001", "הרחבת לקוח לאובייקטים טכניים (מיקום/ציוד) - שדות נוספים ובדיקות"),
            ("IBIP0001", "ממשק יצירה אצווה (Batch Input/Direct Input) לאובייקטים טכניים")],
  "badis": [("BADI_EAM_TECHNICAL_OBJECT", "BAdI מרכזי להרחבת לוגיקת אובייקטים טכניים ב-S/4HANA"),
            ("BADI_EAM_SINGLE_LEVEL_LIST", "התאמת רשימות אובייקטים חד-רמתיות (IH06/IH08)")],
  "arch": ["שדה TPLNR ומבנה ההיררכיה ללא שינוי; ב-S/4 ניתן לנהל מיקומים גם דרך Fiori 'Manage Technical Objects' (F2079).",
           "מחוון מבנה ומסיכות עריכה (Customizing) זהים; ב-S/4 אפשר Linear Asset Management (LAM) למיקומים ליניאריים.",
           "ITOB0001 עדיין נתמך אך לפיתוח חדש מומלץ BADI_EAM_TECHNICAL_OBJECT."]},
# 1 - Equipment
 {"exits": [("IEQM0001", "בדיקות והרחבת שדות בעת יצירת/שינוי ציוד"),
            ("IEQM0003", "ברירות מחדל וקביעת ערכים אוטומטית לציוד"),
            ("ISER0001", "הרחבת לוגיקת מספרים סידוריים (Serialization)")],
  "badis": [("BADI_EAM_TECHNICAL_OBJECT", "הרחבת לוגיקת ציוד/אובייקט טכני ב-S/4HANA"),
            ("EAM_SERNR_ADD_DATA", "הרחבת נתוני מספר סידורי (אמת שם מדויק ב-SE18)")],
  "arch": ["מודל EQUI/EQUZ/ILOA ללא שינוי; ירושת נתוני מיקום נשמרת.",
           "ב-S/4 אינטגרציה אופציונלית ל-Asset Central Foundation / IoT לניטור מצב.",
           "Classification (סיווג) תואם; שדה MATNR בציוד מושפע מהארכת אורך חומר ל-40 תווים."]},
# 2 - BOM
 {"exits": [("PCSD0001", "הרחבת לקוח לעצי מוצר (BOM) - בדיקות פריטים"),
            ("PCSD0002", "ברירות מחדל לפריטי עץ מוצר")],
  "badis": [("BOM_UPDATE", "BAdI לעדכון/בדיקת עצי מוצר (אמת ב-SE18)"),
            ("BADI_EAM_TECHNICAL_OBJECT", "שיוך BOM לאובייקט טכני ב-S/4")],
  "arch": ["מבני STKO/STPO/MAST/EQST/TPST ללא שינוי; שימוש עץ מוצר 4 (אחזקה) נשמר.",
           "ב-S/4 ניהול BOM גם דרך Fiori; הארכת אורך חומר משפיעה על IDNRK."]},
# 3 - Measuring points & counters
 {"exits": [("IMRC0001", "הרחבת בדיקות בעת קליטת מסמך מדידה"),
            ("IMRC0002", "לוגיקת העברת קריאות ומונים")],
  "badis": [("BADI_EAM_MEASPOINT", "הרחבת נקודות מדידה/מסמכי מדידה (אמת שם ב-SE18)")],
  "arch": ["IMPTT/IMRG ללא שינוי; לוגיקת גלישת מונה נשמרת.",
           "ב-S/4 קליטת קריאות אוטומטית דרך IoT/Asset Central ו-Fiori 'Enter Measurement Readings'."]},
# 4 - Catalogs & customizing
 {"exits": [("QQMA0001", "בדיקות כלליות בקטלוגים/קודים (משותף QM-PM)")],
  "badis": [("BADI_CATALOG", "הרחבת לוגיקת קטלוגים (אמת שם ב-SE18)")],
  "arch": ["קטלוגים, קבוצות קוד ופרופילי קטלוג (T352/T352B) ללא שינוי מבני.",
           "ב-S/4 הקונפיגורציה זהה; ניהול דרך SPRO."]},
# 5 - Notifications
 {"exits": [("QQMA0014", "בדיקת לקוח לפני שמירת הודעה (Check before save)"),
            ("QQMA0010", "הרחבת שדות וברירות מחדל בכותרת ההודעה"),
            ("QQMA0025", "הרחבה בעת השלמת/סגירת הודעה")],
  "badis": [("NOTIF_EVENT_POST", "BAdI לאירוע רישום/שמירת הודעה (לוגיקה לאחר שמירה)"),
            ("NOTIF_EVENT_SAVE", "BAdI לאירוע שמירת הודעה (בדיקות לפני commit)")],
  "arch": ["טבלאות QMEL/QMFE/QMUR/QMMA/QMSM ללא שינוי; ניהול סטטוס זהה.",
           "ב-S/4 'Report Malfunction' (F2215) ו-Maintenance Request כ-UX אסטרטגי; IW21-23 נתמכים בתאימות."]},
# 6 - Orders
 {"exits": [("IWO10009", "הרחבת לקוח לפק\"ע - בדיקות והשלמת שדות בכותרת"),
            ("IWO10002", "בדיקות בעת שמירת פקודת עבודה"),
            ("IWO10012", "בדיקת אישורי עבודה (Permits) בפק\"ע"),
            ("IWO10018", "בדיקת/הרחבת רכיבים בפק\"ע"),
            ("IWO10024", "הרחבת פעולות (Operations) בפק\"ע")],
  "badis": [("WORKORDER_UPDATE", "BAdI לעדכון/בדיקת פקודת עבודה (לפני שמירה)"),
            ("WORKORDER_GOODSMVT", "BAdI לתנועות מלאי בפק\"ע"),
            ("WORKORDER_INFOSYSTEM", "BAdI לרשימות/דוחות פק\"ע (IW38/39)")],
  "arch": ["מודל AUFK/AFKO/AFPO/AFIH מותאם; עלויות בפועל זורמות ל-ACDOCA (Universal Journal).",
           "ב-S/4 'Find/Create Maintenance Order' (F2393) ו-Maintenance Scheduling Board; תזמון פושט.",
           "IWO10009 נתמך; לפיתוח חדש מומלץ WORKORDER_UPDATE."]},
# 7 - Status management
 {"exits": [("STATUS (BS02/BS22)", "סטטוס משתמש מוגדר בפרופיל ולא דרך user-exit ייעודי")],
  "badis": [("BADI_STATUS_MANAGEMENT", "הרחבת לוגיקת סטטוס (אמת שם ב-SE18)")],
  "arch": ["JEST/JSTO/TJ02T/TJ30T ללא שינוי; חוקי החסימה (כגון GI לפני REL) זהים.",
           "ב-S/4 ניהול סטטוס מוטמע באפליקציות Fiori של האובייקט."]},
# 8 - MM integration
 {"exits": [("MB_CF001", "Customer Function לתנועות מלאי (Goods Movement)"),
            ("M06B0001", "הרחבת בדיקות בדרישות רכש (PR)"),
            ("MEREQ001", "הרחבת לקוח לדרישות רכש (חיוב/שדות)")],
  "badis": [("MB_DOCUMENT_BADI", "BAdI למסמך חומר (בדיקות/הרחבה בתנועת מלאי)"),
            ("ME_PROCESS_REQ_CUST", "BAdI לעיבוד דרישת רכש")],
  "arch": ["מסמכי חומר MKPF/MSEG הוחלפו ב-MATDOC (טבלה מאוחדת); MKPF/MSEG הם Compatibility Views.",
           "ספקים נוהלו דרך LFA1 - ב-S/4 דרך Business Partner (BP) עם CVI חובה.",
           "MIGO/MB1A/ME21N נתמכים; הארכת אורך חומר ל-40 תווים משפיעה על ממשקים."]},
# 9 - CO integration
 {"exits": [("COOMEP01", "הרחבת פריטי עלות/התחשבנות (אמת שם מדויק)"),
            ("KOAB0001", "הרחבת חוקי התחשבנות (Settlement)")],
  "badis": [("BADI_SETTLEMENT", "הרחבת לוגיקת התחשבנות (אמת שם ב-SE18)")],
  "arch": ["COSP/COSS/COEP הוחלפו ע\"י Universal Journal (ACDOCA); הטבלאות הישנות נשארות כ-Views.",
           "COBRA/COBRB (חוקי התחשבנות) ללא שינוי לוגי; KO88/KO8G נתמכים.",
           "Margin Analysis (Account-Based COPA) מחליף חלק מ-CO-PA הקלאסי."]},
# 10 - Preventive maintenance
 {"exits": [("IPRM0001", "הרחבת לקוח לתכניות אחזקה (Maintenance Plans)"),
            ("IPRM0002", "הרחבת לוגיקת תזמון (Scheduling)")],
  "badis": [("BADI_EAM_MAINT_PLAN", "הרחבת תכניות אחזקה ותזמון (אמת שם ב-SE18)")],
  "arch": ["PLKO/PLPO/MPLA/MPOS/MHIO/MHIS ללא שינוי; אסטרטגיות וחבילות אחזקה נשמרות.",
           "ב-S/4 'Manage/Schedule Maintenance Plans' (Fiori); IP10/IP30 נתמכים."]},
# 11 - History & archiving
 {"exits": [("ARCH_PM (SARA/AOBJ)", "ארכוב דרך אובייקטי ADK (PM_ORDER/PM_QMEL) ללא user-exit ייעודי")],
  "badis": [("BADI_ARCHIVING", "הרחבת לוגיקת ארכוב/ILM (אמת שם ב-SE18)")],
  "arch": ["מבני RIHAUFK/RIHQMEL (Logical DB) נשמרים; ארכוב דרך SARA זהה.",
           "ב-S/4 SAP ILM אופציונלי; ניתוח היסטורי דרך Embedded Analytics / CDS Views ולא רק PMIS קלאסי."]},
]

# --- Simplification Item list (PM / EAM) ------------------------------------
# (object, item_title, sap_note, category, impact_he)
SIMPLIFICATION = [
 ("MM-IM / PM רכש", "Material Inventory Management - מודל נתונים חדש (MATDOC)",
  "2206980", "הוחלף (Replaced)",
  "MKPF/MSEG מאוחדים ל-MATDOC; קוד Z שקורא ישירות ל-MSEG/MKPF דורש בדיקה. תנועות מלאי לפק\"ע (261/101) ממשיכות לעבוד."),
 ("FI/CO / PM עלויות", "Universal Journal - טבלה אחת (ACDOCA)",
  "2270333", "הוחלף (Replaced)",
  "COSP/COSS/COEP הופכים ל-Compatibility Views; עלויות פק\"ע ב-ACDOCA. התאם דוחות עלות מותאמים אישית."),
 ("MM / PM ספקים", "Business Partner Approach (CVI חובה)",
  "2265093", "הוחלף (Replaced)",
  "ספקים/לקוחות מנוהלים דרך Business Partner; נדרש Customer/Vendor Integration לפני ההמרה. משפיע על PO לשירותים חיצוניים בפק\"ע."),
 ("Cross / PM חומר", "Material Number Field Length Extension (40 תווים)",
  "2267140", "שונה (Changed)",
  "אורך MATNR מורחב ל-40 תווים; בדוק ממשקים, BOM (IDNRK), סריאליזציה ושדות מותאמים."),
 ("EAM / PM כללי", "S4TWL - Plant Maintenance / EAM (פריט פישוט כללי)",
  "(אמת ב-Simplification List)", "שונה (Changed)",
  "רוב מודל ה-PM תואם; שינויי UX ל-Fiori, פישוטי תזמון פק\"ע, והמלצה למעבר מ-GUI ל-EAM Fiori apps."),
 ("EAM / Lists", "List Viewer ב-EAM - מעבר ל-SAPUI5 / Fiori Lists",
  "(אמת ב-Simplification List)", "שונה (Changed)",
  "רשימות IH06/IH08/IW38/IW39 קיימות ב-GUI; אסטרטגית מומלץ Fiori List Reports. בדוק וריאנטים מותאמים."),
 ("EAM / LAM", "Linear Asset Management (LAM) - זמין ב-S/4HANA",
  "(אמת ב-Simplification List)", "חדש (New)",
  "ניהול נכסים ליניאריים (צנרת/כבישים/מסילות) זמין כברירת מחדל ב-S/4; לא קיים סטנדרטית ב-ECC."),
 ("EAM / Mobile", "Mobile Asset Management (SAP Asset Manager)",
  "(אמת ב-Simplification List)", "שונה (Changed)",
  "פתרונות Mobile קלאסיים (MAM/SAP Work Manager) מוחלפים ב-SAP Asset Manager (BTP/Mobile)."),
 ("EAM / Output", "Output Management - מסגרת חדשה (BRF+/Adobe)",
  "(אמת ב-Simplification List)", "שונה (Changed)",
  "הדפסת פק\"ע/הודעה דרך Output Management החדש (BRF+, Adobe Forms) במקום NACE/SAPscript קלאסי."),
 ("EAM / MRS", "Multiresource Scheduling -> Maintenance Scheduling Board",
  "(אמת ב-Simplification List)", "שונה (Changed)",
  "תזמון משאבים מתקדם דרך Maintenance Scheduling Board (Fiori) ו-Resource Scheduling for Maintenance Planners."),
]
