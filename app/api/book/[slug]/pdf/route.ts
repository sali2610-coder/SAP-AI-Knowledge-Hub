import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getBook } from "@/lib/kb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KB_DIR = path.resolve(process.cwd(), "knowledge-base");

function parseRange(header: string | null, size: number): [number, number] | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const start = match[1] === "" ? size - Number(match[2] || 0) : Number(match[1]);
  const end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start < 0) return null;
  return [start, end];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const file = path.join(KB_DIR, book.file);
  let stat;
  try {
    stat = statSync(file);
  } catch {
    return NextResponse.json(
      { error: "PDF binary not available in this build" },
      { status: 412 },
    );
  }

  const size = stat.size;
  const range = parseRange(req.headers.get("range"), size);
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=86400",
  });

  if (range) {
    const [start, end] = range;
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    const node = createReadStream(file, { start, end });
    const web = Readable.toWeb(node) as unknown as ReadableStream<Uint8Array>;
    return new Response(web, { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  const node = createReadStream(file);
  const web = Readable.toWeb(node) as unknown as ReadableStream<Uint8Array>;
  return new Response(web, { status: 200, headers });
}
