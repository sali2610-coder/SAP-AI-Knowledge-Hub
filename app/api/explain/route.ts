import { NextRequest } from "next/server";
import { buildExplain } from "@/lib/explain-stream";
import { loadParagraph } from "@/lib/book-loader";
import type { AgentId, Language } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ExplainPayload {
  bookSlug?: string;
  paragraphId?: string;
  text?: string;
  agent: AgentId;
  language: Language;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunkText(s: string) {
  const out: string[] = [];
  let buf = "";
  for (const ch of s) {
    buf += ch;
    if (/[\s\n.,;:!?]/.test(ch) && buf.length > 2) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf) out.push(buf);
  return out;
}

export async function POST(req: NextRequest) {
  let body: ExplainPayload;
  try {
    body = (await req.json()) as ExplainPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = process.env.SAP_AI_ENDPOINT;
  if (upstream) {
    const resp = await fetch(`${upstream.replace(/\/$/, "")}/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SAP_AI_API_KEY
          ? { Authorization: `Bearer ${process.env.SAP_AI_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(body),
    });
    return new Response(resp.body, {
      status: resp.status,
      headers: {
        ...SSE_HEADERS,
        "Content-Type":
          resp.headers.get("content-type") ?? SSE_HEADERS["Content-Type"],
      },
    });
  }

  // Resolve source text + chapter when only paragraphId is provided.
  let text = body.text ?? "";
  let chapterTitle: string | undefined;
  if (body.bookSlug && body.paragraphId) {
    const located = await loadParagraph(body.bookSlug, body.paragraphId);
    if (located) {
      text = located.paragraph.text;
      chapterTitle = located.chapter.title;
    }
  }
  if (!text.trim()) {
    return new Response(JSON.stringify({ error: "Missing text" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text: explanation, citations, source } = buildExplain({
    text,
    bookSlug: body.bookSlug,
    paragraphId: body.paragraphId,
    chapterTitle,
    agentId: body.agent,
    language: body.language,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(sse("meta", { source })));
      for (const chunk of chunkText(explanation)) {
        controller.enqueue(enc.encode(sse("delta", { content: chunk })));
        await sleep(14);
      }
      controller.enqueue(enc.encode(sse("citations", { citations })));
      controller.enqueue(enc.encode(sse("done", {})));
      controller.close();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
