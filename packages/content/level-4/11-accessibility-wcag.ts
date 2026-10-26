import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s11",
  level: 4,
  order: 11,
  title: "Accessibility: WCAG and a screen reader check",
  runner: "iframe",

  look: `WCAG (Web Content Accessibility Guidelines) is the official rulebook for accessible pages. You do not need to memorise it, but two of its most common rules are easy to build into every page you write:

  1. IMAGES NEED ALT TEXT. A screen reader cannot see a picture, so it reads the alt text instead. A purely decorative image (one that adds nothing if it is missing) should have alt="" (empty, on purpose) so the screen reader skips it politely instead of reading a filename.

     <img src="cat.jpg" alt="A ginger cat asleep on a keyboard" />
     <img src="line.png" alt="" />

  2. HEADINGS MUST NOT SKIP A LEVEL. h1, then h2, then h3, in order, like a book's table of contents. Screen reader users often jump PAGE STRUCTURE BY HEADING, so a page that jumps from h1 straight to h3 hides a whole level of the outline from them.

This is also a GUIDED-LOCAL habit: once you build a real page, turn on a screen reader (Windows: Narrator, Ctrl+Win+Enter; Mac: VoiceOver, Cmd+F5) and just listen to your own page for two minutes with your eyes closed. It is the fastest way to feel why alt text and heading order matter.`,

  type: `Fix the page:
1. Give the photo (id="photo") a real, descriptive alt text (not empty, not the filename).
2. Give the decorative divider image (id="divider") an empty alt="" (it is decoration only).
3. Fix the heading that jumps from h1 straight to h3: change it to h2, so the levels go h1, h2, h2.`,

  break: `Break it on purpose: try running a screen reader in "Your page" once you have it built (Narrator or VoiceOver). Listen for the photo: does what it announces actually describe the picture, or does it just say "image"? Then try leaving alt off completely on a real image (delete the attribute) and listen again: a screen reader often reads out the whole file path instead, which is worse than nothing. Put a real alt back.`,

  say: `In one sentence: why should a decorative image have alt="" instead of just no alt attribute at all?`,

  starterCode: `<!-- Strike 11: WCAG and a screen reader check. -->
<h1>My Trip</h1>
<img id="photo" src="beach.jpg" alt="beach.jpg" />
<img id="divider" src="line.png" />
<h3>Photos</h3>
<p>Some photos from the trip.</p>
`,

  tests: `test("the photo has real alt text, not the filename and not empty", () => {
  const photo = document.getElementById("photo");
  const alt = photo.getAttribute("alt");
  expect(alt === null || alt === "" || alt === "beach.jpg").toBe(false);
});

test("the decorative divider has an empty alt, on purpose", () => {
  const divider = document.getElementById("divider");
  expect(divider.getAttribute("alt")).toBe("");
});

test("the headings go h1, h2 (no level is skipped)", () => {
  const headingTags = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(
    (h) => Number(h.tagName[1]),
  );
  for (let i = 1; i < headingTags.length; i++) {
    expect(headingTags[i] - headingTags[i - 1] <= 1).toBe(true);
  }
});
`,

  hints: [
    'Change the photo\'s alt from "beach.jpg" to a real sentence describing what is in the picture, like alt="A sandy beach at sunset".',
    'Add alt="" (two quote marks, nothing between them) to the divider image.',
    "Change <h3>Photos</h3> to <h2>Photos</h2>, so the outline goes h1 then h2 with no gap.",
  ],

  solution: `=== CODE ===
<h1>My Trip</h1>
<img id="photo" src="beach.jpg" alt="A sandy beach at sunset" />
<img id="divider" src="line.png" alt="" />
<h2>Photos</h2>
<p>Some photos from the trip.</p>
=== LINE BY LINE ===
alt="A sandy beach at sunset" describes what is actually IN the picture, not the filename. A filename like "beach.jpg" or "IMG_4021.png" tells a screen reader user nothing useful.
alt="" (present, but empty) tells a screen reader "this image carries no information, skip it silently". That is different from LEAVING OFF alt entirely, which often makes a screen reader read out the whole image URL instead, which is far more annoying.
Changing h3 to h2 closes the gap in the heading outline. Now a screen reader user browsing by headings sees My Trip (h1) then Photos (h2), a sensible two-level outline, instead of a confusing jump.`,
};
