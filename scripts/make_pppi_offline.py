# -*- coding: utf-8 -*-
"""
Post-process index_pppi.html into a fully self-contained, CDN-FREE build that renders in any
browser - including locked-down corporate machines behind a proxy/firewall, and even by
double-clicking the file (file://). Removes the Tailwind CDN <script> and embeds a hand-written
utility CSS covering every class the app uses. No external resources remain except optional
SAP help/Fiori <a href> links (which simply won't open if blocked - they never break the page).

Run:  python3 scripts/make_pppi_offline.py   ->  index_pppi_standalone.html
"""
import re

SRC = "index_pppi.html"
OUT = "index_pppi_standalone.html"

UTIL_CSS = r"""
/* ===== self-contained utility CSS - replaces the Tailwind CDN (works offline / behind firewalls) ===== */
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

html = open(SRC, encoding="utf-8").read()

# 1) remove the Tailwind CDN script (any form)
html = re.sub(r'\s*<script src="https://cdn\.tailwindcss\.com"></script>', "", html)

# 2) embed the utility CSS right before </style>
html = html.replace("</style>", UTIL_CSS + "</style>", 1)

# 3) small badge so the team knows this build is offline-safe
html = html.replace(
    '<div class="text-[11px] text-white/40 font-bold">Project NEO &middot; ECC 6.0 &rarr; S/4HANA</div>',
    '<div class="text-[11px] text-white/40 font-bold">Project NEO &middot; ECC 6.0 &rarr; S/4HANA</div>'
    '<div class="text-[11px] font-bold" style="color:#9be19b">✓ Offline / Standalone (ללא אינטרנט)</div>', 1)

open(OUT, "w", encoding="utf-8").write(html)

# verification
ext = re.findall(r'(?:src|href)="(https?://[^"]+)"', html)
ext_non_sap = [u for u in ext if "help.sap.com" not in u and "support.sap.com" not in u
               and "fioriappslibrary" not in u and "community.sap.com" not in u]
print(f"OK -> {OUT}  ({len(html)//1024} KB)")
print("  CDN removed:", "cdn.tailwindcss.com" not in html)
print("  external non-SAP resources (must be []):", ext_non_sap)
print("  ends with </html>:", html.rstrip().endswith("</html>"))
