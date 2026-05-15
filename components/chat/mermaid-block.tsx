"use client";

import { useEffect, useId, useRef, useState } from "react";
import { sanitizeMermaidSource } from "@/lib/mermaid-sanitize";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "transparent",
          primaryColor: "#003071",
          primaryTextColor: "#e2e8f0",
          lineColor: "#0070f2",
          edgeLabelBackground: "#0b1622",
        },
        fontFamily: "var(--font-sans), Inter, system-ui",
        securityLevel: "strict",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export function MermaidBlock({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  const cleaned = sanitizeMermaidSource(source.trim());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaid();
        const id = `mmd-${reactId}`;
        const { svg } = await mermaid.render(id, cleaned);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render diagram");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reactId, cleaned]);

  if (error) {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
        <div className="flex items-center justify-between gap-3">
          <span>Mermaid render error: {error}</span>
          <button
            type="button"
            aria-expanded={showSource}
            onClick={() => setShowSource((v) => !v)}
            className="rounded-md border border-rose-400/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-rose-100 hover:bg-rose-500/20"
          >
            {showSource ? "hide source" : "view source"}
          </button>
        </div>
        {showSource && (
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-rose-100/80">
            {cleaned}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-foreground/10 bg-[var(--code-bg)] p-4">
      <div ref={ref} dir="ltr" className="[&_svg]:mx-auto [&_svg]:max-w-full" />
    </div>
  );
}
