"use client";

import { useEffect, useState } from "react";

export type BackendStatus = {
  live: boolean;
  mode: "live" | "mock";
  hasKey: boolean;
};

const DEFAULT: BackendStatus = { live: false, mode: "mock", hasKey: false };

export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: BackendStatus) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(DEFAULT);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
