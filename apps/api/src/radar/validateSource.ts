// Checks that a source is real BEFORE it is trusted: the address is well-formed and https, it
// answers, and it actually contains what its kind promises (a feed, JSON, or a web page).
import { runConnector, SOURCE_KINDS, type FetchLike } from "./connectors";

export interface ValidationResult {
  ok: boolean;
  detail: string;
  sampleCount: number;
}

export function checkSourceUrlShape(url: string, kind: string): string | null {
  if (!SOURCE_KINDS.includes(kind)) return `Kind must be one of: ${SOURCE_KINDS.join(", ")}`;
  if (kind === "fixture") return /^fixture:\/\/[a-z0-9._-]+$/i.test(url) ? null : "Fixture sources look like fixture://file-name.xml";
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "That is not a valid URL.";
  }
  if (parsed.protocol !== "https:") return "Sources must use https://";
  // Never point the radar at this computer or a private network (that would be SSRF).
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[::1\])/i.test(parsed.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname)) {
    return "Sources must be public internet addresses.";
  }
  return null;
}

export async function validateSource(url: string, kind: string, fetchImpl: FetchLike): Promise<ValidationResult> {
  const shapeProblem = checkSourceUrlShape(url, kind);
  if (shapeProblem) return { ok: false, detail: shapeProblem, sampleCount: 0 };
  try {
    // A page watcher's first run only records a baseline, so a fresh source (no hash) is enough.
    const result = await runConnector({ url, kind, pageHash: null }, fetchImpl);
    if (kind === "page-watch") return { ok: true, detail: "The page loaded and its text was fingerprinted.", sampleCount: 0 };
    if (result.items.length === 0 && kind !== "nvd") {
      return { ok: false, detail: "The address answered, but no items could be read from it.", sampleCount: 0 };
    }
    return { ok: true, detail: `Read ${result.items.length} item(s) successfully.`, sampleCount: result.items.length };
  } catch (error) {
    return { ok: false, detail: `Could not read the source: ${(error as Error).message}`, sampleCount: 0 };
  }
}
