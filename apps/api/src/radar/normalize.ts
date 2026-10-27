// Turning messy text from the internet into clean, comparable, SAFE plain text.
// Everything the radar downloads is untrusted: we only ever keep it as plain text, never run it,
// and never render it as HTML.

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

// "&lt;p&gt;Hi&amp;bye&#39;s" -> "<p>Hi&bye's"
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      // Only real, printable code points; anything else becomes a space.
      return Number.isFinite(n) && n > 31 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
    }
    return NAMED[code.toLowerCase()] ?? whole;
  });
}

// HTML (possibly escaped twice, as in GitHub's Atom feeds) -> one line of plain text.
export function toPlainText(html: string, maxLength = 600): string {
  let text = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  for (let pass = 0; pass < 2; pass++) {
    text = decodeEntities(text)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ");
  }
  text = text.replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

// The same page can be linked in many ways. This makes one stable form, so we can deduplicate:
// lowercase host, no tracking parameters, sorted query, no trailing slash, no #fragment
// (except our own "#hexhammer-change-..." marker used by the page watcher).
export function canonicalUrl(raw: string): string {
  const url = new URL(raw.trim());
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || ["fbclid", "gclid", "ref", "source"].includes(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (!url.hash.startsWith("#hexhammer-change-")) url.hash = "";
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) url.pathname = url.pathname.slice(0, -1);
  return url.toString();
}

// "React v19.2.0 — Released!" -> "react v19.2.0 released": used to notice the same news reported
// by two different sources with two different URLs.
export function titleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
