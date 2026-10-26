import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s12",
  level: 4,
  order: 12,
  title: "Browser rendering and Core Web Vitals",
  runner: "iframe",

  look: `The browser turns your HTML and CSS into pixels in a few steps: it reads the HTML (building the DOM), reads the CSS (building the CSSOM), combines them and works out where every box goes (layout), then paints the pixels. Core Web Vitals are three numbers Google measures to judge how that FEELS to a real visitor:

  LCP  (Largest Contentful Paint)   how long until the biggest thing on screen has appeared
  CLS  (Cumulative Layout Shift)    how much things jump around while the page loads
  INP  (Interaction to Next Paint)  how quickly the page responds after you click something

You cannot see real numbers for these inside this tiny practice page (they need a real, full page load to measure), but you CAN build the single habit that fixes the most common CLS problem: an image with no size reserves NO space until it finishes loading, so everything below it suddenly jumps down the moment it arrives. That jump is exactly what CLS measures.

  <img src="hero.jpg" width="640" height="360" alt="..." />

Setting width and height (even though CSS may later resize the image) tells the browser the image's SHAPE in advance, so it can reserve the right amount of space immediately and nothing has to jump later.`,

  type: `Fix the layout shift: give the image (id="hero") a width of 640 and a height of 360, using the width and height HTML attributes (not CSS). Do not change anything else.`,

  break: `Break it on purpose: set width and height using CSS in a <style> tag instead of the HTML attributes, then remove the HTML attributes. Real browsers can still reserve space from CSS sizes in modern versions, but the OLD, most reliable trick (and the one that works everywhere, including while the stylesheet is still loading) is the plain HTML attributes. Put width="640" height="360" back on the <img> tag itself.`,

  say: `In one sentence: why does giving an image a width and height in advance reduce layout shift (CLS)?`,

  starterCode: `<!-- Strike 12: Core Web Vitals. -->
<h1>Welcome</h1>
<img id="hero" src="hero.jpg" alt="A mountain at sunrise" />
<p>The rest of the page.</p>
`,

  tests: `test("the hero image has width and height set as attributes", () => {
  const hero = document.getElementById("hero");
  expect(hero.getAttribute("width")).toBe("640");
  expect(hero.getAttribute("height")).toBe("360");
});
`,

  hints: [
    'Add two attributes right inside the <img ...> tag: width="640" height="360".',
    "These go as plain HTML attributes, the same way src and alt are written, not inside a style attribute.",
    'The numbers are just numbers, no "px" needed on a width/height HTML attribute (unlike CSS).',
  ],

  solution: `=== CODE ===
<h1>Welcome</h1>
<img id="hero" src="hero.jpg" alt="A mountain at sunrise" width="640" height="360" />
<p>The rest of the page.</p>
=== LINE BY LINE ===
width="640" height="360" tells the browser the image's shape (and therefore its space on the page) before a single byte of the actual picture has downloaded. The browser reserves a 640-by-360 box immediately, so the paragraph below never has to jump when the real image finally arrives.
Without these, the image starts at height 0 (nothing to show yet), and the moment it loads, everything below it gets shoved down: a layout shift a real visitor actually sees and feels, and exactly what CLS is measuring.`,
};
