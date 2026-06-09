# -*- coding: utf-8 -*-
"""
Build a single-file responsive web portal (index.html) mirroring the SAP PM workbook.

Mobile-first (Tailwind CSS, RTL Hebrew), CBC Coca-Cola Red (#D62027) / Dark Slate (#1E1E24)
branding. Renders the full 58 tables with Key Type (PK/FK), JOIN ON SQL syntax, Hebrew
functional descriptions, the S/4HANA + Fiori matrix with live SAP ecosystem hyperlinks,
the encyclopedic Config Guide, the Simplification list (SAP Notes), and a dynamic
status-updating Migration Cockpit with live KPIs (persisted to localStorage).

Single source of truth: pm_data + pm_ext_data + pm_rel_data.

Run:  python3 scripts/gen_web_portal.py
Out:  index.html  (repo root)
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pm_data import TOPICS
from pm_ext_data import EXTENSIONS, SIMPLIFICATION
from pm_rel_data import key_type, JOINS, CONFIG_GUIDE


def sum_note(tbl):
    repl, status = tbl["s4_repl"], tbl["s4_status"]
    if "MATDOC" in repl:
        return "המרה אוטומטית ל-MATDOC ב-SUM. MKPF/MSEG הופכים ל-Views. בדוק קוד Z שקורא ל-MSEG/MKPF."
    if "ACDOCA" in repl:
        return "עלויות מומרות ל-Universal Journal (ACDOCA) ב-SUM. COSP/COSS הופכים ל-Views."
    if "Business Partner" in status or "BP" in repl:
        return "נדרש CVI והמרת ספקים/לקוחות ל-Business Partner לפני/במהלך ההמרה (Pre-check חובה)."
    if "מותאם" in status:
        return "אין המרת טבלה הרסנית, אך מודל הנתונים מותאם - הרץ Regression Test."
    return "ללא פעולת המרה ייעודית ב-SUM (טבלה תואמת). מומלץ Regression Test."


# ---- build the JS data model ----------------------------------------------
topics_js = []
cockpit = []
for ti, t in enumerate(TOPICS):
    tables = []
    for tb in t["tables"]:
        tables.append({
            "name": tb["name"], "he": tb["he"], "en": tb["en"], "tcodes": tb["tcodes"],
            "fields": [{"tech": f[0], "en": f[1], "he": f[2], "key": key_type(tb["name"], f[0])}
                       for f in tb["fields"]],
            "funcs": tb["funcs"], "progs": tb["progs"],
            "s4_status": tb["s4_status"], "s4_repl": tb["s4_repl"],
            "s4_tcode": tb["s4_tcode"], "fiori": tb["fiori"], "sum": sum_note(tb),
        })
        cockpit.append({"table": tb["name"], "he": tb["he"], "topic": t["title"]})
    ext = EXTENSIONS[ti]
    topics_js.append({
        "idx": ti, "title": t["title"], "theme": t["theme"], "tables": tables,
        "ext": {"exits": ext["exits"], "badis": ext["badis"], "arch": ext["arch"]},
    })

joins_js = [{"child": c, "fk": fk, "parent": p, "pk": pk, "card": card,
             "join_on": f"{c}.{fk} = {p}.{pk}", "desc": d} for (c, fk, p, pk, card, d) in JOINS]

config_js = [{"obj": o, "tcode": tc, "guide": g, "term": term,
              "help_url": hu, "help_lbl": hl, "ext_url": eu, "ext_lbl": el}
             for (o, tc, g, term, hu, hl, eu, el) in CONFIG_GUIDE]

simp_js = [{"obj": o, "title": ti2, "note": n, "cat": c, "impact": im}
           for (o, ti2, n, c, im) in SIMPLIFICATION]

DATA = {
    "topics": topics_js,
    "joins": joins_js,
    "config": config_js,
    "simplification": simp_js,
    "cockpit": cockpit,
    "statuses": ["Not started", "In analysis", "In conversion", "Tested", "Done"],
}

HTML = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAP PM - Project NEO | CBC Israel</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root{ --red:#D62027; --redhot:#F40009; --slate:#1E1E24; --slate2:#2B2B33;
         --silver:#8A9EA7; --zebra:#F9FAFB; --grid:#E5E7EB; --ink:#1F2937; }
  *{font-family:'Segoe UI',system-ui,Arial,sans-serif;}
  body{background:#F7F8FA;color:var(--ink);}
  .brand-red{background:var(--red);} .brand-slate{background:var(--slate);}
  .txt-red{color:var(--red);} .txt-slate{color:var(--slate);}
  .navbtn{transition:all .15s;border-right:3px solid transparent;}
  .navbtn:hover{background:#2B2B33;} .navbtn.active{background:#2B2B33;border-right:3px solid var(--redhot);}
  table{border-collapse:collapse;width:100%;}
  th,td{border:1px solid var(--grid);padding:6px 8px;vertical-align:top;font-size:13px;}
  thead th{background:var(--slate);color:#fff;position:sticky;top:0;}
  tbody tr:nth-child(even){background:var(--zebra);}
  .s4 th{background:var(--silver) !important;color:var(--slate) !important;}
  code{font-family:Consolas,'Courier New',monospace;color:#0B5394;font-weight:700;background:#EEF2F7;padding:1px 5px;border-radius:4px;}
  a.sap{color:#0563C1;text-decoration:underline;font-weight:600;}
  .badge{display:inline-block;padding:1px 7px;border-radius:9px;font-size:11px;font-weight:700;}
  .pk{background:#FCE4E6;color:#B01722;} .fk{background:#ECEFF1;color:#37474F;}
  .pkfk{background:#FBE3E4;color:var(--red);} .non{background:#F3F4F6;color:#9AA3AF;}
  ::-webkit-scrollbar{height:9px;width:9px;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px;}
</style>
</head>
<body>
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside id="side" class="brand-slate text-white w-72 flex-shrink-0 flex flex-col fixed md:static inset-y-0 right-0 z-30 -translate-x-0 translate-x-full md:translate-x-0 transition-transform">
    <div class="p-4 border-b border-white/10">
      <div class="brand-red inline-block px-3 py-1 rounded font-extrabold text-white text-lg">CBC ISRAEL</div>
      <div class="mt-1 text-sm text-white/70 font-bold">Project NEO &middot; SAP PM ECC 6.0 &rarr; S/4HANA</div>
    </div>
    <input id="search" placeholder="חיפוש גלובלי (טבלה / שדה / טרנזקציה)..." oninput="doSearch(this.value)"
           class="m-3 px-3 py-2 rounded text-slate-800 text-sm" />
    <nav id="nav" class="flex-1 overflow-y-auto text-sm"></nav>
    <!-- Local deployment utility -->
    <div class="p-3 border-t border-white/10 text-xs">
      <div class="font-bold text-white/80 mb-1">🖥️ הרצת שרת מקומי (Desktop + Mobile)</div>
      <div class="text-white/60 mb-2">הרץ בתיקיית הקובץ, ואז פתח מהדפדפן (גם מהנייד באותה רשת):</div>
      <div class="flex items-center gap-1">
        <code id="srvcmd" style="color:#9be19b;background:#0d1117;">python -m http.server 8000</code>
        <button onclick="copySrv()" class="brand-red text-white px-2 py-1 rounded text-[11px] font-bold">העתק</button>
      </div>
      <div class="text-white/50 mt-2">→ <span class="text-white/80">http://localhost:8000</span> (Desktop)<br>→ <span class="text-white/80">http://&lt;IP-של-המחשב&gt;:8000</span> (Mobile)</div>
    </div>
  </aside>

  <!-- Main -->
  <div class="flex-1 min-w-0">
    <header class="brand-red text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow">
      <button class="md:hidden text-2xl" onclick="document.getElementById('side').classList.toggle('translate-x-full')">☰</button>
      <h1 id="hdr" class="font-extrabold text-lg truncate">מסך ניווט מרכזי</h1>
      <div class="text-xs bg-white/15 px-2 py-1 rounded font-bold">58 טבלאות &middot; PK/FK &middot; JOIN ON</div>
    </header>
    <main id="main" class="p-3 md:p-6 max-w-full"></main>
    <footer class="text-center text-xs text-slate-400 py-6">SAP PM Migration Workbook &middot; CBC Israel (Project NEO) &middot; .xlsx + Web</footer>
  </div>
</div>

<script>
const DATA = {{DATA}};
const STK = "neo_status_v1";
const store = JSON.parse(localStorage.getItem(STK) || "{}");
function saveStore(){ localStorage.setItem(STK, JSON.stringify(store)); }
function getStatus(t){ return store[t] || "Not started"; }
const ST_COLOR = {"Not started":"#FCE4E6;#B01722","In analysis":"#ECEFF1;#475569","In conversion":"#E1E6EA;#37474F","Tested":"#DCE6EC;#2A4A57","Done":"#DCEFE0;#1E5A44"};
function stStyle(s){ const [bg,fg]=(ST_COLOR[s]||"#fff;#000").split(";"); return `background:${bg};color:${fg};font-weight:700;`; }
const esc = s => (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// SAP ecosystem links
function fioriLink(s){
  const m = String(s).match(/F\d{3,5}/);
  if(m){ return `<a class="sap" target="_blank" rel="noopener" href="https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/detail/Apps('${m[0]}')">${esc(s)}</a>`; }
  return esc(s);
}
function noteLink(n){
  const m = String(n).match(/^\d{6,}$/);
  if(m){ return `<a class="sap" target="_blank" rel="noopener" href="https://launchpad.support.sap.com/#/notes/${n}">${esc(n)}</a>`; }
  return esc(n);
}
function keyBadge(k){
  const cls = k==="PK"?"pk":k==="FK"?"fk":k==="PK/FK"?"pkfk":"non";
  return `<span class="badge ${cls}">${esc(k)}</span>`;
}

// Navigation
const NAV = [
  {id:"dash", icon:"🏠", label:"מסך ניווט מרכזי"},
  ...DATA.topics.map(t=>({id:"t"+t.idx, icon:"📄", label:t.title})),
  {id:"simp", icon:"★", label:"Simplification Item list"},
  {id:"cockpit", icon:"◆", label:"Cockpit מעקב מיגרציה"},
  {id:"ccc", icon:"⚙", label:"Custom Code Check"},
  {id:"er", icon:"⇄", label:"ER - Join Map"},
  {id:"cfg", icon:"📖", label:"Config Guide"},
];
function renderNav(active){
  document.getElementById("nav").innerHTML = NAV.map(n=>
    `<button class="navbtn w-full text-right px-4 py-2 ${n.id===active?'active':''}" onclick="show('${n.id}')">
       <span class="opacity-70 ml-2">${n.icon}</span>${esc(n.label)}</button>`).join("");
}

function show(id){
  renderNav(id);
  const main = document.getElementById("main");
  const hdr = document.getElementById("hdr");
  if(window.innerWidth < 768) document.getElementById("side").classList.add("translate-x-full");
  if(id==="dash"){ hdr.textContent="מסך ניווט מרכזי"; main.innerHTML = viewDash(); }
  else if(id==="simp"){ hdr.textContent="Simplification Item list"; main.innerHTML = viewSimp(); }
  else if(id==="cockpit"){ hdr.textContent="Cockpit מעקב מיגרציה"; main.innerHTML = viewCockpit(); }
  else if(id==="ccc"){ hdr.textContent="Custom Code Check"; main.innerHTML = viewCCC(); }
  else if(id==="er"){ hdr.textContent="ER - Join Map"; main.innerHTML = viewER(); }
  else if(id==="cfg"){ hdr.textContent="Config Guide"; main.innerHTML = viewCfg(); }
  else if(id[0]==="t"){ const i=+id.slice(1); hdr.textContent=DATA.topics[i].title; main.innerHTML = viewTopic(i); }
  window.scrollTo(0,0);
}

// KPIs
function kpis(){
  let k={total:DATA.cockpit.length,"Done":0,"Tested":0,"In analysis":0,"In conversion":0,"Not started":0};
  DATA.cockpit.forEach(o=>{ k[getStatus(o.table)]=(k[getStatus(o.table)]||0)+1; });
  k.prog=k["In analysis"]+k["In conversion"]; k.pct=k.total?Math.round(k.Done/k.total*100):0;
  return k;
}
function kpiCard(label,val,bg,fg){
  return `<div class="rounded-xl p-4 text-center shadow-sm" style="background:${bg}">
            <div class="text-3xl font-extrabold" style="color:${fg}">${val}</div>
            <div class="text-xs font-bold mt-1" style="color:${fg}">${label}</div></div>`;
}
function viewDash(){
  const k=kpis();
  const cards=[
    kpiCard("סה״כ אובייקטים",k.total,"#ECEFF1","#1E1E24"),
    kpiCard("הושלם (Done)",k.Done,"#DCEFE0","#1E5A44"),
    kpiCard("נבדק (Tested)",k.Tested,"#DCE6EC","#2A4A57"),
    kpiCard("בתהליך",k.prog,"#E1E6EA","#37474F"),
    kpiCard("פתוח (Open)",k["Not started"],"#FCE4E6","#B01722"),
    kpiCard("% השלמה",k.pct+"%","#FBE3E4","#D62027"),
  ].join("");
  const tiles=NAV.filter(n=>n.id!=="dash").map(n=>
    `<button onclick="show('${n.id}')" class="text-right p-3 rounded-lg text-white font-bold shadow-sm hover:opacity-90"
       style="background:${n.id==='cockpit'||n.id==='er'?'#D62027':n.id==='simp'||n.id==='cfg'?'#8A9EA7':'#1E1E24'}">
       <span class="opacity-70 ml-1">${n.icon}</span>${esc(n.label)}</button>`).join("");
  return `<div class="mb-5"><div class="brand-red text-white px-4 py-3 rounded-lg font-extrabold text-lg">סיכום התקדמות מיגרציה (KPI - חי מה-Cockpit)</div>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">${cards}</div></div>
    <div class="brand-slate text-white px-4 py-2 rounded-lg font-bold mb-3">ניווט מהיר לגיליונות</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">${tiles}</div>
    <p class="text-xs text-slate-500 mt-5 leading-6">מקרא מותג CBC: <b class="txt-red">אדום</b>=תנועתי/עוגני-על &middot; <b class="txt-slate">צפחה</b>=נתוני אב &middot; <b style="color:#8A9EA7">כסף</b>=אינטגרציה ו-S/4HANA. עדכן סטטוסים ב-Cockpit וה-KPI יתעדכן מיד.</p>`;
}

// Topic view
function viewTopic(i){
  const t=DATA.topics[i];
  let html = t.tables.map(tb=>{
    const rows = tb.fields.map(f=>
      `<tr><td><b style="color:#D62027">${esc(f.tech)}</b></td><td>${esc(f.en)}</td>
        <td>${esc(f.he)}</td><td class="text-center">${keyBadge(f.key)}</td></tr>`).join("");
    const funcs = tb.funcs.map(x=>`<div><b>${esc(x[0])}</b> &ndash; ${esc(x[1])}</div>`).join("");
    const progs = tb.progs.map(x=>`<div><b>${esc(x[0])}</b> &ndash; ${esc(x[1])}</div>`).join("");
    return `<div class="bg-white rounded-xl shadow-sm mb-5 overflow-hidden border" style="border-color:#E5E7EB">
      <div class="brand-slate text-white px-3 py-2 font-bold">◆ טבלה <span class="txt-red" style="color:#ff7b80">${esc(tb.name)}</span> &middot; ${esc(tb.he)} <span class="text-white/50 text-xs">(${esc(tb.en)})</span></div>
      <div class="p-3 grid md:grid-cols-2 gap-3 text-xs">
        <div><span class="font-bold txt-slate">טרנזקציות:</span> ${esc(tb.tcodes)}</div>
        <div><span class="font-bold txt-slate">תוכניות/דוחות:</span> ${progs}</div>
      </div>
      <div class="overflow-x-auto"><table>
        <thead><tr><th>שדה טכני</th><th>English</th><th>עברית</th><th>Key</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <div class="p-3 text-xs"><span class="font-bold txt-slate">פונקציות / BAPIs:</span>${funcs}</div>
      <div class="p-3 grid md:grid-cols-2 gap-2 text-xs" style="background:#FBF1E6">
        <div><b style="color:#9A5A23">סטטוס S/4HANA:</b> ${esc(tb.s4_status)}</div>
        <div><b style="color:#9A5A23">טבלה/שדה חלופי:</b> ${esc(tb.s4_repl)}</div>
        <div><b style="color:#9A5A23">טרנז'/תוכנית מחליפה:</b> ${esc(tb.s4_tcode)}</div>
        <div><b style="color:#9A5A23">Fiori:</b> ${fioriLink(tb.fiori)}</div>
        <div class="md:col-span-2"><b style="color:#9A5A23">שלב מיגרציה / SUM:</b> ${esc(tb.sum)}</div>
      </div></div>`;
  }).join("");
  // extensions
  const ex = t.ext;
  const exr = (arr,kind)=>arr.map(x=>`<tr><td class="txt-red font-bold whitespace-nowrap">${kind}</td><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td></tr>`).join("");
  const arch = ex.arch.map(a=>`<tr><td class="txt-slate font-bold">ארכיטקטורה</td><td>—</td><td>${esc(a)}</td></tr>`).join("");
  html += `<div class="bg-white rounded-xl shadow-sm border" style="border-color:#E5E7EB">
    <div style="background:#7B1E2B" class="text-white px-3 py-2 font-bold">⚙ הרחבות טכניות (User Exits / BAdIs / ECC↔S/4)</div>
    <div class="overflow-x-auto"><table><thead><tr><th>סוג</th><th>קוד</th><th>תיאור</th></tr></thead>
      <tbody>${exr(ex.exits,"User Exit")}${exr(ex.badis,"BAdI")}${arch}</tbody></table></div></div>`;
  return html;
}

function viewSimp(){
  const rows=DATA.simplification.map((s,i)=>
    `<tr><td class="text-center">${i+1}</td><td>${esc(s.obj)}</td><td><b>${esc(s.title)}</b></td>
      <td class="text-center"><b style="color:#D62027">${noteLink(s.note)}</b></td><td>${esc(s.cat)}</td><td>${esc(s.impact)}</td></tr>`).join("");
  return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
    <div class="brand-red text-white px-3 py-2 font-bold">Simplification Item List &middot; SAP Notes ל-S/4HANA</div>
    <div class="overflow-x-auto"><table><thead><tr><th>#</th><th>תחום</th><th>Simplification Item</th><th>SAP Note</th><th>קטגוריה</th><th>השפעה והמלצה</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>`;
}

function viewCockpit(){
  const k=kpis();
  const kc=[kpiCard("סה״כ",k.total,"#ECEFF1","#1E1E24"),kpiCard("Done",k.Done,"#DCEFE0","#1E5A44"),
            kpiCard("Tested",k.Tested,"#DCE6EC","#2A4A57"),kpiCard("In Progress",k.prog,"#E1E6EA","#37474F"),
            kpiCard("Open",k["Not started"],"#FCE4E6","#B01722"),kpiCard("% Done",k.pct+"%","#FBE3E4","#D62027")].join("");
  const opts = s => DATA.statuses.map(o=>`<option ${o===s?'selected':''}>${o}</option>`).join("");
  const rows = DATA.cockpit.map((o,i)=>{
    const s=getStatus(o.table);
    return `<tr><td class="text-center">${i+1}</td><td>${esc(o.topic)}</td><td><b style="color:#D62027">${esc(o.table)}</b></td>
      <td style="${stStyle(s)}"><select onchange="setStatus('${esc(o.table)}',this.value)" style="${stStyle(s)};border:1px solid #E5E7EB;border-radius:6px;padding:2px 4px;width:100%">${opts(s)}</select></td>
      <td>${esc(o.he)}</td></tr>`;
  }).join("");
  return `<div id="cockKpi" class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">${kc}</div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
    <div class="brand-red text-white px-3 py-2 font-bold">Cockpit מעקב מיגרציה (Project NEO) &middot; עדכן סטטוס והכל יתעדכן חי</div>
    <div class="overflow-x-auto"><table><thead><tr><th>#</th><th>מודול / נושא</th><th>אובייקט</th><th>סטטוס מעבר</th><th>תיאור</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>`;
}
function setStatus(t,v){ store[t]=v; saveStore();
  // refresh KPI strip in place
  const k=kpis();
  const kc=[["סה״כ",k.total,"#ECEFF1","#1E1E24"],["Done",k.Done,"#DCEFE0","#1E5A44"],["Tested",k.Tested,"#DCE6EC","#2A4A57"],
            ["In Progress",k.prog,"#E1E6EA","#37474F"],["Open",k["Not started"],"#FCE4E6","#B01722"],["% Done",k.pct+"%","#FBE3E4","#D62027"]];
  const box=document.getElementById("cockKpi"); if(box) box.innerHTML=kc.map(c=>kpiCard(c[0],c[1],c[2],c[3])).join("");
  show('cockpit'); // re-render to recolor the changed row
}

function viewCCC(){
  let rows="";
  DATA.topics.forEach(t=>{
    t.ext.exits.forEach(x=>rows+=`<tr><td>${esc(t.title)}</td><td class="txt-red font-bold">User Exit</td><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td><td class="text-xs">בדוק ב-Custom Code Migration (ATC/SCMON); שקול מעבר ל-BAdI.</td></tr>`);
    t.ext.badis.forEach(x=>rows+=`<tr><td>${esc(t.title)}</td><td class="txt-slate font-bold">BAdI</td><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td><td class="text-xs">אמת תאימות ב-S/4 (SPAU_ENH); ודא חתימה.</td></tr>`);
  });
  return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
    <div class="brand-slate text-white px-3 py-2 font-bold">Custom Code Check &middot; User Exits / BAdIs למעבר S/4HANA</div>
    <div class="overflow-x-auto"><table><thead><tr><th>מודול</th><th>סוג</th><th>קוד</th><th>תיאור</th><th>המלצת מעבר</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>`;
}

function viewER(){
  const rows=DATA.joins.map((j,i)=>
    `<tr><td class="text-center">${i+1}</td><td class="txt-slate font-bold">${esc(j.child)}</td><td>${esc(j.fk)}</td>
      <td class="text-center">➜</td><td class="font-bold" style="color:#D62027">${esc(j.parent)}</td><td>${esc(j.pk)}</td>
      <td class="text-center">${esc(j.card)}</td><td><code>${esc(j.join_on)}</code></td><td>${esc(j.desc)}</td></tr>`).join("");
  return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
    <div class="brand-slate text-white px-3 py-2 font-bold">ER - Join Map &middot; קשרי PK ➜ FK + JOIN ON (SQL)</div>
    <div class="overflow-x-auto"><table><thead><tr><th>#</th><th>ילד (FK)</th><th>שדה זר</th><th>➜</th><th>אב (PK)</th><th>שדה ראשי</th><th>יחס</th><th>JOIN ON (SQL)</th><th>תיאור</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>`;
}

function viewCfg(){
  return DATA.config.map((c,i)=>
    `<div class="bg-white rounded-xl shadow-sm mb-4 border overflow-hidden" style="border-color:#E5E7EB">
      <div class="brand-slate text-white px-3 py-2 font-bold">${esc(c.obj)} <span class="text-white/50 text-xs">&middot; ${esc(c.tcode)}</span></div>
      <div class="p-3 text-sm leading-7">${esc(c.guide)}</div>
      <div class="px-3 pb-3 grid md:grid-cols-2 gap-3">
        <div class="text-xs bg-slate-50 rounded p-2"><b class="txt-slate">תרגום מונחים:</b><br>${esc(c.term).replace(/\n/g,"<br>")}</div>
        <div class="text-sm flex flex-wrap gap-3 items-center">
          <a class="sap" target="_blank" rel="noopener" href="${esc(c.help_url)}">🔗 ${esc(c.help_lbl)}</a>
          <a class="sap" target="_blank" rel="noopener" href="${esc(c.ext_url)}">🔗 ${esc(c.ext_lbl)}</a>
        </div></div></div>`).join("");
}

// global search
function doSearch(q){
  q=q.trim().toLowerCase(); if(!q){ return; }
  for(const t of DATA.topics){
    for(const tb of t.tables){
      if(tb.name.toLowerCase().includes(q) || tb.he.includes(q) ||
         tb.fields.some(f=>f.tech.toLowerCase().includes(q)||f.he.includes(q)||(f.en||"").toLowerCase().includes(q)) ||
         tb.tcodes.toLowerCase().includes(q)){
        show("t"+t.idx);
        setTimeout(()=>{ const m=document.getElementById("main");
          const hit=[...m.querySelectorAll("td,div")].find(e=>e.textContent.toLowerCase().includes(q));
          if(hit){ hit.scrollIntoView({block:"center"}); hit.style.background="#FFF2A8"; }
        },60);
        return;
      }
    }
  }
  for(const j of DATA.joins){ if(j.join_on.toLowerCase().includes(q)){ show("er"); return; } }
  alert("לא נמצא: "+q);
}
function copySrv(){ navigator.clipboard && navigator.clipboard.writeText("python -m http.server 8000"); }

show("dash");
</script>
</body>
</html>
"""

html = HTML.replace("{{DATA}}", json.dumps(DATA, ensure_ascii=False))
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
nt = sum(len(t["tables"]) for t in TOPICS)
print(f"OK -> index.html  ({len(html)//1024} KB)")
print(f"   topics: {len(TOPICS)} | tables: {nt} | joins: {len(JOINS)} | config: {len(CONFIG_GUIDE)} | cockpit objs: {len(cockpit)}")
