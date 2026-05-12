"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

export function LanguageEffect() {
  const language = useHubStore((s) => s.language);
  const hydrated = useHubStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "he" ? "rtl" : "ltr";
  }, [language, hydrated]);

  return null;
}
