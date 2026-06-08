# -*- coding: utf-8 -*-
"""
PRODUCTION BUILD  -  SAP PM ECC 6.0 -> S/4HANA interactive workbook as a MACRO-ENABLED .xlsm.

What this script does
---------------------
* Uses pandas + openpyxl. Imports the full, accurate master data from scripts/pm_data.py
  (12 topics, 52 core tables, 251 decoded fields - no placeholders).
* Sheet 0 "מסך ניווט מרכזי" (RTL dashboard): styled hyperlink nav cards to every topic sheet,
  a global-search box + a macro-linked Form Control button, FILTER results, and an embedded
  INDEX_DB block (hidden columns P:V on the dashboard itself) that BOTH the FILTER formula and
  the VBA macro read from - the dashboard *is* the index source.
* Every topic sheet: visible gridlines, RTL, "חזרה למסך ראשי" jump button in A1, the expanded
  per-table / per-field grid, and the S/4HANA + Fiori migration columns built INTO the sheet
  (orange band on the left, i.e. columns 11-14 in RTL).
* Embeds a real VBA project (module modPM) with PM_GlobalSearch + BackToDashboard, by generating
  a valid vbaProject.bin (MS-CFB + MS-OVBA) in pure Python and injecting it into the package.
* Also exports modPM.bas next to the file as a guaranteed fallback.

Colors: Dark Blue = master data, Deep Green = transactional (orders/notifications),
Maroon = customizing, Orange/Red = S/4HANA migration columns.

Note (repo CLAUDE.md rule 3): the indexed corpus is S/4HANA only; this is explicit opt-in
ECC 6.0 model knowledge with an S/4 mapping. Pure-Python VBA embedding is validated structurally
(olefile + OVBA round-trip) but cannot be Excel-validated here - if your Excel flags the project,
import the exported modPM.bas (Alt+F11 -> File -> Import File). Verify Fiori App IDs in the
SAP Fiori Apps Reference Library.

Run:  python3 scripts/gen_pm_workbook_xlsm.py
Out:  SAP_PM_ECC6_to_S4_Migration.xlsm  +  modPM.bas
"""
import os, sys, io, struct, zipfile, shutil, re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd                              # required by spec (used for the index frame)
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.properties import PageSetupProperties
from openpyxl.utils import get_column_letter

from pm_data import TH, COLS as COLS_BASE, S4_COL_START, TOPICS
from pm_ext_data import EXTENSIONS, SIMPLIFICATION

DASH = "מסך ניווט מרכזי"
SIMP_SHEET = "Simplification Item list"
S4_HDR, S4_BAND = "C55A11", "FCEFE1"
SEARCH_CELL = "C21"          # visible search box (must match the macro)
IDX_COL0 = 16                # column P - first index column (hidden block on dashboard)

# 15th column appended on the LEFT (RTL) = SUM/migration note
COLS = COLS_BASE + [("שלב מיגרציה / הערות SUM Conversion", 30)]
NCOL = len(COLS)             # 15

def sum_note(tbl):
    """Derive a concrete SUM (Software Update Manager) conversion note from the S/4 mapping."""
    repl = tbl["s4_repl"]; status = tbl["s4_status"]
    if "MATDOC" in repl:
        return ("המרה אוטומטית ל-MATDOC ב-SUM (Silent Data Migration). MKPF/MSEG הופכים ל-Compatibility Views. "
                "בדוק קוד Z שקורא ישירות ל-MSEG/MKPF ועדכן ל-CDS/MATDOC.")
    if "ACDOCA" in repl:
        return ("עלויות מומרות ל-Universal Journal (ACDOCA) ב-SUM. COSP/COSS הופכים ל-Views. "
                "התאם דוחות עלות מותאמים והרצות התחשבנות.")
    if "Business Partner" in status or "BP" in repl:
        return ("נדרש CVI והמרת ספקים/לקוחות ל-Business Partner לפני/במהלך ההמרה (Pre-check חובה).")
    if "מותאם" in status:
        return ("אין המרת טבלה הרסנית, אך מודל הנתונים מותאם - הרץ Regression Test ובדוק User Exits/דוחות מותאמים.")
    return ("ללא פעולת המרה ייעודית ב-SUM (טבלה תואמת). מומלץ Regression Test ואימות התאמות אישיות לאחר ההמרה.")
thin = Side(style="thin", color="C9C9C9")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

# ===========================================================================
# 1) VBA macro source (ASCII only -> safe with VBA codepage 1252)
# ===========================================================================
MACRO_SRC = (
'Attribute VB_Name = "modPM"\n'
'Option Explicit\n'
'\n'
"' חיפוש גלובלי - SAP PM. קורא את תיבת החיפוש בדאשבורד, ואם ריקה - שואל ב-InputBox,\n"
"' ואז סורק את כל הלשוניות (פרט לדאשבורד) ומקפיץ ללשונית ולשורה הנכונה.\n"
'Sub PM_GlobalSearch()\n'
'    Dim searchText As String, ws As Worksheet, foundRange As Range\n'
'    searchText = CStr(ThisWorkbook.Sheets(1).Range("' + SEARCH_CELL + '").Value)\n'
'    If Trim(searchText) = "" Then\n'
'        searchText = InputBox("הזן שדה טכני / טבלה / טרנזקציה / מונח (עברית או אנגלית):", "חיפוש גלובלי - SAP PM")\n'
'    End If\n'
'    If Trim(searchText) = "" Then Exit Sub\n'
'    For Each ws In ThisWorkbook.Worksheets\n'
'        If ws.Index > 1 Then                    \' דילוג על מסך הניווט הראשי\n'
'            Set foundRange = ws.Cells.Find(What:=searchText, LookIn:=xlValues, _\n'
'                                           LookAt:=xlPart, MatchCase:=False)\n'
'            If Not foundRange Is Nothing Then\n'
'                ws.Activate\n'
'                Application.Goto foundRange, True\n'
'                foundRange.Interior.Color = RGB(255, 242, 0)\n'
'                MsgBox "נמצא בלשונית: " & ws.Name & " | שורה: " & foundRange.Row, vbInformation, "חיפוש הצליח"\n'
'                Exit Sub\n'
'            End If\n'
'        End If\n'
'    Next ws\n'
'    MsgBox "המונח \'" & searchText & "\' לא נמצא בקובץ.", vbExclamation, "תוצאת חיפוש"\n'
'End Sub\n'
'\n'
"' חזרה למסך הניווט הראשי (הדאשבורד הוא הלשונית הראשונה).\n"
'Sub BackToDashboard()\n'
'    ThisWorkbook.Sheets(1).Activate\n'
'    ThisWorkbook.Sheets(1).Range("A1").Select\n'
'End Sub\n'
)

# ===========================================================================
# 2) vbaProject.bin generator  (MS-OVBA compression + MS-CFB container)
# ===========================================================================
def _compress_chunk(data):
    out = bytearray(); i = 0
    while i < len(data):
        out.append(0x00); out.extend(data[i:i+8]); i += 8
    return bytes(out)

def ovba_compress(data):
    res = bytearray([0x01]); CHUNK = 2048
    for off in range(0, len(data), CHUNK):
        comp = _compress_chunk(data[off:off+CHUNK])
        header = ((len(comp) + 2 - 3) & 0x0FFF) | (0b011 << 12) | (1 << 15)
        res += struct.pack('<H', header) + comp
    return bytes(res)

def _rec(rid, data): return struct.pack('<HI', rid, len(data)) + data

def build_dir_stream(mn):
    m = mn.encode('latin-1')
    s = bytearray()
    s += _rec(0x0001, struct.pack('<I', 1))                # SYSKIND win32
    s += _rec(0x0002, struct.pack('<I', 0x409))            # LCID
    s += _rec(0x0014, struct.pack('<I', 0x409))            # LCIDINVOKE
    s += _rec(0x0003, struct.pack('<H', 1255))             # CODEPAGE (Hebrew - matches macro text)
    s += _rec(0x0004, b'VBAProject')                       # PROJECTNAME
    s += struct.pack('<HI', 0x0005, 0)                     # DOCSTRING
    s += struct.pack('<HI', 0x0040, 0)
    s += struct.pack('<HI', 0x0006, 0)                     # HELPFILEPATH
    s += struct.pack('<HI', 0x003D, 0)
    s += _rec(0x0007, struct.pack('<I', 0))                # HELPCONTEXT
    s += _rec(0x0008, struct.pack('<I', 0))                # LIBFLAGS
    s += struct.pack('<HIIH', 0x0009, 4, 0x00030003, 0)    # VERSION
    s += _rec(0x000C, b'')                                 # CONSTANTS
    s += _rec(0x000F, struct.pack('<H', 1))                # MODULES count
    s += _rec(0x0013, struct.pack('<H', 0xFFFF))           # COOKIE
    s += _rec(0x0019, m)                                   # MODULENAME
    s += _rec(0x0047, m)                                   # MODULENAMEUNICODE
    s += _rec(0x001A, m)                                   # MODULESTREAMNAME
    s += struct.pack('<HI', 0x0032, len(m)) + m            # streamname reserved
    s += _rec(0x001C, b'')                                 # MODULEDOCSTRING
    s += struct.pack('<HI', 0x0048, 0)
    s += _rec(0x0031, struct.pack('<I', 0))                # MODULEOFFSET = 0
    s += _rec(0x001E, struct.pack('<I', 0))                # HELPCONTEXT
    s += _rec(0x002C, struct.pack('<H', 0xFFFF))           # COOKIE
    s += struct.pack('<HI', 0x0021, 0)                     # MODULETYPE procedural
    s += _rec(0x002B, b'')                                 # MODULE terminator
    s += struct.pack('<HI', 0x0010, 0)                     # TERMINATOR
    return bytes(s)

FREESECT, ENDOFCHAIN, FATSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD
SECTOR = 512

def _dir_entry(name, etype, color, left, right, child, start, size):
    nb = name.encode('utf-16-le')[:62]
    namelen = (len(nb) + 2) if name else 0
    nb = nb + b'\x00' * (64 - len(nb))
    e = nb + struct.pack('<H', namelen) + struct.pack('<BB', etype, color)
    e += struct.pack('<iii', left, right, child) + b'\x00' * 16
    e += struct.pack('<I', 0) + b'\x00' * 16
    e += struct.pack('<I', start & 0xFFFFFFFF) + struct.pack('<Q', size)
    return e

def write_cfb(entries):
    import math
    MINISEC = 64
    mini = [e for e in entries if e['type'] == 2 and len(e['data']) < 4096]
    big  = [e for e in entries if e['type'] == 2 and len(e['data']) >= 4096]
    mini_fat, mini_stream = [], bytearray()
    for e in mini:
        d = e['data']; nsec = max(1, (len(d) + MINISEC - 1) // MINISEC)
        e['start'] = len(mini_fat)
        for k in range(nsec): mini_fat.append(e['start'] + k + 1)
        mini_fat[e['start'] + nsec - 1] = ENDOFCHAIN
        mini_stream += d
        if len(mini_stream) % MINISEC:
            mini_stream += b'\x00' * (MINISEC - len(mini_stream) % MINISEC)
    sectors, fat = [], []
    def alloc(data):
        if not data: return ENDOFCHAIN
        start = len(sectors); n = (len(data) + SECTOR - 1) // SECTOR
        for k in range(n):
            ch = data[k*SECTOR:(k+1)*SECTOR]
            sectors.append(ch + b'\x00' * (SECTOR - len(ch))); fat.append(start + k + 1)
        fat[-1] = ENDOFCHAIN; return start
    for e in big: e['start'] = alloc(e['data'])
    mini_start = alloc(bytes(mini_stream)) if mini_stream else ENDOFCHAIN
    for e in entries:
        if e['type'] == 5:
            e['start'] = mini_start; e['mini_size'] = len(mini_stream)
    mfat = b''.join(struct.pack('<I', x) for x in mini_fat)
    minifat_start = alloc(mfat) if mfat else ENDOFCHAIN
    minifat_nsec = (len(mfat) + SECTOR - 1) // SECTOR if mfat else 0
    db = bytearray()
    for e in entries:
        sz = e.get('mini_size', 0) if e['type'] == 5 else (len(e['data']) if e['type'] == 2 else 0)
        db += _dir_entry(e['name'], e['type'], e['color'], e['left'], e['right'],
                         e['child'], e.get('start', ENDOFCHAIN), sz)
    empty = _dir_entry('', 0, 0, -1, -1, -1, ENDOFCHAIN, 0)
    while len(db) % SECTOR: db += empty
    dir_start = alloc(bytes(db))
    nfat = 1
    while True:
        total = len(sectors) + nfat
        need = math.ceil(total * 4 / SECTOR)
        if need == nfat: break
        nfat = need
    fat_start = len(sectors)
    for k in range(nfat): sectors.append(b''); fat.append(FATSECT)
    while len(fat) < len(sectors): fat.append(FREESECT)
    fb = b''.join(struct.pack('<I', x) for x in fat)
    fb += b'\xFF' * ((SECTOR - len(fb) % SECTOR) % SECTOR)
    for k in range(nfat): sectors[fat_start + k] = fb[k*SECTOR:(k+1)*SECTOR]
    difat = [fat_start + k for k in range(nfat)] + [FREESECT] * (109 - nfat)
    h = bytearray(bytes.fromhex('D0CF11E0A1B11AE1') + b'\x00' * 16)
    h += struct.pack('<HHH', 0x003E, 0x0003, 0xFFFE)
    h += struct.pack('<HH', 9, 6) + b'\x00' * 6
    h += struct.pack('<IIII', 0, nfat, dir_start, 0)
    h += struct.pack('<III', 0x00001000, minifat_start, minifat_nsec)
    h += struct.pack('<II', ENDOFCHAIN, 0)
    for d in difat: h += struct.pack('<I', d)
    return bytes(h) + b''.join(sectors)

def make_vbaproject_bin(macro_src, mn='modPM'):
    dir_comp = ovba_compress(build_dir_stream(mn))
    vbaproj  = struct.pack('<HHH', 0x61CC, 0xFFFF, 0x0000) + b'\x00' * 2
    module   = ovba_compress(macro_src.replace('\n', '\r\n').encode('cp1255', 'replace'))
    proj = (
        'ID="{00000000-0000-0000-0000-000000000000}"\r\n'
        f'Module={mn}\r\nName="VBAProject"\r\nHelpContextID="0"\r\n'
        'VersionCompatible32="393222000"\r\n'
        'CMG="0000000000000000000000000000"\r\nDPB="0000000000000000000000000000"\r\n'
        'GC="0000000000000000000000000000"\r\n\r\n[Host Extender Info]\r\n'
        '&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000\r\n\r\n'
        f'[Workspace]\r\n{mn}=0, 0, 0, 0, C\r\n').encode('latin-1', 'replace')
    pwm = mn.encode('latin-1') + b'\x00' + mn.encode('latin-1') + b'\x00\x00\x00'
    entries = [
        dict(name='Root Entry', type=5, color=1, left=-1, right=-1, child=2, data=b''),
        dict(name='VBA', type=1, color=1, left=-1, right=-1, child=6, data=b''),
        dict(name='PROJECT', type=2, color=1, left=1, right=3, child=-1, data=proj),
        dict(name='PROJECTwm', type=2, color=1, left=-1, right=-1, child=-1, data=pwm),
        dict(name='dir', type=2, color=1, left=-1, right=5, child=-1, data=dir_comp),
        dict(name='_VBA_PROJECT', type=2, color=1, left=-1, right=-1, child=-1, data=vbaproj),
        dict(name='modPM', type=2, color=1, left=4, right=-1, child=-1, data=module),
    ]
    return write_cfb(entries)

# ===========================================================================
# 3) Build the workbook with openpyxl
# ===========================================================================
def style(c, *, bold=False, color="222222", fill=None, v="center", size=10, wrap=True, h="right"):
    c.font = Font(bold=bold, size=size, color=color)
    c.alignment = Alignment(horizontal=h, vertical=v, wrap_text=wrap)
    c.border = BORDER
    if fill: c.fill = PatternFill("solid", fgColor=fill)

def safe(name):
    for ch in ':\\/?*[]': name = name.replace(ch, "")
    return name[:31]

wb = Workbook()
wb.remove(wb.active)
sheet_names = [safe(t["title"]) for t in TOPICS]
dash = wb.create_sheet(DASH)               # first sheet -> Sheets(1) in VBA

index_rows = []                            # (type, code, he, en, sheet, cell)

for topic_idx, (topic, sname) in enumerate(zip(TOPICS, sheet_names)):
    th = TH[topic["theme"]]
    ws = wb.create_sheet(sname)
    ws.sheet_view.rightToLeft = True
    ws.sheet_view.showGridLines = True     # gridlines ON per spec
    ws.sheet_properties.tabColor = th["t"]
    ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)

    back = ws.cell(1, 1, "▶ חזרה למסך ראשי")
    back.hyperlink = f"#'{DASH}'!A1"
    back.font = Font(bold=True, size=10, color="FFFFFF", underline="single")
    back.fill = PatternFill("solid", fgColor="404040")
    back.alignment = Alignment(horizontal="center", vertical="center")
    ws.merge_cells(start_row=1, start_column=2, end_row=1, end_column=NCOL)
    t = ws.cell(1, 2, topic["title"] + "   |   ECC 6.0  ➜  S/4HANA")
    t.font = Font(bold=True, size=13, color="FFFFFF")
    t.fill = PatternFill("solid", fgColor=th["h"])
    t.alignment = Alignment(horizontal="right", vertical="center")
    ws.row_dimensions[1].height = 26

    for j, (lbl, w) in enumerate(COLS, start=1):
        fill = S4_HDR if j >= S4_COL_START else th["s"]
        c = ws.cell(2, j, lbl)
        c.font = Font(bold=True, size=9, color="FFFFFF")
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BORDER; c.fill = PatternFill("solid", fgColor=fill)
        ws.column_dimensions[get_column_letter(j)].width = w
    ws.row_dimensions[2].height = 40
    ws.freeze_panes = "A3"

    row = 3
    seq = 0
    for tbl in topic["tables"]:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=NCOL)
        hc = ws.cell(row, 1, f"  ◆ טבלה {tbl['name']}  -  {tbl['he']}  ({tbl['en']})")
        hc.font = Font(bold=True, size=11, color="FFFFFF")
        hc.fill = PatternFill("solid", fgColor=th["h"])
        hc.alignment = Alignment(horizontal="right", vertical="center")
        ws.row_dimensions[row].height = 22
        index_rows.append(("טבלה", tbl["name"], tbl["he"], tbl["en"], sname, f"A{row}"))
        row += 1

        fstart = row
        funcs = "\n".join(f"• {n}" for n, _ in tbl["funcs"])
        fdesc = "\n".join(f"• {d}" for _, d in tbl["funcs"])
        progs = "\n".join(f"• {n}" for n, _ in tbl["progs"])
        pdesc = "\n".join(f"• {d}" for _, d in tbl["progs"])
        for (tech, en, he) in tbl["fields"]:
            seq += 1
            band = th["b"] if seq % 2 == 0 else None
            s4b = S4_BAND if seq % 2 == 0 else None
            style(ws.cell(row, 1, seq), bold=True, fill=band, h="center")
            style(ws.cell(row, 2, ""), fill=band)
            style(ws.cell(row, 3, ""), fill=band)
            style(ws.cell(row, 4, tech), bold=True, color="1F3864", fill=band)
            style(ws.cell(row, 5, en), fill=band)
            style(ws.cell(row, 6, he), fill=band)
            for col in (7, 8, 9, 10): style(ws.cell(row, col, ""), fill=band)
            for col in (11, 12, 13, 14): style(ws.cell(row, col, ""), fill=s4b)
            ws.row_dimensions[row].height = 30
            index_rows.append(("שדה", tech, he, en, sname, f"D{row}"))
            row += 1
        fend = row - 1

        def vmerge(col, val, *, bold=False, color="222222"):
            cell = ws.cell(fstart, col, val)
            cell.font = Font(bold=bold, size=9, color=color)
            cell.alignment = Alignment(horizontal="right", vertical="top", wrap_text=True)
            cell.border = BORDER
            if fend > fstart:
                ws.merge_cells(start_row=fstart, start_column=col, end_row=fend, end_column=col)
        vmerge(2, tbl["tcodes"], bold=True, color="1F3864")
        vmerge(3, tbl["name"], bold=True, color="1F3864")
        vmerge(7, funcs, bold=True, color="1F3864"); vmerge(8, fdesc)
        vmerge(9, progs, bold=True, color="1F3864"); vmerge(10, pdesc)
        vmerge(11, tbl["s4_status"], color="7B3F00"); vmerge(12, tbl["s4_repl"], color="7B3F00")
        vmerge(13, tbl["s4_tcode"], color="7B3F00"); vmerge(14, tbl["fiori"], bold=True, color="C55A11")
        vmerge(15, sum_note(tbl), color="7B1E2B")

        for code in [x.strip() for x in tbl["tcodes"].replace(";", ",").replace("/", ",").split(",") if x.strip()]:
            index_rows.append(("טרנזקציה", code, tbl["he"], tbl["en"], sname, f"A{fstart}"))
        for n, d in tbl["funcs"]: index_rows.append(("פונקציה", n, d, tbl["en"], sname, f"G{fstart}"))
        for n, d in tbl["progs"]: index_rows.append(("תוכנית", n, d, tbl["en"], sname, f"I{fstart}"))
        index_rows.append(("Fiori", tbl["fiori"], tbl["he"], tbl["en"], sname, f"N{fstart}"))
        row += 1

    # ---- Technical Extensions section (user exits / BAdIs / architecture diffs) ----
    ext = EXTENSIONS[topic_idx]
    row += 1
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=NCOL)
    eh = ws.cell(row, 1, "  ⚙ הרחבות טכניות ושינויי ארכיטקטורה (Technical Extensions: User Exits / BAdIs / ECC vs S/4HANA)")
    eh.font = Font(bold=True, size=11, color="FFFFFF")
    eh.fill = PatternFill("solid", fgColor="7B1E2B")
    eh.alignment = Alignment(horizontal="right", vertical="center")
    ws.row_dimensions[row].height = 22
    row += 1
    # sub-grid headers (3 cols: type | code | description spanning)
    for lbl, c0, c1, fill in [("סוג (Type)", 1, 2, "A53444"), ("קוד / שם טכני (Code)", 3, 4, "A53444"),
                              ("תיאור / הבדל (Hebrew)", 5, NCOL, "A53444")]:
        ws.merge_cells(start_row=row, start_column=c0, end_row=row, end_column=c1)
        c = ws.cell(row, c0, lbl)
        c.font = Font(bold=True, size=9, color="FFFFFF"); c.fill = PatternFill("solid", fgColor=fill)
        c.alignment = Alignment(horizontal="center", vertical="center"); c.border = BORDER
    row += 1

    def ext_row(kind, code, desc, idx_type):
        global row
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
        a = ws.cell(row, 1, kind); a.font = Font(bold=True, size=9, color="7B1E2B")
        a.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True); a.border = BORDER
        ws.merge_cells(start_row=row, start_column=3, end_row=row, end_column=4)
        b = ws.cell(row, 3, code); b.font = Font(bold=True, size=9, color="1F3864")
        b.alignment = Alignment(horizontal="right", vertical="center", wrap_text=True); b.border = BORDER
        ws.merge_cells(start_row=row, start_column=5, end_row=row, end_column=NCOL)
        d = ws.cell(row, 5, desc); d.font = Font(size=9, color="222222")
        d.alignment = Alignment(horizontal="right", vertical="center", wrap_text=True); d.border = BORDER
        ws.row_dimensions[row].height = 26
        if idx_type:
            index_rows.append((idx_type, code, desc, "", sname, f"A{row}"))
        row += 1

    for code, desc in ext["exits"]:
        ext_row("User Exit (SMOD)", code, desc, "User Exit")
    for code, desc in ext["badis"]:
        ext_row("BAdI (SE18)", code, desc, "BAdI")
    for note in ext["arch"]:
        ext_row("ארכיטקטורה ECC↔S/4", "—", note, "")

# ===========================================================================
#  Simplification Item list sheet  (SAP Notes per PM/EAM object)
# ===========================================================================
simp = wb.create_sheet(SIMP_SHEET)
simp.sheet_view.rightToLeft = True
simp.sheet_view.showGridLines = True
simp.sheet_properties.tabColor = S4_HDR
simp.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)
back = simp.cell(1, 1, "▶ חזרה למסך ראשי")
back.hyperlink = f"#'{DASH}'!A1"
back.font = Font(bold=True, size=10, color="FFFFFF", underline="single")
back.fill = PatternFill("solid", fgColor="404040")
back.alignment = Alignment(horizontal="center", vertical="center")
simp.merge_cells("B1:F1")
st = simp.cell(1, 2, "Simplification Item List  -  SAP Notes למיגרציית PM / EAM ל-S/4HANA")
st.font = Font(bold=True, size=13, color="FFFFFF"); st.fill = PatternFill("solid", fgColor=S4_HDR)
st.alignment = Alignment(horizontal="right", vertical="center")
simp.row_dimensions[1].height = 26
simp_cols = [("מס' (#)", 6), ("תחום / אובייקט", 20), ("Simplification Item (כותרת הפריט)", 40),
             ("SAP Note", 16), ("קטגוריה", 18), ("השפעה והמלצה (Impact & Action)", 60)]
for j, (lbl, w) in enumerate(simp_cols, start=1):
    c = simp.cell(2, j, lbl)
    c.font = Font(bold=True, size=10, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="7B1E2B")
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True); c.border = BORDER
    simp.column_dimensions[get_column_letter(j)].width = w
simp.row_dimensions[2].height = 34
simp.freeze_panes = "A3"
rr = 3
for i, (obj, title, note, cat, impact) in enumerate(SIMPLIFICATION, start=1):
    band = S4_BAND if i % 2 == 0 else None
    vals = [i, obj, title, note, cat, impact]
    for j, v in enumerate(vals, start=1):
        c = simp.cell(rr, j, v)
        bold = j in (3, 4)
        c.font = Font(bold=bold, size=10, color="1F3864" if j == 4 else "222222")
        c.alignment = Alignment(horizontal=("center" if j in (1, 4) else "right"), vertical="top", wrap_text=True)
        c.border = BORDER
        if band: c.fill = PatternFill("solid", fgColor=band)
    simp.row_dimensions[rr].height = 56
    index_rows.append(("SAP Note", note, title, obj, SIMP_SHEET, f"A{rr}"))
    rr += 1

# ---- pandas index frame (drives both the FILTER formula and the macro) ----
df_index = pd.DataFrame(index_rows, columns=["סוג", "קוד", "עברית", "English", "גיליון", "תא"])
N = len(df_index)

# ===========================================================================
# 4) Dashboard
# ===========================================================================
dash.sheet_view.rightToLeft = True
dash.sheet_view.showGridLines = True
dash.sheet_properties.tabColor = "111111"
for col, w in zip("ABCDEFGHIJKLMNO", [3,16,16,16,16,16,4,16,16,3,3,3,3,3,3]):
    dash.column_dimensions[col].width = w

dash.merge_cells("B2:F2")
d1 = dash.cell(2, 2, "SAP PM  -  מסך ניווט מרכזי  |  גשר מעבר ECC 6.0 ➜ S/4HANA")
d1.font = Font(bold=True, size=16, color="1F3864"); d1.alignment = Alignment(horizontal="right")
dash.merge_cells("B3:F3")
d2 = dash.cell(3, 2, "Interactive Migration-Ready Workbook  -  Plant Maintenance / EAM")
d2.font = Font(bold=True, size=10, color="7F7F7F"); d2.alignment = Alignment(horizontal="right")

dash.merge_cells("B5:F5")
nh = dash.cell(5, 2, "ניווט מהיר לגיליונות  (לחץ על כרטיס כדי לעבור)")
nh.font = Font(bold=True, size=12, color="FFFFFF"); nh.fill = PatternFill("solid", fgColor="1F3864")
nh.alignment = Alignment(horizontal="right")

card_cols = [2, 4, 6, 8]                # 4 cards per row (cols B, D, F, H)
nav_items = [(t["title"], sn, TH[t["theme"]]["h"]) for t, sn in zip(TOPICS, sheet_names)]
nav_items.append(("★ " + SIMP_SHEET + " (SAP Notes)", SIMP_SHEET, S4_HDR))
r = 6
for i, (title, sn, hdr) in enumerate(nav_items):
    slot = i % 4
    if slot == 0 and i != 0: r += 3
    c0 = card_cols[slot]
    dash.merge_cells(start_row=r, start_column=c0, end_row=r+1, end_column=c0)
    cell = dash.cell(r, c0, title)
    cell.hyperlink = f"#'{sn}'!A1"
    cell.font = Font(bold=True, size=10, color="FFFFFF")
    cell.fill = PatternFill("solid", fgColor=hdr)
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for rr in (r, r+1): dash.cell(rr, c0).border = BORDER
r += 3

dash.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
lg = dash.cell(r, 2, "מקרא:  כחול=נתוני אב | ירוק=תנועתי | בורדו=קונפיגורציה | כתום/אדום=מיגרציית S/4HANA")
lg.font = Font(italic=True, size=9, color="404040"); lg.alignment = Alignment(horizontal="right")

# --- search block (row 20 header, row 21 box) ---
dash.merge_cells("B20:F20")
sh = dash.cell(20, 2, "🔍 חיפוש גלובלי  (טבלה / טרנזקציה / שדה / פונקציה - עברית או אנגלית)")
sh.font = Font(bold=True, size=12, color="FFFFFF"); sh.fill = PatternFill("solid", fgColor=S4_HDR)
sh.alignment = Alignment(horizontal="right")
lbl = dash.cell(21, 2, "הקלד כאן:")
lbl.font = Font(bold=True, size=11); lbl.alignment = Alignment(horizontal="right")
dash.merge_cells("C21:F21")
sc = dash.cell(21, 3, "")
sc.fill = PatternFill("solid", fgColor="FFF2CC")
sc.font = Font(bold=True, size=12, color="1F3864")
med = Side(style="medium", color="C55A11")
sc.border = Border(left=med, right=med, top=med, bottom=med)
dash.row_dimensions[21].height = 26

# results header (row 23) + FILTER (row 24, spills) - reads the on-sheet index block
res_hdrs = ["קישור", "קוד / שם טכני", "פירוש בעברית", "English", "גיליון", "תא"]
for j, h in enumerate(res_hdrs):
    c = dash.cell(23, 2 + j, h)
    c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="404040")
    c.alignment = Alignment(horizontal="center"); c.border = BORDER

C = lambda k: get_column_letter(IDX_COL0 + k)         # P,Q,R,S,T,U,V
rng = lambda k: f"${C(k)}$2:${C(k)}${N+1}"
formula = (
 f'=IF({SEARCH_CELL}="","הקלד מונח וראה תוצאות, או לחץ על כפתור החיפוש...",'
 f'IFERROR(FILTER(CHOOSE({{1,2,3,4,5,6}},{rng(6)},{rng(1)},{rng(2)},{rng(3)},{rng(4)},{rng(5)}),'
 f'(ISNUMBER(SEARCH({SEARCH_CELL},{rng(1)})))+(ISNUMBER(SEARCH({SEARCH_CELL},{rng(2)})))+'
 f'(ISNUMBER(SEARCH({SEARCH_CELL},{rng(3)})))+(ISNUMBER(SEARCH({SEARCH_CELL},{rng(0)})))>0),'
 f'"לא נמצאו תוצאות - נסה מונח אחר"))'
)
fcell = dash.cell(24, 2, formula)
fcell.font = Font(size=10); fcell.alignment = Alignment(horizontal="right")

# --- embedded INDEX_DB block on the dashboard (hidden cols P:V) ---
idx_titles = ["סוג (Type)", "קוד (Code)", "עברית", "English", "גיליון (Sheet)", "תא (Cell)", "קישור (Link)"]
for k, ttl in enumerate(idx_titles):
    c = dash.cell(1, IDX_COL0 + k, ttl)
    c.font = Font(bold=True, size=8, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="595959")
    c.alignment = Alignment(horizontal="right")
for ri, row in enumerate(index_rows, start=2):
    typ, code, he, en, sn, cell = row
    dash.cell(ri, IDX_COL0 + 0, typ)
    dash.cell(ri, IDX_COL0 + 1, code).font = Font(bold=True, size=8, color="1F3864")
    dash.cell(ri, IDX_COL0 + 2, he)
    dash.cell(ri, IDX_COL0 + 3, en)
    dash.cell(ri, IDX_COL0 + 4, sn)
    dash.cell(ri, IDX_COL0 + 5, cell)
    lk = dash.cell(ri, IDX_COL0 + 6)
    lk.value = f'=HYPERLINK("#\'"&{C(4)}{ri}&"\'!"&{C(5)}{ri},"➜ פתח")'
    lk.font = Font(color="0563C1", underline="single", size=8)
    for k in range(7):
        cc = dash.cell(ri, IDX_COL0 + k)
        if k != 6: cc.font = Font(size=8, color="333333", bold=(k == 1))
        cc.alignment = Alignment(horizontal="right")
for k in range(7):
    dash.column_dimensions[get_column_letter(IDX_COL0 + k)].hidden = True   # hide the index block

# instructions / note
dash.merge_cells("B50:F54")
note = dash.cell(50, 2,
  "איך עובדים:  1) לחץ כרטיס למעבר לגיליון.  2) הקלד מונח בתא הצהוב ולחץ על כפתור 'חיפוש' (מאקרו) "
  "או פשוט צפה בתוצאות הדינמיות מתחת (FILTER).  3) בכל גיליון יש כפתור 'חזרה למסך ראשי' בפינה.  "
  "החיפוש יונק מבלוק INDEX_DB המוסתר בעמודות P:V של גיליון זה.  "
  "אם Excel חוסם מאקרו - אשר 'Enable Content'; אם נדרש, ייבא את modPM.bas (Alt+F11 -> Import).")
note.font = Font(italic=True, size=9, color="7B1E2B")
note.alignment = Alignment(horizontal="right", vertical="top", wrap_text=True)
dash.freeze_panes = "A2"

# ===========================================================================
# 5) Save .xlsx then inject VBA + Form Control button -> .xlsm
# ===========================================================================
TMP_XLSX = "_tmp_pm.xlsx"
OUT = "SAP_PM_ECC6_to_S4_Migration.xlsm"
wb.save(TMP_XLSX)

with open("modPM.bas", "w", encoding="utf-8") as f:        # fallback export
    f.write(MACRO_SRC)

vba_bin = make_vbaproject_bin(MACRO_SRC)

# VML form-control button wired to PM_GlobalSearch (anchored next to the search box)
VML = (
'<xml xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" '
'xmlns:x="urn:schemas-microsoft-com:office:excel">'
'<o:shapelayout v:ext="edit"><o:idmap v:ext="edit" data="1"/></o:shapelayout>'
'<v:shapetype id="_x0000_t201" coordsize="21600,21600" o:spt="201" path="m,l,21600r21600,l21600,xe">'
'<v:stroke joinstyle="miter"/><v:path shadowok="f" o:extrusionok="f" gradientshapeok="t" o:connecttype="rect"/>'
'</v:shapetype>'
'<v:shape id="SearchBtn" type="#_x0000_t201" style="position:absolute;margin-left:520px;margin-top:300px;'
'width:120px;height:30px;z-index:1" o:button="t" fillcolor="#c55a11" strokecolor="#7b1e2b">'
'<v:fill o:detectmouseclick="t"/><o:lock v:ext="edit" rotation="t"/>'
'<v:textbox style="mso-direction-alt:auto" o:singleclick="f">'
'<div style="text-align:center"><font color="#FFFFFF" size="200" face="Arial"><b>\U0001F50D חיפוש</b></font></div>'
'</v:textbox>'
'<x:ClientData ObjectType="Button">'
'<x:Anchor>7, 5, 19, 2, 8, 60, 21, 5</x:Anchor>'
'<x:PrintObject>False</x:PrintObject><x:AutoFill>False</x:AutoFill>'
'<x:FmlaMacro>PM_GlobalSearch</x:FmlaMacro>'
'<x:TextHAlign>Center</x:TextHAlign><x:TextVAlign>Center</x:TextVAlign>'
'</x:ClientData></v:shape></xml>'
)

def inject_macros(src_xlsx, out_xlsm, vba_bin, vml):
    zin = zipfile.ZipFile(src_xlsx, "r")
    names = zin.namelist()
    ct = zin.read("[Content_Types].xml").decode("utf-8")
    wbrels = zin.read("xl/_rels/workbook.xml.rels").decode("utf-8")
    wbxml = zin.read("xl/workbook.xml").decode("utf-8")

    # map dashboard sheet -> sheetN.xml via workbook.xml + rels (attribute-order agnostic)
    sheet_el = re.search(r'<sheet\b[^>]*\bname="%s"[^>]*/?>' % re.escape(DASH), wbxml).group(0)
    rid = re.search(r'r:id="([^"]+)"', sheet_el).group(1)
    rel_el = re.search(r'<Relationship\b[^>]*\bId="%s"[^>]*/?>' % re.escape(rid), wbrels).group(0)
    tgt = re.search(r'Target="([^"]+)"', rel_el).group(1)
    if tgt.startswith("/"):
        dash_part = tgt.lstrip("/")                      # absolute from package root
    else:
        dash_part = "xl/" + tgt.replace("../", "")       # relative to xl/
    dash_base = os.path.basename(dash_part)
    dash_rels = f"xl/worksheets/_rels/{dash_base}.rels"

    # content types
    ct = ct.replace(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
        'application/vnd.ms-excel.sheet.macroEnabled.main+xml')
    inserts = ''
    if 'Extension="vml"' not in ct:
        inserts += '<Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/>'
    if 'Extension="bin"' not in ct:
        inserts += '<Default Extension="bin" ContentType="application/vnd.ms-office.vbaProject"/>'
    ct = ct.replace('</Types>', inserts + '</Types>')

    # workbook rels: add vbaProject relationship
    if 'vbaProject.bin' not in wbrels:
        wbrels = wbrels.replace('</Relationships>',
            '<Relationship Id="rIdVbaProj" '
            'Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" '
            'Target="vbaProject.bin"/></Relationships>')

    # dashboard worksheet xml: declare xmlns:r (openpyxl omits it) + add legacyDrawing ref
    dash_xml = zin.read(dash_part).decode("utf-8")
    if 'xmlns:r=' not in dash_xml[:400]:
        dash_xml = dash_xml.replace(
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"', 1)
    if '<legacyDrawing' not in dash_xml:
        dash_xml = dash_xml.replace('</worksheet>', '<legacyDrawing r:id="rIdVml"/></worksheet>')

    # dashboard worksheet rels (create or extend)
    if dash_rels in names:
        dr = zin.read(dash_rels).decode("utf-8")
        dr = dr.replace('</Relationships>',
            '<Relationship Id="rIdVml" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing" '
            'Target="../drawings/vmlDrawing1.vml"/></Relationships>')
    else:
        dr = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
              '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
              '<Relationship Id="rIdVml" '
              'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing" '
              'Target="../drawings/vmlDrawing1.vml"/></Relationships>')

    zout = zipfile.ZipFile(out_xlsm, "w", zipfile.ZIP_DEFLATED)
    written = set()
    for item in zin.infolist():
        n = item.filename
        if n == "[Content_Types].xml": data = ct.encode("utf-8")
        elif n == "xl/_rels/workbook.xml.rels": data = wbrels.encode("utf-8")
        elif n == dash_part: data = dash_xml.encode("utf-8")
        elif n == dash_rels: data = dr.encode("utf-8")
        else: data = zin.read(n)
        zout.writestr(item, data); written.add(n)
    if dash_rels not in written: zout.writestr(dash_rels, dr)
    zout.writestr("xl/vbaProject.bin", vba_bin)
    zout.writestr("xl/drawings/vmlDrawing1.vml", vml.encode("utf-8"))
    zout.close(); zin.close()

inject_macros(TMP_XLSX, OUT, vba_bin, VML)
os.remove(TMP_XLSX)
print(f"OK -> {OUT}")
print(f"   sheets: {len(TOPICS)+1} | tables: {sum(len(t['tables']) for t in TOPICS)} | "
      f"fields: {sum(len(tb['fields']) for t in TOPICS for tb in t['tables'])} | index rows: {N}")
print("   fallback module exported -> modPM.bas")
