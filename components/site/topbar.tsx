"use client";

import Link from "next/link";
import { Globe, MessageSquare, Library, TestTube2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { BackendBadge } from "@/components/site/backend-badge";

const COPY = {
  he: { chat: "פתח צ׳אט", switch: "English", library: "ספרייה", tosca: "Tosca FX" },
  en: { chat: "Open chat", switch: "עברית", library: "Library", tosca: "Tosca FX" },
} as const;

export function TopBar({ minimal = false }: { minimal?: boolean }) {
  const language = useHubStore((s) => s.language);
  const setLanguage = useHubStore((s) => s.setLanguage);
  const t = COPY[language];

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/5 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span>SAP AI Knowledge Hub</span>
          <BackendBadge />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/library"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-xs",
            )}
          >
            <Library className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.library}</span>
          </Link>
          <Link
            href="/tosca"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-xs",
            )}
          >
            <TestTube2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.tosca}</span>
          </Link>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "he" ? "en" : "he")}
            className="gap-1 text-xs"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.switch}
          </Button>
          {!minimal && (
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ size: "sm" }),
                "gap-1.5 rounded-full",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t.chat}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
