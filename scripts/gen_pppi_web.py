# -*- coding: utf-8 -*-
"""
SAP PP-PI "Migration Blueprint Portal" (Project NEO / CBC) - UNIFIED single-file web app.

Architecture: the primary UI shell IS the Migration Cockpit (live deployment status of the
manufacturing objects -> drives KPI counters + dynamic Donut/Bar charts). Each object row is a
status-controlled cockpit entry that EXPANDS to reveal its full technical Blueprint (ECC T-code
vs Fiori App ID, BAPIs/IDocs/RFCs + background programs, technical fields with Data Type/Length/
PK-FK, JOIN ON SQL/CDS, Hebrew expert guide, S/4 gap, live SAP links). Cockpit + Blueprint coupled.

Tailwind CSS, RTL, CBC Red/Slate, mobile-first (slide-out drawer, Data-Cards). Status persisted
to localStorage. Run: python3 scripts/gen_pppi_web.py -> index_pppi.html
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pppi_data import TOPICS, OPS, PPVS

topics, cockpit, joins = [], [], []
for ti, t in enumerate(TOPICS):
    tabs = []
    for tb in t["tables"]:
        tabs.append({
            "name": tb["name"], "he": tb["he"], "en": tb["en"], "tcodes": tb["tcodes"],
            "join": tb["join"], "guide": tb["guide"], "s4": tb["s4"],
            "help_url": tb["help"][0], "help_lbl": tb["help"][1],
            "fields": [{"tech": f[0], "en": f[1], "he": f[2], "dt": f[3], "len": f[4], "key": f[5]} for f in tb["fields"]],
        })
        cockpit.append({"table": tb["name"], "he": tb["he"], "topic": t["title"]})
        if tb["join"].startswith("FROM"):
            joins.append({"table": tb["name"], "join": tb["join"], "he": tb["he"]})
    topics.append({"idx": ti, "title": t["title"], "theme": t["theme"], "tables": tabs,
                   "ops": {"tcodes": OPS[ti]["tcodes"], "interfaces": OPS[ti]["interfaces"], "programs": OPS[ti]["programs"]}})

DATA = {"topics": topics, "cockpit": cockpit, "joins": joins, "ppvs": PPVS,
        "statuses": ["Not started", "In analysis", "In conversion", "Tested", "Done"]}

HTML = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAP PP-PI Migration Blueprint Portal - Project NEO | CBC Israel</title>
<script src="https://cdn.tailwindcss.com"></script>
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
</style></head>
<body>
<div class="flex min-h-screen">
 <aside id="side" class="text-white w-72 flex-shrink-0 flex flex-col fixed md:static inset-y-0 right-0 z-30 translate-x-full md:translate-x-0 transition-transform" style="background:#1E1E24">
   <div class="p-4 border-b border-white/10">
     <div class="inline-block px-3 py-1 rounded font-extrabold text-white text-lg" style="background:#D62027">CBC ISRAEL</div>
     <div class="mt-1 text-sm text-white/70 font-bold">Migration Blueprint Portal &middot; PP-PI</div>
     <div class="text-[11px] text-white/40 font-bold">Project NEO &middot; ECC 6.0 &rarr; S/4HANA</div>
   </div>
   <input id="search" placeholder="חיפוש (טבלה / שדה / T-code / BAPI)..." oninput="doSearch(this.value)" class="m-3 px-3 py-2 rounded text-slate-800 text-sm"/>
   <nav id="nav" class="flex-1 overflow-y-auto text-sm"></nav>
   <div class="p-3 border-t border-white/10 text-xs">
     <div class="font-bold text-white/80 mb-1">🖥️ הרצת שרת מקומי (Desktop + Mobile)</div>
     <div class="text-white/60 mb-2">הרץ בתיקיית הקובץ; פתח גם מהנייד באותה רשת:</div>
     <div class="flex items-center gap-1"><code style="color:#9be19b;background:#0d1117;">python -m http.server 8000</code>
       <button onclick="navigator.clipboard&&navigator.clipboard.writeText('python -m http.server 8000')" class="text-white px-2 py-1 rounded text-[11px] font-bold" style="background:#D62027">העתק</button></div>
     <div class="text-white/50 mt-2">→ <span class="text-white/80">http://localhost:8000</span> (PC)<br>→ <span class="text-white/80">http://&lt;IP&gt;:8000</span> (Mobile)</div>
   </div>
 </aside>
 <div class="flex-1 min-w-0">
   <header class="text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow" style="background:#D62027">
     <button class="md:hidden text-2xl" onclick="document.getElementById('side').classList.toggle('translate-x-full')">☰</button>
     <h1 id="hdr" class="font-extrabold text-lg truncate">Migration Cockpit &amp; Blueprint</h1>
     <div class="text-xs bg-white/15 px-2 py-1 rounded font-bold hidden sm:block">65 טבלאות &middot; PP-PI &middot; JOIN ON</div>
   </header>
   <main id="main" class="p-3 md:p-6 max-w-full"></main>
   <footer class="text-center text-xs text-slate-400 py-6">SAP PP-PI Migration Blueprint Portal &middot; CBC Israel (Project NEO)</footer>
 </div>
</div>
<script>
const DATA = {{DATA}};
const STK="neo_pppi_v1"; const store=JSON.parse(localStorage.getItem(STK)||"{}");
const save=()=>localStorage.setItem(STK,JSON.stringify(store));
const getS=t=>store[t]||"Not started";
const SC={"Not started":["#FCE4E6","#B01722"],"In analysis":["#ECEFF1","#475569"],"In conversion":["#E1E6EA","#37474F"],"Tested":["#DCE6EC","#2A4A57"],"Done":["#DCEFE0","#1E5A44"]};
const esc=s=>(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function fioriLink(s){const m=String(s).match(/F\d{3,5}/);return m?`<a class="sap" target="_blank" rel="noopener" href="https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/detail/Apps('${m[0]}')">${esc(s)}</a>`:esc(s);}
function keyBadge(k){const c=k==="PK"?"pk":k==="FK"?"fk":k==="PK/FK"?"pkfk":"non";return `<span class="badge ${c}">${esc(k)}</span>`;}

// ---------- KPIs + charts (driven by live cockpit status) ----------
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

// ---------- Blueprint (revealed on expand) ----------
function opsBlock(ops){
 const tm=ops.tcodes.map(x=>`<tr><td data-label="ECC"><code>${esc(x[0])}</code></td><td data-label="Fiori App">${esc(x[1])}</td><td data-label="Fiori ID">${fioriLink(x[2])}</td></tr>`).join("");
 const ic=ops.interfaces.map(x=>`<tr><td data-label="Type"><b style="color:#D62027">${esc(x[0])}</b></td><td data-label="Name"><code>${esc(x[1])}</code></td><td data-label="תיאור">${esc(x[2])}</td></tr>`).join("");
 const pg=ops.programs.map(x=>`<tr><td data-label="Program"><code>${esc(x[0])}</code></td><td data-label="תיאור">${esc(x[1])}</td></tr>`).join("");
 const blk=(t,h)=>`<div><div class="font-bold mb-1 text-sm" style="color:#1E1E24">${t}</div><div class="overflow-x-auto"><table class="resp text-xs">${h}</table></div></div>`;
 return `<div class="grid md:grid-cols-3 gap-4">
   ${blk('T-codes ◄► Fiori App','<thead><tr><th>ECC T-code</th><th>S/4 Fiori App</th><th>Fiori ID</th></tr></thead><tbody>'+tm+'</tbody>')}
   ${blk('ממשקים (BAPI / IDoc / RFC)','<thead><tr><th>Type</th><th>Name</th><th>תיאור</th></tr></thead><tbody>'+ic+'</tbody>')}
   ${blk('תוכניות רקע ודוחות','<thead><tr><th>Program</th><th>תיאור ומטרה</th></tr></thead><tbody>'+pg+'</tbody>')}
 </div>`;
}
function blueprint(tb){
 const rows=tb.fields.map(f=>`<tr><td data-label="שדה טכני"><b style="color:#D62027">${esc(f.tech)}</b></td><td data-label="Type">${esc(f.dt)}</td><td data-label="Len">${esc(f.len)}</td><td data-label="Key">${keyBadge(f.key)}</td><td data-label="English">${esc(f.en)}</td><td data-label="עברית">${esc(f.he)}</td></tr>`).join("");
 return `<div class="overflow-x-auto mb-3"><table class="resp"><thead><tr><th>שדה טכני</th><th>Type</th><th>Len</th><th>Key</th><th>English</th><th>עברית</th></tr></thead><tbody>${rows}</tbody></table></div>
   <div class="grid md:grid-cols-2 gap-3 text-xs mb-2">
     <div><b style="color:#1E1E24">JOIN ON (SQL/CDS):</b><br><code>${esc(tb.join)}</code></div>
     <div style="background:#FBF1E6;border-radius:8px;padding:8px"><b style="color:#9A5A23">פער / הערת S/4HANA:</b><br>${esc(tb.s4)}</div>
   </div>
   <div class="text-sm leading-7"><b style="color:#1E1E24">הסבר פונקציונלי:</b> ${esc(tb.guide)}</div>
   <div class="text-sm mt-1">🔗 <a class="sap" target="_blank" rel="noopener" href="${esc(tb.help_url)}">${esc(tb.help_lbl)}</a> &middot; <span class="text-slate-400">T-codes: ${esc(tb.tcodes)}</span></div>`;
}

// ---------- Cockpit object row (status control + expandable blueprint) ----------
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
   <details class="border-b" style="border-color:#E5E7EB"><summary class="px-3 py-2 cursor-pointer font-bold text-sm" style="color:#D62027">🔧 שכבה תפעולית (T-codes ◄► Fiori | BAPI/IDoc/RFC | תוכניות רקע) - הצנרת התפעולית של הזרם</summary><div class="p-3" style="background:#FAFAFB">${opsBlock(t.ops)}</div></details>
   <div>${objs}</div></section>`;
}

// ---------- Unified Cockpit + Blueprint home ----------
function viewHome(){
 const k=kpis();
 return `<div class="text-white px-4 py-3 rounded-lg font-extrabold text-lg mb-1" style="background:#D62027">🚀 Migration Cockpit - מצב פריסה חי (Project NEO)</div>
   <div class="text-xs text-slate-500 mb-3">עדכן סטטוס לכל אובייקט -> ה-KPI והגרפים מתעדכנים מיד. לחץ על אובייקט כדי לחשוף את ה-Blueprint הטכני המלא (שדות, JOIN ON, BAPIs/IDocs, הסבר עברי).</div>
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

// ---------- Education + ER (reference views) ----------
function viewEdu(){
 const rows=DATA.ppvs.map((x,i)=>`<tr><td data-label="#" class="text-center">${i+1}</td><td data-label="היבט"><b style="color:#1E1E24">${esc(x[0])}</b></td><td data-label="SAP PP">${esc(x[1])}</td><td data-label="SAP PP-PI" style="background:#DCEFE0"><b style="color:#1E5A44">${esc(x[2])}</b></td><td data-label="הערת CBC/S4" style="color:#9A5A23">${esc(x[3])}</td></tr>`).join("");
 return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#D62027">📚 SAP PP (Discrete) מול SAP PP-PI (Process) - שכבת חינוך ארגונית</div>
   <div class="p-3 text-sm text-slate-600">CBC מייצר משקאות = <b>ייצור תהליכי</b>, ולכן המודול הנכון הוא <b style="color:#D62027">PP-PI</b> (לא PP בדיד). הטבלה ממפה את ההבדלים המהותיים:</div>
   <div class="overflow-x-auto"><table class="resp"><thead><tr><th>#</th><th>היבט (Aspect)</th><th>SAP PP (Discrete)</th><th>SAP PP-PI (Process - CBC)</th><th>הערת CBC / S/4HANA</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function viewER(){
 const rows=DATA.joins.map((j,i)=>`<tr><td data-label="#" class="text-center">${i+1}</td><td data-label="טבלה" class="font-bold" style="color:#D62027">${esc(j.table)}</td><td data-label="JOIN ON"><code>${esc(j.join)}</code></td><td data-label="תיאור">${esc(j.he)}</td></tr>`).join("");
 return `<div class="bg-white rounded-xl shadow-sm overflow-hidden border" style="border-color:#E5E7EB">
   <div class="text-white px-3 py-2 font-bold" style="background:#1E1E24">⇄ ER - Join Map &middot; JOIN ON (SQL / CDS Views)</div>
   <div class="overflow-x-auto"><table class="resp"><thead><tr><th>#</th><th>טבלה</th><th>JOIN ON (SQL/CDS)</th><th>תיאור</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

// ---------- Navigation ----------
const NAV=[{id:"home",icon:"🚀",label:"Migration Cockpit (Home)"},
 {group:"זרמי ליבה (Core Streams - קפיצה)"},
 ...DATA.topics.map(t=>({id:"st-"+t.idx,icon:"📄",label:t.title})),
 {group:"לימוד וכלים (Education & Tools)"},
 {id:"edu",icon:"📚",label:"PP מול PP-PI"},{id:"er",icon:"⇄",label:"ER - Join Map"}];
function renderNav(a){document.getElementById("nav").innerHTML=NAV.map(n=> n.group?`<div class="px-4 pt-3 pb-1 text-[11px] font-bold text-white/40">${esc(n.group)}</div>`:`<button class="navbtn w-full text-right px-4 py-2 ${n.id===a?'active':''}" onclick="show('${n.id}')"><span class="opacity-70 ml-2">${n.icon}</span>${esc(n.label)}</button>`).join("");}

let CURRENT="home";
function show(id){
 if(window.innerWidth<768)document.getElementById("side").classList.add("translate-x-full");
 const m=document.getElementById("main"),h=document.getElementById("hdr");
 if(id.startsWith("st-")){
   if(CURRENT!=="home"){m.innerHTML=viewHome();CURRENT="home";}
   renderNav(id);
   const sec=document.getElementById(id); if(sec){sec.scrollIntoView({behavior:"smooth",block:"start"});}
   h.textContent="Migration Cockpit & Blueprint"; return;
 }
 renderNav(id); CURRENT=id;
 if(id==="home"){h.textContent="Migration Cockpit & Blueprint";m.innerHTML=viewHome();}
 else if(id==="edu"){h.textContent="PP מול PP-PI";m.innerHTML=viewEdu();}
 else if(id==="er"){h.textContent="ER - Join Map";m.innerHTML=viewER();}
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
 for(const j of DATA.joins)if(j.join.toLowerCase().includes(q)){show("er");return;}
 alert("לא נמצא: "+q);}
show("home");
</script></body></html>"""

html = HTML.replace("{{DATA}}", json.dumps(DATA, ensure_ascii=False))
with open("index_pppi.html", "w", encoding="utf-8") as fh:
    fh.write(html)
nt = sum(len(t["tables"]) for t in TOPICS); nf = sum(len(tb["fields"]) for t in TOPICS for tb in t["tables"])
print(f"OK -> index_pppi.html ({len(html)//1024} KB) | unified cockpit+blueprint | tables:{nt} fields:{nf} joins:{len(joins)} objects:{len(cockpit)}")
