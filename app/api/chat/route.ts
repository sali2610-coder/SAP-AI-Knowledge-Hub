import { NextRequest } from "next/server";
import { buildMockAnswer } from "@/lib/mock-stream";
import type { AgentId, Language } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClientMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatPayload {
  messages: ClientMessage[];
  agent: AgentId;
  language: Language;
}

const TEXT_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: ChatPayload;
  try {
    body = (await req.json()) as ChatPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = process.env.SAP_AI_ENDPOINT;
  const apiKey = process.env.SAP_AI_API_KEY;

  // Real backend path - just proxy the response stream straight through.
  if (upstream) {
    const upstreamResp = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: {
        ...TEXT_HEADERS,
        "Content-Type":
          upstreamResp.headers.get("content-type") ?? TEXT_HEADERS["Content-Type"],
      },
    });
  }

  // No backend configured - return a mock SSE stream so the UI is demoable.
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const prompt = lastUser?.content ?? "";

  const { text, citations } = buildMockAnswer({
    prompt,
    agentId: body.agent,
    language: body.language,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const chunks = splitForStreaming(text);
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(sse("delta", { content: chunk })));
        await sleep(18);
      }
      controller.enqueue(
        encoder.encode(sse("citations", { citations })),
      );
      controller.enqueue(encoder.encode(sse("done", {})));
      controller.close();
    },
  });

  return new Response(stream, { headers: TEXT_HEADERS });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function splitForStreaming(text: string): string[] {
  // Word-ish chunks so streaming feels natural without flooding the wire.
  const out: string[] = [];
  let buf = "";
  for (const ch of text) {
    buf += ch;
    if (/[\s\n.,;:!?]/.test(ch) && buf.length > 2) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf) out.push(buf);
  return out;
}

