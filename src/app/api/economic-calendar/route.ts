import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const source = process.env.ECONOMIC_CALENDAR_API_URL;
  if (!source) return NextResponse.json({ error: "ECONOMIC_CALENDAR_API_URL is not configured." }, { status: 503 });
  const upstream = new URL(source);
  request.nextUrl.searchParams.forEach((value, key) => { upstream.searchParams.set(key, value); });
  const response = await fetch(upstream, { headers: { accept: "application/json" }, cache: "no-store" });
  const body = await response.text();
  return new NextResponse(body, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/json" } });
}
