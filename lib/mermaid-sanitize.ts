// Pure string utility - safe to import from server or client.
// Repairs Mermaid source so node labels containing quotes, parens, brackets
// or stray zero-width chars do not break mermaid.render().

const ZERO_WIDTH = /[​-‍﻿­]/g;

function escapeLabel(label: string): string {
  return label
    .replace(/&(?!quot;|amp;|lt;|gt;|#\d+;)/g, "&amp;")
    .replace(/"/g, "#quot;");
}

function stripOuterQuotes(s: string): string {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}

const ID_TAIL = /[\w-]/;

function isIdStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch);
}

function fixLabels(src: string, open: "[" | "(", close: "]" | ")"): string {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (ch !== open) {
      out += ch;
      i++;
      continue;
    }
    // Look back: did we just emit an identifier?
    let j = out.length - 1;
    while (j >= 0 && ID_TAIL.test(out[j])) j--;
    const idStart = j + 1;
    const id = out.slice(idStart);
    if (id.length === 0 || !isIdStart(id[0])) {
      out += ch;
      i++;
      continue;
    }
    // Find closing on the same line. Pair the LAST close before newline / `-->` / `;`.
    let lineEnd = src.indexOf("\n", i);
    if (lineEnd === -1) lineEnd = n;
    const arrow = src.indexOf("-->", i);
    if (arrow !== -1 && arrow < lineEnd) lineEnd = arrow;
    const semi = src.indexOf(";", i);
    if (semi !== -1 && semi < lineEnd) lineEnd = semi;
    const lastClose = src.lastIndexOf(close, lineEnd - 1);
    if (lastClose <= i) {
      out += ch;
      i++;
      continue;
    }
    const raw = src.slice(i + 1, lastClose);
    const trimmed = raw.trim();
    // Skip mermaid shape variants (stadium [(x)], subroutine [[x]], etc.)
    // and round-shape children — let mermaid parse those natively.
    const shapeHead = trimmed.charAt(0);
    const shapeTail = trimmed.charAt(trimmed.length - 1);
    const isShape =
      (open === "[" &&
        ((shapeHead === "(" && shapeTail === ")") ||
          (shapeHead === "[" && shapeTail === "]") ||
          (shapeHead === "/" && shapeTail === "/") ||
          (shapeHead === "\\" && shapeTail === "\\") ||
          shapeHead === ">"));
    if (isShape) {
      out += ch;
      i++;
      continue;
    }
    const inner = stripOuterQuotes(trimmed);
    if (/["<>&]/.test(inner) || (open === "[" && /[()]/.test(inner))) {
      if (open === "[") out += `["${escapeLabel(inner)}"]`;
      else out += `("${escapeLabel(inner)}")`;
      i = lastClose + 1;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function sanitizeMermaidSource(src: string): string {
  const s = src.replace(ZERO_WIDTH, "").replace(/\r\n?/g, "\n");
  return fixLabels(fixLabels(s, "[", "]"), "(", ")");
}
