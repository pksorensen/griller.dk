/**
 * Server-to-server relay to agentics.dk.
 *
 * The browser never talks to agentics.dk directly — it POSTs to our own
 * same-origin /api/track and /api/subscribe routes, and those routes call
 * these helpers. That means:
 *   - no cross-domain cookies, no third-party-cookie / SameSite headaches;
 *   - the agentics.dk ingest token stays server-side only;
 *   - agentics.dk is the single store for both analytics and the signup list.
 *
 * If AGENTICS_INGEST_KEY is unset (e.g. before the agentics.dk endpoints are
 * deployed), forwarding is a no-op and the caller falls back to the local
 * /app/data backup — so griller.dk can ship and collect data first.
 */

const BASE_URL = (process.env.AGENTICS_BASE_URL || "https://agentics.dk").replace(/\/+$/, "");
const KEY = process.env.AGENTICS_INGEST_KEY || "";
const SITE = process.env.AGENTICS_SITE || "griller.dk";
const LIST = process.env.AGENTICS_LIST || "griller";
const TIMEOUT_MS = 4000;

export function agenticsConfigured(): boolean {
  return KEY.length > 0;
}

async function relay(path: string, payload: Record<string, unknown>): Promise<boolean> {
  if (!KEY) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export type TrackInput = {
  type: string;
  vid: string;
  path?: string;
  referrer?: string;
  name?: string;
  props?: Record<string, unknown>;
  ua?: string;
  ip?: string;
};

export function forwardTrack(input: TrackInput): Promise<boolean> {
  return relay("/api/ext/track", { site: SITE, ...input });
}

export function forwardSubscribe(email: string, ts: string): Promise<boolean> {
  return relay("/api/ext/subscribe", { site: SITE, list: LIST, email, ts });
}
