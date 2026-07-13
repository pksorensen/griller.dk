import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Local JSONL backup under the Coolify persistent volume (/app/data by
 * default). agentics.dk is the primary store; this is a durable safety net so
 * nothing is lost if the relay is unconfigured or momentarily unreachable.
 */
const DATA_DIR = process.env.USER_DATA_DIR || "/app/data";

async function append(file: string, record: unknown): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(join(DATA_DIR, file), JSON.stringify(record) + "\n", "utf8");
  } catch {
    // Never let a disk/permission issue break the request path.
  }
}

export function logEvent(record: Record<string, unknown>): Promise<void> {
  return append("events.jsonl", record);
}

export function logSubscribe(record: Record<string, unknown>): Promise<void> {
  return append("subscribers.jsonl", record);
}
