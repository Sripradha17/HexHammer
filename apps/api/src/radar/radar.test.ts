// Tests for the Tech Radar's pure parts and connectors. A FAKE fetch is used, so these never go
// online and never depend on what a real website says today.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseFeed } from "./feed";
import { canonicalUrl, titleKey, toPlainText } from "./normalize";
import { classify } from "./classify";
import { FIXTURE_DIR, fetchText, nvdUrlWithWindow, runConnector, type FetchLike } from "./connectors";
import { checkSourceUrlShape, validateSource } from "./validateSource";
import { draftMission, validateMission } from "./missions";
import { getTopic } from "@hexhammer/content";

const fixture = (name: string) => readFileSync(path.join(FIXTURE_DIR, name), "utf8");

// A fake fetch that serves canned responses (and counts calls).
function fakeFetch(routes: Record<string, { status?: number; body: string } | Error>) {
  const calls: string[] = [];
  const impl: FetchLike = async (url) => {
    calls.push(url);
    const key = Object.keys(routes).find((k) => url.startsWith(k));
    const route = key ? routes[key] : { status: 404, body: "not found" };
    if (route instanceof Error) throw route;
    const status = route.status ?? 200;
    return { ok: status < 400, status, text: async () => route.body, headers: { get: () => "text/xml" } };
  };
  return { impl, calls };
}

describe("feed parsing", () => {
  it("reads Atom entries, decodes double-escaped HTML and drops scripts", () => {
    const items = parseFeed(fixture("fixture-framework-releases.atom.xml"));
    expect(items).toHaveLength(3);
    expect(items[0].title).toBe("Fixture Framework v3.0.0");
    expect(items[0].url).toBe("https://example.com/fixture-framework/releases/v3.0.0?utm_source=feed");
    expect(items[0].publishedAt?.toISOString()).toBe("2026-10-20T09:00:00.000Z");
    expect(items[0].summary).toContain("Breaking change");
    expect(items[0].summary).not.toMatch(/<|script|alert/);
  });

  it("reads RSS items with CDATA", () => {
    const items = parseFeed(fixture("fixture-framework-blog.rss.xml"));
    expect(items.map((i) => i.title)).toEqual(["Fixture Framework v3.0.0", "Introducing Fixture Streams (experimental preview)"]);
    expect(items[0].summary).toBe("Our write-up of the 3.0.0 release.");
  });

  it("skips items without a real http(s) link instead of inventing one", () => {
    const xml = `<rss><channel><item><title>No link</title></item><item><title>Bad</title><link>javascript:alert(1)</link></item></channel></rss>`;
    expect(parseFeed(xml)).toEqual([]);
  });
});

describe("normalising", () => {
  it("canonical URLs drop tracking params, fragments and trailing slashes", () => {
    expect(canonicalUrl("HTTPS://Example.COM/a/b/?utm_source=x&b=2&a=1#top")).toBe("https://example.com/a/b?a=1&b=2");
    expect(canonicalUrl("https://example.com/page#hexhammer-change-abc")).toBe("https://example.com/page#hexhammer-change-abc");
  });

  it("title keys match the same news from different sources", () => {
    expect(titleKey("Fixture Framework v3.0.0!")).toBe(titleKey("fixture framework  v3.0.0"));
  });

  it("plain text never keeps tags", () => {
    expect(toPlainText("&lt;img src=x onerror=alert(1)&gt;Hello")).toBe("Hello");
  });
});

describe("rule-based classification", () => {
  const base = { summary: "", category: "framework", sourceTopicIds: ["fe-event-loop"] };
  it("flags critical security advisories, as detected (not verified) impact", () => {
    const r = classify({ ...base, title: "SQL injection in a query builder", category: "security", severity: "critical" });
    expect(r.classification).toBe("critical-security");
    expect(r.reason).toMatch(/not a verified impact/);
  });
  it("treats a new major version as possibly breaking", () => {
    expect(classify({ ...base, title: "Thing v4.0.0" }).classification).toBe("breaking");
  });
  it("treats minor versions as capabilities and patches as minor", () => {
    expect(classify({ ...base, title: "Thing v4.2.0" }).classification).toBe("capability");
    expect(classify({ ...base, title: "Thing v4.2.3" }).classification).toBe("minor");
  });
  it("treats previews as emerging", () => {
    expect(classify({ ...base, title: "Introducing X (experimental preview)" }).classification).toBe("emerging");
  });
  it("marks items that match no topic as irrelevant", () => {
    expect(classify({ title: "Cooking tips", summary: "", category: "publication", sourceTopicIds: [] }).classification).toBe("irrelevant");
  });
});

describe("connectors", () => {
  it("retries a server error with backoff, then succeeds", async () => {
    let n = 0;
    const impl: FetchLike = async () => {
      n++;
      const ok = n > 1;
      return { ok, status: ok ? 200 : 503, text: async () => "fine", headers: { get: () => null } };
    };
    const result = await fetchText(impl, "https://example.com/feed", 1);
    expect(result.body).toBe("fine");
    expect(n).toBe(2);
  });

  it("does not retry a 404 (asking again will not help)", async () => {
    const { impl, calls } = fakeFetch({ "https://example.com/missing": { status: 404, body: "" } });
    await expect(fetchText(impl, "https://example.com/missing", 2)).rejects.toThrow("HTTP 404");
    expect(calls).toHaveLength(1);
  });

  it("page watch records a baseline first, then reports a change", async () => {
    const page1 = { "https://example.com/doc": { body: "<title>Docs</title><p>Version one</p>" } };
    const first = await runConnector({ url: "https://example.com/doc", kind: "page-watch", pageHash: null }, fakeFetch(page1).impl);
    expect(first.items).toEqual([]);
    expect(first.note).toMatch(/Baseline/);

    const page2 = { "https://example.com/doc": { body: "<title>Docs</title><p>Version two</p>" } };
    const second = await runConnector({ url: "https://example.com/doc", kind: "page-watch", pageHash: first.pageHash! }, fakeFetch(page2).impl);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].pageChange).toBe(true);
    expect(second.items[0].title).toBe("Page changed: Docs");
  });

  it("reads the advisory fixture with severities", async () => {
    const r = await runConnector({ url: "fixture://fixture-advisories.json", kind: "fixture", pageHash: null }, fakeFetch({}).impl);
    expect(r.items.map((i) => i.severity)).toEqual(["critical", "low"]);
  });

  it("refuses fixture names that try to escape the fixtures folder", async () => {
    await expect(runConnector({ url: "fixture://../../.env", kind: "fixture", pageHash: null }, fakeFetch({}).impl)).rejects.toThrow();
  });

  it("adds a 30-day date window to NVD queries", () => {
    const url = new URL(nvdUrlWithWindow("https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=node.js", new Date("2026-10-27T00:00:00Z")));
    expect(url.searchParams.get("pubStartDate")).toBe("2026-09-27T00:00:00.000");
    expect(url.searchParams.get("keywordSearch")).toBe("node.js");
  });
});

describe("source validation (before registering)", () => {
  it("rejects non-https, private-network and malformed addresses", () => {
    expect(checkSourceUrlShape("http://example.com/feed", "rss")).toMatch(/https/);
    expect(checkSourceUrlShape("https://127.0.0.1/feed", "rss")).toMatch(/public/);
    expect(checkSourceUrlShape("https://10.0.0.5/feed", "rss")).toMatch(/public/);
    expect(checkSourceUrlShape("not a url", "rss")).toMatch(/valid/);
    expect(checkSourceUrlShape("https://example.com/feed", "carrier-pigeon")).toMatch(/Kind/);
  });

  it("accepts a working feed and rejects a page that is not a feed", async () => {
    const good = fakeFetch({ "https://example.com/feed": { body: fixture("fixture-framework-blog.rss.xml") } });
    expect((await validateSource("https://example.com/feed", "rss", good.impl)).ok).toBe(true);
    const html = fakeFetch({ "https://example.com/page": { body: "<html><body>hi</body></html>" } });
    const bad = await validateSource("https://example.com/page", "rss", html.impl);
    expect(bad.ok).toBe(false);
  });
});

describe("learning missions", () => {
  const topic = getTopic("fe-event-loop")!;
  const update = { title: "Fixture Framework v3.0.0", summary: "Breaking change.", canonicalUrl: "https://example.com/x", classificationReason: "Rule" };

  it("drafts only source facts and leaves the rest for a human", () => {
    const draft = draftMission(update, topic);
    expect(draft.whatChanged).toContain("Fixture Framework v3.0.0");
    expect(draft.whyChanged).toBe("");
    expect(draft.before).toBe("");
    expect(draft.references).toEqual([{ title: "Fixture Framework v3.0.0", url: "https://example.com/x" }]);
  });

  it("blocks approval until required parts are written, and strips markup", () => {
    const draft = draftMission(update, topic);
    expect(validateMission(draft, true).problems.length).toBeGreaterThan(0);
    const filled = { ...draft, whyChanged: "<b>Simpler</b> API", before: "onNext()", now: "async pipeline", exercise: "Migrate a handler." };
    const { content, problems } = validateMission(filled, true);
    expect(problems).toEqual([]);
    expect(content.whyChanged).toBe("Simpler API");
  });

  it("rejects non-https references", () => {
    expect(validateMission({ references: [{ title: "x", url: "javascript:alert(1)" }] }, false).problems[0]).toMatch(/https/);
  });
});
