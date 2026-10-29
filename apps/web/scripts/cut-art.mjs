// CUT THE MEDALS: crops the achievement medals out of the symbols sheet in
// docs/art-source/symbols.png into src/assets/realm/. (Everything else, the owl, the map and the
// scenes, comes from scripts/prepare-art.mjs.) Run it again if the sheet changes:
//
//   npm run cut-art -w @hexhammer/web
//
// sharp is a free image library. Every number below is a pixel position in the source sheet.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../../../docs/art-source/", import.meta.url));
const OUT = fileURLToPath(new URL("../src/assets/realm/", import.meta.url));
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- helpers

// A plain crop, saved as WebP (small files, still sharp).
async function crop(sheet, name, [left, top, width, height], quality = 86) {
  await sharp(SRC + sheet).extract({ left, top, width, height }).webp({ quality }).toFile(OUT + name + ".webp");
  console.log("crop ", name, `${width}x${height}`);
}

// ---------------------------------------------------------------- Achievement medals (symbols.png)

const MEDALS = [
  ["first-mission", 194], ["skill-mastered", 412], ["project-finished", 629], ["hard-challenge", 837], ["new-region", 1052],
];
for (const [name, x] of MEDALS) await crop("symbols.png", `medal-${name}`, [x - 104, 1048 - 104, 208, 208], 90);

console.log("done ->", OUT);
