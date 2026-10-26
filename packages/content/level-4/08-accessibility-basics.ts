import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s08",
  level: 4,
  order: 8,
  title: "Accessibility: keyboard and ARIA basics",
  runner: "iframe",

  look: `Accessibility (often shortened to a11y: "a", 11 letters, "y") means your page works for everyone, including people who cannot use a mouse, or cannot see the screen, or are using a screen reader that reads the page aloud.

Two habits that cover a lot of ground:

  1. ICON-ONLY BUTTONS NEED A LABEL. A trash-can icon means nothing to a screen reader unless you say what it does:

     <button aria-label="Delete item">🗑</button>

  aria-label is text a screen reader announces INSTEAD of the button's visible content. Sighted people never see it; screen reader users hear it.

  2. NEVER USE A POSITIVE tabindex. Pressing Tab moves focus through the page. tabindex="0" adds something to that normal order (handy for a <div> pretending to be a button). A POSITIVE number like tabindex="5" tries to reorder the WHOLE page's tab order and reliably makes things confusing. The three safe values are: no tabindex at all (the default, usually right), tabindex="0" (join the normal order), or tabindex="-1" (reachable by code, but skipped by Tab).

This is a GUIDED-LOCAL habit too: once you have built the page, try pressing only the Tab key (no mouse) in "Your page" and see if you can reach everything that matters, in a sensible order.`,

  type: `Fix the icon-only buttons and the broken tab order:
1. Give the "delete" button (🗑) an aria-label of "Delete item".
2. Give the "close" button (✕) an aria-label of "Close".
3. Remove the positive tabindex from the text input (delete the tabindex="5" attribute entirely, so it uses the safe default).`,

  break: `Break it on purpose: try tabindex="0" on the input instead of removing tabindex entirely, then add tabindex="1" to the delete button. Now press Tab repeatedly in "Your page": the delete button jumps to the very front of the page, ahead of things that appear before it visually. That is exactly the confusing reordering positive tabindex causes. Remove both tabindex attributes.`,

  say: `In one sentence: why does an icon-only button need an aria-label, and why should you avoid a positive tabindex?`,

  starterCode: `<!-- Strike 8: accessibility basics. -->
<input type="text" tabindex="5" />
<button>🗑</button>
<button>✕</button>
`,

  tests: `test("the delete button has an aria-label", () => {
  const buttons = document.querySelectorAll("button");
  const deleteButton = Array.from(buttons).find((b) => b.textContent.includes("🗑"));
  expect(deleteButton !== undefined).toBe(true);
  expect(deleteButton.getAttribute("aria-label")).toBe("Delete item");
});

test("the close button has an aria-label", () => {
  const buttons = document.querySelectorAll("button");
  const closeButton = Array.from(buttons).find((b) => b.textContent.includes("✕"));
  expect(closeButton !== undefined).toBe(true);
  expect(closeButton.getAttribute("aria-label")).toBe("Close");
});

test("nothing on the page uses a positive tabindex", () => {
  const all = document.querySelectorAll("*");
  const badOnes = Array.from(all).filter((el) => Number(el.getAttribute("tabindex")) > 0);
  expect(badOnes.length).toBe(0);
});
`,

  hints: [
    'aria-label is a plain HTML attribute, written just like any other: aria-label="Delete item" right inside the <button ...> tag.',
    'Do the same for the close button, with aria-label="Close".',
    'To remove an attribute, delete the whole thing, tabindex="5" and all, not just change the number.',
  ],

  solution: `=== CODE ===
<input type="text" />
<button aria-label="Delete item">🗑</button>
<button aria-label="Close">✕</button>
=== LINE BY LINE ===
aria-label="Delete item" gives the trash-can button a real, readable name. A screen reader announces "Delete item, button" instead of trying to read the emoji (or nothing at all).
aria-label="Close" does the same for the ✕ button.
Removing tabindex="5" lets the input go back to the normal, predictable tab order: the order things appear in the HTML. A positive tabindex tries to impose a NEW order on top of that, and as soon as two elements on a page disagree about their numbers, the result is a tab order nobody can predict, sighted or not.`,
};
