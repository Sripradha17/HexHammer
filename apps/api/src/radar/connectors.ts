// CONNECTORS: one small function per kind of source. Each returns plain items; none of them
// trusts or runs what it downloads. Every network call has a timeout and limited retries.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFeed, type FeedItem } from "./feed";
import { toPlainText } from "./normalize";

export interface RadarItem extends FeedItem {
  severity?: string | null; // security sources only
  pageChange?: boolean; // page watcher only
}

export interface SourceLike {
  url: string;
  kind: string;
  pageHash: string | null;
}

// What the connector found, plus (for the page watcher) the new page fingerprint to store.
export interface ConnectorResult {
  items: RadarItem[];
  pageHash?: string;
  note?: string; // e.g. "baseline recorded"
}

// The fetch function is passed in, so tests can use a fake instead of the real internet.
export type FetchLike = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
  headers: { get(name: string): string | null };
}>;

export const FIXTURE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const USER_AGENT = "Hexhammer-TechRadar/1.0 (local learning app; +https://github.com/)";
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 2_000_000; // never hold more than ~2 MB of a response in memory

// GET with a timeout and up to `retries` extra attempts, waiting 1 s, then 2 s (exponential backoff).
// 4xx errors are not retried (asking again will not help); timeouts, network errors and 5xx are.
export async function fetchText(fetchImpl: FetchLike, url: string, retries = 2): Promise<{ status: number; body: string; contentType: string }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": USER_AGENT, Accept: "*/*" } });
      if (response.status >= 400 && response.status < 500) {
        throw Object.assign(new Error(`HTTP ${response.status}`), { permanent: true });
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.text()).slice(0, MAX_BYTES);
      return { status: response.status, body, contentType: response.headers.get("content-type") ?? "" };
    } catch (error) {
      lastError = error;
      if ((error as { permanent?: boolean }).permanent || attempt === retries) break;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

// fixture://name.ext -> a local test file (only from the fixtures folder: no path tricks).
async function readFixture(url: string): Promise<string> {
  const name = url.replace(/^fixture:\/\//, "");
  if (!/^[a-z0-9._-]+$/i.test(name)) throw new Error("Fixture names may only contain letters, numbers, dots, dashes and underscores.");
  return readFile(path.join(FIXTURE_DIR, name), "utf8");
}

// GitHub security advisories (public REST API; works without a token, with low rate limits).
function parseGithubAdvisories(json: string): RadarItem[] {
  const list = JSON.parse(json);
  if (!Array.isArray(list)) throw new Error("Unexpected advisory response (not a list).");
  return list.slice(0, 50).flatMap((a): RadarItem[] => {
    const url = typeof a?.html_url === "string" ? a.html_url : "";
    const title = typeof a?.summary === "string" ? a.summary : "";
    if (!url.startsWith("https://") || !title) return [];
    const packages = Array.isArray(a.vulnerabilities) ? a.vulnerabilities.map((v: { package?: { name?: string } }) => v?.package?.name).filter(Boolean) : [];
    const id = [a.ghsa_id, a.cve_id].filter(Boolean).join(" / ");
    return [{
      title: toPlainText(`${title}${packages.length ? ` (${packages.slice(0, 3).join(", ")})` : ""}`, 200),
      url,
      publishedAt: a.published_at ? new Date(a.published_at) : null,
      summary: toPlainText(`${id}. ${a.description ?? ""}`),
      severity: typeof a.severity === "string" ? a.severity : null,
    }];
  });
}

// NIST NVD CVE API 2.0 (public; low rate limits without a key).
function parseNvd(json: string): RadarItem[] {
  const data = JSON.parse(json);
  const list = Array.isArray(data?.vulnerabilities) ? data.vulnerabilities : [];
  return list.slice(0, 50).flatMap((v: { cve?: Record<string, unknown> }): RadarItem[] => {
    const cve = v?.cve as { id?: string; published?: string; descriptions?: { lang: string; value: string }[]; metrics?: Record<string, { cvssData?: { baseSeverity?: string } }[]> } | undefined;
    if (!cve?.id) return [];
    const description = cve.descriptions?.find((d) => d.lang === "en")?.value ?? "";
    const metric = cve.metrics && Object.values(cve.metrics)[0]?.[0];
    return [{
      title: `${cve.id}: ${toPlainText(description, 140)}`,
      url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      publishedAt: cve.published ? new Date(cve.published) : null,
      summary: toPlainText(description),
      severity: metric?.cvssData?.baseSeverity ?? null,
    }];
  });
}

// NVD asks for a date window; we look at the last 30 days of new CVEs.
export function nvdUrlWithWindow(base: string, now = new Date()): string {
  const url = new URL(base);
  const start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  url.searchParams.set("pubStartDate", start.toISOString().replace("Z", ""));
  url.searchParams.set("pubEndDate", now.toISOString().replace("Z", ""));
  url.searchParams.set("resultsPerPage", "20");
  return url.toString();
}

// Page watcher: the page's visible text, fingerprinted. The FIRST check only records a baseline
// (we cannot honestly say anything "changed" yet). Later, a new fingerprint = one "page changed" item.
function pageWatch(source: SourceLike, html: string): ConnectorResult {
  const text = toPlainText(html, 200_000);
  const hash = createHash("sha256").update(text).digest("hex");
  if (!source.pageHash) return { items: [], pageHash: hash, note: "Baseline recorded; future checks will report changes." };
  if (source.pageHash === hash) return { items: [], pageHash: hash, note: "No change since last check." };
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return {
    pageHash: hash,
    items: [{
      title: `Page changed: ${toPlainText(title ?? source.url, 150)}`,
      url: `${source.url}#hexhammer-change-${hash.slice(0, 12)}`,
      publishedAt: null,
      summary: "The text of this page changed since the last check. The radar does not know WHAT changed: open the page and read it.",
      pageChange: true,
    }],
  };
}

// The one entry point: fetch (or read) the source and turn it into items.
export async function runConnector(source: SourceLike, fetchImpl: FetchLike): Promise<ConnectorResult> {
  if (source.kind === "fixture") {
    const body = await readFixture(source.url);
    return { items: source.url.endsWith(".json") ? parseGithubAdvisories(body) : parseFeed(body) };
  }
  if (source.kind === "nvd") {
    const { body } = await fetchText(fetchImpl, nvdUrlWithWindow(source.url));
    return { items: parseNvd(body) };
  }
  const { body } = await fetchText(fetchImpl, source.url);
  if (source.kind === "github-advisories") return { items: parseGithubAdvisories(body) };
  if (source.kind === "page-watch") return pageWatch(source, body);
  if (source.kind === "atom" || source.kind === "rss") {
    const items = parseFeed(body);
    if (items.length === 0 && !/<(feed|rss|rdf)\b/i.test(body)) throw new Error("The response is not an RSS or Atom feed.");
    return { items };
  }
  throw new Error(`Unknown source kind "${source.kind}"`);
}

export const SOURCE_KINDS = ["atom", "rss", "github-advisories", "nvd", "page-watch", "fixture"];
export const SOURCE_CATEGORIES = ["security", "framework", "ai-platform", "cloud", "devops", "standards", "publication"];
