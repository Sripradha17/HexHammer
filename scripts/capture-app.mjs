// Captures screenshots of THIS app (not the inspiration sites) for docs/screenshots/.
// Start the app first (npm run dev), then run: node scripts/capture-app.mjs <folder> [path ...]
// Example: node scripts/capture-app.mjs before / /interview
//
// Each path is captured twice: desktop (1440x900) and mobile (390x844).
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.APP_URL ?? "http://localhost:5173";
const [folder = "app", ...paths] = process.argv.slice(2);
const OUT_DIR = path.join("docs", "screenshots", folder);

// Turn "/topic/js-closures" into "topic-js-closures" for a file name.
function slug(p) {
  return p === "/" ? "home" : p.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const sizes = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];
  for (const size of sizes) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
    for (const p of paths.length ? paths : ["/"]) {
      await page.goto(BASE + p, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200); // let entrance transitions finish
      const file = path.join(OUT_DIR, `${slug(p)}-${size.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("saved", file);
    }
    await page.close();
  }
  await browser.close();
}

main();
