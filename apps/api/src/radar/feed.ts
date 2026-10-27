// A tiny RSS 2.0 + Atom reader. Feeds are just XML text; we pull out a few fields with simple,
// readable patterns. It is deliberately small: it only needs title, link, date and summary.
import { decodeEntities, toPlainText } from "./normalize";

export interface FeedItem {
  title: string;
  url: string;
  publishedAt: Date | null;
  summary: string;
}

const MAX_ITEMS = 50;

// The text inside the first <name>...</name> in a block (CDATA unwrapped), or "".
function tagText(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function parseDate(text: string): Date | null {
  if (!text) return null;
  const date = new Date(decodeEntities(text).trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

// Atom: <link rel="alternate" href="..."/>, or the first <link href> without a rel.
function atomLink(block: string): string {
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1]);
  const pick = links.find((attrs) => /rel=["']alternate["']/i.test(attrs)) ?? links.find((attrs) => !/rel=/i.test(attrs)) ?? links[0];
  const href = pick?.match(/href=["']([^"']+)["']/i)?.[1];
  return href ? decodeEntities(href) : "";
}

export function parseFeed(xml: string): FeedItem[] {
  const isAtom = /<feed\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(xml) || /<entry\b/i.test(xml);
  const blocks = [...xml.matchAll(isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);

  const items: FeedItem[] = [];
  for (const block of blocks.slice(0, MAX_ITEMS)) {
    const title = toPlainText(tagText(block, "title"), 200);
    const url = isAtom ? atomLink(block) : decodeEntities(tagText(block, "link") || tagText(block, "guid"));
    const published = isAtom
      ? parseDate(tagText(block, "published") || tagText(block, "updated"))
      : parseDate(tagText(block, "pubDate") || tagText(block, "dc:date"));
    const rawSummary = isAtom
      ? tagText(block, "content") || tagText(block, "summary")
      : tagText(block, "description") || tagText(block, "content:encoded");
    // Only keep items with a real http(s) link and a title: we never invent either.
    if (!title || !/^https?:\/\//i.test(url)) continue;
    items.push({ title, url: url.trim(), publishedAt: published, summary: toPlainText(rawSummary) });
  }
  return items;
}
