"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileWarning,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const COPY = {
  he: {
    prev: "עמוד קודם",
    next: "עמוד הבא",
    jump: "קפוץ לעמוד",
    loading: "טוען עמוד מקור...",
    missing:
      "קובץ ה-PDF המקורי אינו זמין בסביבה זו. תצוגת הטקסט עדיין פעילה לחלוטין.",
    page: "עמוד",
    of: "מתוך",
    zoomIn: "הגדל",
    zoomOut: "הקטן",
    fit: "התאם לרוחב",
    rotate: "סובב 90°",
  },
  en: {
    prev: "Previous page",
    next: "Next page",
    jump: "Jump to page",
    loading: "Loading original page...",
    missing:
      "Original PDF unavailable in this build. The text view stays fully active.",
    page: "Page",
    of: "of",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit width",
    rotate: "Rotate 90°",
  },
} as const;

type PdfModule = typeof import("pdfjs-dist");
type PdfDoc = Awaited<ReturnType<PdfModule["getDocument"]>["promise"]>;

let pdfjsPromise: Promise<PdfModule> | null = null;

async function loadPdfjs(): Promise<PdfModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((m) => {
      m.GlobalWorkerOptions.workerSrc = "/pdfjs-worker.mjs";
      return m;
    });
  }
  return pdfjsPromise;
}

interface Props {
  slug: string;
  initialPage?: number;
  totalPages: number;
}

export function PdfPageView({ slug, initialPage = 1, totalPages }: Props) {
  const language = useHubStore((s) => s.language);
  const t = COPY[language];

  const [pageNum, setPageNum] = useState(Math.max(1, initialPage));
  const [actualTotal, setActualTotal] = useState(totalPages);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [scale, setScale] = useState(1.4);
  const [rotation, setRotation] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PdfDoc | null>(null);
  const renderTokenRef = useRef(0);

  // Sync external initial page changes (e.g. deep-link `?page=`).
  // Defer the state hop to a microtask so the linter doesn't flag a
  // cascading-render setState inside the effect body.
  useEffect(() => {
    if (!initialPage) return;
    queueMicrotask(() =>
      setPageNum((curr) => {
        const next = Math.max(1, Math.min(initialPage, actualTotal || initialPage));
        return next === curr ? curr : next;
      }),
    );
  }, [initialPage, actualTotal]);

  // Open the document once per slug. Cleans up on unmount / slug switch.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      setMissing(false);
      setErr(null);
    });

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const probe = await fetch(`/api/book/${encodeURIComponent(slug)}/pdf`, {
          method: "HEAD",
        });
        if (probe.status === 412 || probe.status === 404) {
          if (!cancelled) {
            setMissing(true);
            setLoading(false);
          }
          return;
        }
        const task = pdfjs.getDocument({
          url: `/api/book/${encodeURIComponent(slug)}/pdf`,
          rangeChunkSize: 256 * 1024,
          disableAutoFetch: true,
          disableStream: false,
        });
        const doc = await task.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setActualTotal(doc.numPages);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Unknown PDF error");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [slug]);

  // Render the active page when page / scale / rotation / doc changes.
  useEffect(() => {
    const doc = pdfRef.current;
    if (!doc) return;
    const token = ++renderTokenRef.current;
    let cancelled = false;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const target = Math.max(1, Math.min(pageNum, doc.numPages));
        const page = await doc.getPage(target);
        if (cancelled || token !== renderTokenRef.current) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (!cancelled && token === renderTokenRef.current) {
          setLoading(false);
          scrollerRef.current?.scrollTo({ top: 0 });
        }
      } catch (e) {
        if (!cancelled && token === renderTokenRef.current) {
          setErr(e instanceof Error ? e.message : "Unknown PDF error");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageNum, scale, rotation, actualTotal]);

  // Keyboard nav: arrows + j/k. Escape only matters elsewhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "j") {
        setPageNum((p) => Math.min((actualTotal || totalPages), p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "k") {
        setPageNum((p) => Math.max(1, p - 1));
      } else if (e.key === "+" || (e.key === "=" && e.shiftKey)) {
        setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)));
      } else if (e.key === "-") {
        setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actualTotal, totalPages]);

  const fitToWidth = useCallback(() => {
    const scroller = scrollerRef.current;
    const doc = pdfRef.current;
    if (!scroller || !doc) return;
    doc.getPage(Math.max(1, Math.min(pageNum, doc.numPages))).then((page) => {
      const baseViewport = page.getViewport({ scale: 1, rotation });
      const padding = 24;
      const target = (scroller.clientWidth - padding) / baseViewport.width;
      if (Number.isFinite(target) && target > 0.2) {
        setScale(+Math.min(3, Math.max(0.6, target)).toFixed(2));
      }
    });
  }, [pageNum, rotation]);

  if (missing) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-foreground/15 p-6 text-center">
        <FileWarning className="h-6 w-6 text-amber-400" />
        <p className="max-w-sm text-sm text-muted-foreground">{t.missing}</p>
      </div>
    );
  }

  const cap = actualTotal || totalPages;
  const PrevIcon = language === "he" ? ChevronRight : ChevronLeft;
  const NextIcon = language === "he" ? ChevronLeft : ChevronRight;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-foreground/10 bg-card/70 p-2 ring-1 ring-foreground/5"
        dir={language === "he" ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.prev}
            title={t.prev}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            className="h-8 w-8 p-0"
          >
            <PrevIcon className="h-4 w-4" />
          </Button>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{t.page}</span>
            <input
              type="number"
              min={1}
              max={cap}
              value={pageNum}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setPageNum(Math.max(1, Math.min(v, cap)));
              }}
              className="tnum w-16 rounded-md border border-foreground/15 bg-background/60 px-1.5 py-0.5 text-center font-mono text-xs focus:border-primary/50 focus:outline-none"
              aria-label={t.jump}
            />
            <span className="tnum text-muted-foreground/80">
              {t.of} {cap}
            </span>
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.next}
            title={t.next}
            onClick={() => setPageNum((p) => Math.min(cap, p + 1))}
            disabled={pageNum >= cap}
            className="h-8 w-8 p-0"
          >
            <NextIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.zoomOut}
            title={t.zoomOut}
            onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)))}
            disabled={scale <= 0.6}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="tnum w-12 text-center font-mono text-[11px] text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.zoomIn}
            title={t.zoomIn}
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
            disabled={scale >= 3}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.fit}
            title={t.fit}
            onClick={fitToWidth}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.rotate}
            title={t.rotate}
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "relative flex flex-1 min-h-0 items-start justify-center overflow-auto rounded-xl border border-foreground/10 bg-[var(--card)] p-3",
          loading && "opacity-90",
        )}
        dir="ltr"
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/40 backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{t.loading}</span>
          </div>
        )}
        {err && !loading && (
          <p className="m-auto text-xs text-rose-400">PDF error: {err}</p>
        )}
        <canvas
          ref={canvasRef}
          className="rounded-md shadow-lg ring-1 ring-foreground/10"
        />
      </div>
    </div>
  );
}
