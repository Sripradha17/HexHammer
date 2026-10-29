// PREPARE THE ART: turns the Canva pictures in src/assets/webdesign/ (numbered 1.png ... 66.png)
// into the small, web-ready pictures the app uses (src/assets/realm/). Run it again whenever a
// picture changes:
//
//   npm run prepare-art -w @hexhammer/web
//
// What it does, in plain words:
//   1. OWL: the owl pictures sit on a light grey page. A "magic wand" fill starts at the edges and
//      spreads through the page colour only, so the owl itself is never touched. The page becomes
//      see-through, and the soft outline is cleaned so no grey halo shows on dark screens.
//   2. BLINK: picture 57 is the owl with closed eyes, drawn a few pixels off from picture 56. We
//      find the exact shift, then keep ONLY the closed eyes as a small patch. Laid over picture 56,
//      it makes a real blink, with nothing else jumping.
//   3. CLOUDS and MIST sit on white. We "un-mix" the white (the exact reverse of painting a
//      see-through cloud onto white), then cut every cloud out as its own picture so each one can
//      drift at its own speed.
//   4. SCENES and the MAP are resized and saved as WebP (much smaller, same look).
//
// sharp is a free image library. Numbers like 56 are the picture numbers in webdesign/.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/assets/webdesign/", import.meta.url));
const OUT = fileURLToPath(new URL("../src/assets/realm/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const raw = async (n) => sharp(`${SRC}${n}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const save = (data, w, h) => sharp(data, { raw: { width: w, height: h, channels: 4 } });

// ---------------------------------------------------------------- 1. the owl, cut out

// Is this pixel part of the light grey page? Fairly light, and almost no colour. (Fairly, not very:
// the soft grey shadow under the owl's feet is page too.) The owl's own pale feathers look the
// same, which is why the fill must start at the edges and move in small steps: it can only reach
// page that is connected to the outside without crossing a drawn line.
const isPage = (r, g, b) => (r + g + b) / 3 > 105 && Math.max(r, g, b) - Math.min(r, g, b) < 26;
// Two neighbouring pixels are "the same page" when their colours are this close.
const STEP = 16;

function cutPage(data, w, h) {
  const bg = new Uint8Array(w * h);
  const stack = [];
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const near = (i, j) => {
    const [a, b, c] = px(i);
    const [d, e, f] = px(j);
    return Math.abs(a - d) + Math.abs(b - e) + Math.abs(c - f) < STEP;
  };
  // seeds: every page-coloured pixel on the picture's edge
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (isPage(...px(y * w + x))) (bg[y * w + x] = 1), stack.push(y * w + x);
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (isPage(...px(y * w + x))) (bg[y * w + x] = 1), stack.push(y * w + x);
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
      if (j < 0 || j >= w * h || bg[j]) continue;
      if (!isPage(...px(j)) || !near(i, j)) continue;
      bg[j] = 1;
      stack.push(j);
    }
  }
  // Closed pockets of page (the gap between the staff and the cloak) cannot be reached from the
  // edges. Clear big, very bright, page-coloured areas, but ONLY in the lower half of the picture:
  // the owl's pale face is in the top half and looks just like the page.
  const seen = new Uint8Array(w * h);
  for (let s = Math.floor(h / 2) * w; s < w * h; s++) {
    if (bg[s] || seen[s]) continue;
    const [r, g, b] = px(s);
    if (!isPage(r, g, b) || (r + g + b) / 3 < 200) continue;
    const members = [s];
    seen[s] = 1;
    for (let k = 0; k < members.length; k++) {
      const i = members[k];
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= w * h || seen[j] || bg[j] || !isPage(...px(j)) || !near(i, j)) continue;
        seen[j] = 1;
        members.push(j);
      }
    }
    if (members.length > 400) for (const i of members) bg[i] = 1;
  }
  // The page becomes clear. The 2-pixel band along the owl's outline is "un-mixed" from the page
  // colour next to it, so the outline keeps its true colour instead of a grey fringe.
  const dist = new Uint8Array(w * h).fill(255);
  for (let i = 0; i < w * h; i++) if (bg[i]) dist[i] = 0;
  for (let pass = 1; pass <= 2; pass++)
    for (let i = 0; i < w * h; i++) {
      if (dist[i] !== 255) continue;
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < w * h && dist[j] === pass - 1) dist[i] = pass;
    }
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) {
      data[i * 4 + 3] = 0;
      continue;
    }
    if (dist[i] === 255) continue;
    // the page colour beside this outline pixel
    let n = 0;
    const sum = [0, 0, 0];
    const x = i % w;
    for (const j of [i - 1, i + 1, i - w, i + w, i - w - 1, i - w + 1, i + w - 1, i + w + 1]) {
      if (j < 0 || j >= w * h || !bg[j] || Math.abs((j % w) - x) > 1) continue;
      sum[0] += data[j * 4];
      sum[1] += data[j * 4 + 1];
      sum[2] += data[j * 4 + 2];
      n++;
    }
    if (!n) continue;
    const page = sum.map((s) => s / n);
    const c = px(i);
    const d = Math.hypot(c[0] - page[0], c[1] - page[1], c[2] - page[2]);
    const a = Math.min(1, d / 70);
    data[i * 4 + 3] = Math.round(a * 255);
    if (a > 0.05) for (let k = 0; k < 3; k++) data[i * 4 + k] = Math.max(0, Math.min(255, Math.round((c[k] - (1 - a) * page[k]) / a)));
  }
  return data;
}

// Cut the owl out of picture n and save it `height` pixels tall (trimmed to the owl).
async function owl(n, name, height) {
  const { data, info } = await raw(n);
  cutPage(data, info.width, info.height);
  const trimmed = await save(data, info.width, info.height).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  await sharp(trimmed.data).resize({ height: Math.min(height, trimmed.info.height) }).webp({ quality: 88, alphaQuality: 95 }).toFile(`${OUT}${name}.webp`);
  console.log("owl  ", name, `${trimmed.info.width}x${trimmed.info.height}`, "trim offset", trimmed.info.trimOffsetLeft, trimmed.info.trimOffsetTop);
  return trimmed.info;
}

// The poses (the number of the picture, the name the app uses).
const POSES = [
  [56, "owl-stand"],
  [66, "owl-proud"],
  [65, "owl-walk"],
  [64, "owl-think"],
  [63, "owl-explain"],
  [62, "owl-point"],
  [60, "owl-cheer"],
  [61, "owl-wow"],
  [59, "owl-oops"],
  [58, "owl-fly"],
];
const sizes = {};
for (const [n, name] of POSES) sizes[name] = await owl(n, name, 760);

// ---------------------------------------------------------------- 2. the blink

// Find how far picture 57 is shifted from 56, by comparing the head (not the eyes, which differ).
{
  const A = await sharp(`${SRC}56.png`).greyscale().raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(`${SRC}57.png`).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = A.info.width;
  // the area around the eyes, in picture 56 (ear tufts down to the collar)
  const box = { x: 300, y: 250, w: 430, h: 330 };
  const eyes = { x: 350, y: 340, w: 330, h: 150 };
  let best = { dx: 0, dy: 0, score: Infinity };
  for (let dy = -40; dy <= 40; dy++)
    for (let dx = -40; dx <= 40; dx++) {
      let score = 0;
      for (let y = box.y; y < box.y + box.h; y += 3)
        for (let x = box.x; x < box.x + box.w; x += 3) {
          if (x >= eyes.x && x < eyes.x + eyes.w && y >= eyes.y && y < eyes.y + eyes.h) continue;
          score += Math.abs(A.data[y * w + x] - B.data[(y + dy) * w + (x + dx)]);
        }
      if (score < best.score) best = { dx, dy, score };
    }
  console.log("blink shift", best);
  // Cut the closed eyes out of 57 (shifted back into 56's place), with soft oval edges.
  const { data, info } = await sharp(`${SRC}57.png`).extract({ left: eyes.x + best.dx, top: eyes.y + best.dy, width: eyes.w, height: eyes.h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const nx = (x / info.width) * 2 - 1;
      const ny = (y / info.height) * 2 - 1;
      const r = Math.sqrt(nx * nx + ny * ny);
      data[(y * info.width + x) * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, (1.08 - r) / 0.2)));
    }
  await save(data, info.width, info.height).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}owl-blink.webp`);
  // Where the patch sits on the cut-out owl-stand / owl-hero, as percentages (printed for the app).
  const s = sizes["owl-stand"];
  console.log("blink patch %", {
    left: (((eyes.x - s.trimOffsetLeft * -1 - 0) / s.width) * 100).toFixed(2),
    top: (((eyes.y + s.trimOffsetTop) / s.height) * 100).toFixed(2),
    width: ((eyes.w / s.width) * 100).toFixed(2),
    height: ((eyes.h / s.height) * 100).toFixed(2),
    trim: [s.trimOffsetLeft, s.trimOffsetTop, s.width, s.height],
  });
}

// ---------------------------------------------------------------- 3. faces

// Faces come from the body poses, so the eyes always match the body (blue). (Pictures 50-55 are
// face close-ups, but 50-53 have amber eyes, and in 54-55 the pale face touches the page, so the
// cut-out would eat it.) Each entry: the cut-out, the head's centre (x, y as % of its width/height)
// and the square's size as % of its width. Measured from the cut-outs with a grid.
async function face(from, name, cx, cy, size) {
  const m = await sharp(`${OUT}${from}.webp`).metadata();
  const side = Math.round((size / 100) * m.width);
  const left = Math.max(0, Math.round((cx / 100) * m.width - side / 2));
  const top = Math.max(0, Math.round((cy / 100) * m.height - side / 2));
  await sharp(`${OUT}${from}.webp`).extract({ left, top, width: Math.min(side, m.width - left), height: Math.min(side, m.height - top) }).resize(256, 256, { fit: "cover" }).webp({ quality: 88, alphaQuality: 95 }).toFile(`${OUT}face-${name}.webp`);
}
await face("owl-stand", "calm", 50, 21, 52);
await face("owl-cheer", "grin", 52, 34, 28);
await face("owl-think", "think", 50, 15, 46);
await face("owl-oops", "oops", 47, 33, 34);
await face("owl-proud", "proud", 43, 15, 46);
await face("owl-wow", "wow", 50, 30, 30);
console.log("faces");

// ---------------------------------------------------------------- 4. clouds and mist

// "Un-mix" white: a pixel = a*colour + (1-a)*white, so a = how far it is from white.
async function unwhite(n) {
  const { data, info } = await raw(n);
  for (let i = 0; i < data.length; i += 4) {
    // (the "white" page is really 96% white, so the faintest 6% is page, not cloud)
    const a = Math.max(0, (Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]) / 255 - 0.06) / 0.94);
    data[i + 3] = Math.round(Math.min(1, a * 1.15) * 255);
    if (a > 0.02) for (let k = 0; k < 3; k++) data[i + k] = Math.max(0, Math.min(255, Math.round(255 - (255 - data[i + k]) / a)));
  }
  return { data, info };
}
{
  const { data, info } = await unwhite(48);
  // each cloud = one separate island of non-clear pixels
  const w = info.width;
  const h = info.height;
  const label = new Int32Array(w * h).fill(-1);
  const boxes = [];
  for (let s = 0; s < w * h; s++) {
    if (label[s] !== -1 || data[s * 4 + 3] < 40) continue;
    const id = boxes.length;
    const box = { x0: w, y0: h, x1: 0, y1: 0, n: 0 };
    const stack = [s];
    label[s] = id;
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      const y = (i - x) / w;
      box.x0 = Math.min(box.x0, x);
      box.x1 = Math.max(box.x1, x);
      box.y0 = Math.min(box.y0, y);
      box.y1 = Math.max(box.y1, y);
      box.n++;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= w * h || label[j] !== -1 || data[j * 4 + 3] < 40) continue;
        label[j] = id;
        stack.push(j);
      }
    }
    boxes.push(box);
  }
  const clouds = boxes.filter((b) => b.n > 4000).sort((a, b) => b.n - a.n);
  const pad = 12;
  for (const [k, b] of clouds.entries()) {
    const left = Math.max(0, b.x0 - pad);
    const top = Math.max(0, b.y0 - pad);
    await save(data, w, h)
      .extract({ left, top, width: Math.min(w - left, b.x1 - b.x0 + pad * 2), height: Math.min(h - top, b.y1 - b.y0 + pad * 2) })
      .webp({ quality: 85, alphaQuality: 90 })
      .toFile(`${OUT}cloud-${k + 1}.webp`);
  }
  console.log("clouds", clouds.length);
}
{
  const { data, info } = await unwhite(47);
  await save(data, info.width, info.height).trim({ threshold: 1 }).webp({ quality: 85, alphaQuality: 90 }).toFile(`${OUT}mist.webp`);
  console.log("mist");
}

// ---------------------------------------------------------------- 5. the map and the scenes

await sharp(`${SRC}49.png`).webp({ quality: 84 }).toFile(`${OUT}map.webp`);
// The map's lights, each on its own see-through layer (the app makes them glow and flow).
async function glow(name, pick) {
  const { data, info } = await raw(49);
  for (let i = 0; i < data.length; i += 4) data[i + 3] = Math.round(Math.max(0, Math.min(1, pick(data[i], data[i + 1], data[i + 2]))) * 255);
  await save(data, info.width, info.height).blur(0.6).webp({ quality: 80, alphaQuality: 90 }).toFile(`${OUT}map-${name}.webp`);
}
await glow("warm", (r, g, b) => (r > 190 && g > 140 && r - b > 90 ? (r - 190) / 45 : 0)); // golden roads, rings, windows
await glow("cool", (r, g, b) => (b > 180 && g > 150 && b - r > 50 ? (b - 180) / 50 : 0)); // blue crystals and portals
console.log("map");

// The scenes the app uses (see art/realm.ts: region scenes, quest stages, page places, and the
// shared quest's chapters), each as a big picture (stages, backdrops) and a small one (cards).
// To use another painting, add its number here and run the script again.
const SCENES_USED = [3, 5, 6, 7, 8, 10, 11, 13, 17, 19, 21, 22, 24, 25, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
for (const n of SCENES_USED) {
  await sharp(`${SRC}${n}.png`).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}scene-${n}.webp`);
  await sharp(`${SRC}${n}.png`).resize({ width: 720 }).webp({ quality: 76 }).toFile(`${OUT}scene-${n}-small.webp`);
}
console.log("scenes", SCENES_USED.length);
console.log(JSON.stringify(Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, [v.width, v.height, v.trimOffsetLeft, v.trimOffsetTop]]))));
