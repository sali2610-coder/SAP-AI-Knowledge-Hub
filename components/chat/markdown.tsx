"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";

export function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className="chat-prose break-words text-[15px] text-foreground/95">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children } = props;
            const inline = (props as { inline?: boolean }).inline;
            const match = /language-(\w+)/.exec(className || "");
            const value = String(children ?? "").replace(/\n$/, "");

            if (inline || !match) {
              const raw = String(children ?? "").trim();
              // SAP tcode (MD01N), table name (4-5 caps), or CDS view prefix
              // (I_/A_/C_) gets the Mango accent treatment so it pops at a glance.
              const isSapTerm =
                /^[A-Z]{2,4}[0-9]{1,3}[A-Z]?$/.test(raw) ||
                /^[A-Z]{4,5}$/.test(raw) ||
                /^[A-Z]_[A-Z][A-Za-z0-9_]+$/.test(raw);
              return (
                <code
                  className={
                    isSapTerm
                      ? "rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-[var(--accent)]"
                      : "rounded-md bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]"
                  }
                >
                  {children}
                </code>
              );
            }
            const language = match[1];
            if (language === "mermaid") {
              return <MermaidBlock source={value} />;
            }
            return <CodeBlock language={language} value={value} />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-foreground/5 px-3 py-2 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="border-t border-foreground/5 px-3 py-2 align-top">{children}</td>;
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
