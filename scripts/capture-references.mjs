// Captures the design-reference screenshots listed in docs/design-references/reference-catalog.md.
// Run: node scripts/capture-references.mjs
//
// What it does, in plain words:
// 1. Opens each reference website in a headless (invisible) Chromium browser.
// 2. Waits for the page to settle, then saves a screenshot of the first screen ("above the fold").
// 3. Writes a small log (capture-log.json) with what REALLY happened: the final address,
//    the page title, the HTTP status and any error. The catalog is written from this log,
//    so it never claims a capture that did not happen.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join("docs", "design-references", "screenshots");

// One entry per reference. `file` is a suggested name; we keep it only if the capture works.
const TARGETS = [
  { file: "01-awwwards-home.png", url: "https://www.awwwards.com/" },
  { file: "02-recent-design-via-godly-redirect.png", url: "https://godly.website/" },
  { file: "12-godly-design-sites.png", url: "https://godly.design/sites/" },
  { file: "03-refero-home.png", url: "https://refero.design/" },
  { file: "04-mobbin-home.png", url: "https://mobbin.com/" },
  { file: "05-hoverstates-home.png", url: "https://www.hoverstat.es/" },
  { file: "06-siteinspire-home.png", url: "https://www.siteinspire.com/" },
  { file: "07-motion-react-docs.png", url: "https://motion.dev/docs/react" },
  { file: "08-shadcn-components.png", url: "https://ui.shadcn.com/docs/components" },
  { file: "09-shadcn-dialog.png", url: "https://ui.shadcn.com/docs/components/dialog" },
  { file: "10-r3f-docs.png", url: "https://r3f.docs.pmnd.rs/getting-started/introduction" },
  // A second, scrolled view of Awwwards, to see how its lists of sites are laid out.
  { file: "11-awwwards-scrolled.png", url: "https://www.awwwards.com/", scrollY: 1400 },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const log = [];

  // Optional: `node scripts/capture-references.mjs awwwards` re-captures only matching files.
  const only = process.argv[2];
  const targets = only ? TARGETS.filter((t) => t.file.includes(only)) : TARGETS;

  for (const target of targets) {
    const entry = { ...target, capturedAt: new Date().toISOString() };
    try {
      const response = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      // Give fonts, images and intro animations a moment to finish.
      await page.waitForTimeout(4000);
      if (target.scrollY) {
        await page.evaluate((y) => window.scrollTo(0, y), target.scrollY);
        await page.waitForTimeout(2000);
      }
      entry.status = response?.status() ?? null;
      entry.finalUrl = page.url();
      entry.title = await page.title();
      await page.screenshot({ path: path.join(OUT_DIR, target.file) });
      entry.saved = true;
    } catch (error) {
      entry.saved = false;
      entry.error = String(error).slice(0, 300);
    }
    log.push(entry);
    console.log(entry.saved ? "saved " : "FAILED", target.file, entry.status ?? "", entry.title ?? entry.error);
  }

  await browser.close();

  // Merge with the previous log, so a partial re-run keeps the other entries.
  const logPath = path.join("docs", "design-references", "analysis", "capture-log.json");
  let previous = [];
  try {
    previous = JSON.parse(await readFile(logPath, "utf8"));
  } catch {
    // no previous log yet
  }
  const merged = previous.filter((old) => !log.some((fresh) => fresh.file === old.file));
  await writeFile(logPath, JSON.stringify([...merged, ...log], null, 2));
}

main();
