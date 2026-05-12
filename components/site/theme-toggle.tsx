"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHubStore } from "@/lib/store";

const LABEL = {
  he: { dark: "מצב כהה", light: "מצב בהיר", system: "לפי המערכת" },
  en: { dark: "Dark mode", light: "Light mode", system: "System" },
} as const;

export function ThemeToggle({ size = "sm" }: { size?: "sm" | "default" }) {
  const theme = useHubStore((s) => s.theme);
  const cycle = useHubStore((s) => s.cycleTheme);
  const language = useHubStore((s) => s.language);
  const t = LABEL[language];

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? t.dark : theme === "light" ? t.light : t.system;

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={cycle}
      title={label}
      aria-label={label}
      className="gap-1"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline text-xs">{label}</span>
    </Button>
  );
}
