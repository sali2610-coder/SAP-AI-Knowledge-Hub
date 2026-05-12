"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import xml from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import registerAbap from "@/lib/syntax/abap";
import registerTosca from "@/lib/syntax/tosca";
import { cn } from "@/lib/utils";

SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("abap", registerAbap as never);
SyntaxHighlighter.registerLanguage("tosca", registerTosca as never);

const LABELS: Record<string, string> = {
  abap: "ABAP",
  tosca: "Tosca / T-Box",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
};

export function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const lang = normalize(language);
  const label = LABELS[lang] ?? (language || "code");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-foreground/10 bg-[#0b1020]">
      <div className="flex items-center justify-between border-b border-foreground/5 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => {
            navigator.clipboard.writeText(value).then(() => setCopied(true));
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: "0.85rem 1rem",
          fontSize: "0.82rem",
          background: "transparent",
        }}
        codeTagProps={{
          className: cn("font-mono"),
        }}
      >
        {value.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

function normalize(l: string): string {
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    sh: "bash",
    yml: "yaml",
  };
  return map[l] ?? l.toLowerCase();
}
