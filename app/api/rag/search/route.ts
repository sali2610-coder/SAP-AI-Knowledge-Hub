import { NextRequest, NextResponse } from "next/server";
import { retrieve, isGrounded, formatCitation } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const k = Math.min(8, Math.max(1, Number(req.nextUrl.searchParams.get("k") ?? 5)));
  if (q.trim().length < 2) {
    return NextResponse.json({ hits: [], grounded: false, q });
  }
  const hits = retrieve(q, k);
  const grounded = isGrounded(hits);
  return NextResponse.json({
    q,
    grounded,
    hits: hits.map((h) => ({
      ...formatCitation(h),
      page: h.doc.page,
      paragraphId: h.doc.id,
      score: Math.round(h.score * 100) / 100,
      snippet:
        h.doc.text.length > 240
          ? h.doc.text.slice(0, 239) + "…"
          : h.doc.text,
    })),
  });
}
