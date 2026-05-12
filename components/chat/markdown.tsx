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
              return (
                <code className="rounded-md bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]">
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
                className="text-indigo-300 underline-offset-4 hover:underline"
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
