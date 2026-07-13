import { NextRequest, NextResponse } from "next/server";
import { forwardSubscribe } from "@/lib/agentics";
import { logSubscribe } from "@/lib/local-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const ts = new Date().toISOString();

  // A signup is user-initiated intent, so we always persist it (independent of
  // analytics consent). Local backup first, then the agentics.dk list.
  await logSubscribe({
    ts,
    email,
    ua: req.headers.get("user-agent")?.slice(0, 400) || undefined,
  });
  await forwardSubscribe(email, ts).catch(() => false);

  return NextResponse.json({ ok: true });
}
