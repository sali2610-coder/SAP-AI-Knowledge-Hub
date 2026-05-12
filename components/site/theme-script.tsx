// Inline pre-hydration script. Runs synchronously before paint so we never
// flash the wrong theme. Reads the same localStorage key Zustand uses.
const SCRIPT = `(()=>{try{var k='sap-ai-hub-store';var raw=localStorage.getItem(k);var t='dark';if(raw){var p=JSON.parse(raw);t=(p&&p.state&&p.state.theme)||'dark';}var d=document.documentElement;var resolved=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;d.classList.toggle('dark',resolved==='dark');d.dataset.theme=resolved;}catch(e){document.documentElement.classList.add('dark');}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
