"use client";

import { useEffect, useRef } from "react";
import { Loader2, SendHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Language } from "@/lib/types";

const COPY = {
  he: {
    placeholder: "שאל את הסוכן... (Cmd/Ctrl + Enter לשליחה)",
    send: "שלח",
    stop: "עצור",
  },
  en: {
    placeholder: "Ask the agent... (Cmd/Ctrl + Enter to send)",
    send: "Send",
    stop: "Stop",
  },
} as const;

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  busy: boolean;
  language: Language;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const t = COPY[language];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  return (
    <div className="border-t border-foreground/5 bg-background/80 px-3 py-3 sm:px-6 sm:py-4 backdrop-blur">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy && value.trim()) onSubmit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <div className="relative flex-1 rounded-2xl border border-foreground/10 bg-card/70 focus-within:border-foreground/30">
          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.placeholder}
            rows={1}
            className="min-h-[48px] resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                if (!busy && value.trim()) onSubmit();
              }
            }}
          />
        </div>
        {busy ? (
          <Button
            type="button"
            onClick={onStop}
            size="lg"
            variant="secondary"
            className="h-12 gap-2 rounded-2xl px-4"
          >
            <Square className="h-4 w-4" />
            {t.stop}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!value.trim()}
            size="lg"
            className="h-12 gap-2 rounded-2xl px-4"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4 rtl:rotate-180" />
            )}
            {t.send}
          </Button>
        )}
      </form>
    </div>
  );
}
