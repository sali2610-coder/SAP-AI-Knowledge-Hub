import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const live = Boolean(process.env.SAP_AI_ENDPOINT);
  const hasKey = Boolean(process.env.SAP_AI_API_KEY);
  return NextResponse.json({
    live,
    mode: live ? "live" : "mock",
    hasKey,
  });
}
