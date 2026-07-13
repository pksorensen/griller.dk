import { NextRequest, NextResponse } from "next/server";
import { forwardTrack } from "@/lib/agentics";
import { logEvent } from "@/lib/local-store";

// Node runtime: we write a local JSONL backup and relay server-to-server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  type?: string;
  vid?: string;
  path?: string;
  referrer?: string;
  name?: string;
  props?: Record<string, unknown>;
};

function str(v: unknown, max = 512): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = str(body.type, 64);
  const vid = str(body.vid, 64);
  if (!type || !vid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ua = str(req.headers.get("user-agent"), 400);
  const ts = new Date().toISOString();
  const event = {
    ts,
    type,
    vid,
    path: str(body.path, 256),
    referrer: str(body.referrer, 512),
    name: str(body.name, 64),
    props:
      body.props && typeof body.props === "object" ? body.props : undefined,
    ua,
  };

  // Start the relay and the local write together, then await both so the
  // process can't be torn down mid-flight. Relay failures are swallowed — the
  // local backup already captured the event. (The browser used keepalive /
  // sendBeacon, so it isn't waiting on this response.)
  const forwarded = forwardTrack(event);
  await logEvent(event);
  await forwarded.catch(() => false);

  return NextResponse.json({ ok: true });
}
