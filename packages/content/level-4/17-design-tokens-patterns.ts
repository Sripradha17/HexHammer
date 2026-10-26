import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s17",
  level: 4,
  order: 17,
  title: "Design tokens and component patterns",
  runner: "iframe",

  look: `A design token is a custom property (you met these already) with a NAME that describes its JOB, not its raw value: --space-md instead of "16px", --color-danger instead of "red". The point is reuse: change the token once, and every component using it updates together, consistently.

  <style>
    :root {
      --space-md: 16px;
      --color-danger: crimson;
    }
    .button {
      padding: var(--space-md);
    }
    .alert {
      padding: var(--space-md);
      border: 2px solid var(--color-danger);
    }
  </style>

This is exactly how Hexhammer's OWN design system works: open packages/design-system/src/tokens.css and you will find --hh-space-4, --hh-purple, and the rest, each used by many components instead of every component inventing its own numbers. That consistency is the whole point of a design system: a button and a card that both use --space-md will always match, even as the value changes.

A COMPONENT PATTERN is just a reusable class, like .button or .card, built once and used everywhere that needs that look, instead of copy-pasting styles.`,

  type: `Build a tiny two-token design system, and use it in two places:
1. Define --space-md as 16px and --color-brand as teal, both on :root.
2. Make .button use var(--space-md) for its padding, and var(--color-brand) for its background.
3. Make .card use var(--space-md) for its padding, and var(--color-brand) for its border-color.
(Both components reuse the SAME two tokens.)`,

  break: `Break it on purpose: give .card its own separate --space-md: 20px override, so it no longer matches .button. Look at "Your page": the two are now visibly different sizes, even though they are supposed to share one spacing scale. That is exactly the inconsistency tokens are meant to prevent. Remove the override so both components share the one true value again.`,

  say: `In one sentence: what problem do design tokens solve that copy-pasting values everywhere does not?`,

  starterCode: `<!-- Strike 17: design tokens and component patterns. -->
<style>
  .button {
    border: none;
  }
  .card {
    border: 2px solid black;
  }
</style>
<button class="button">Go</button>
<div class="card">A card</div>
`,

  tests: `test("two tokens are defined on :root", () => {
  const styleText = document.querySelector("style").textContent;
  const rootMatch = styleText.match(/:root\\s*\\{[^}]*\\}/);
  expect(rootMatch !== null).toBe(true);
  expect(rootMatch[0].includes("--space-md")).toBe(true);
  expect(rootMatch[0].includes("--color-brand")).toBe(true);
});

test(".button reuses both tokens", () => {
  const styleText = document.querySelector("style").textContent;
  const buttonMatch = styleText.match(/\\.button\\s*\\{[^}]*\\}/);
  expect(buttonMatch !== null).toBe(true);
  expect(buttonMatch[0].includes("var(--space-md)")).toBe(true);
  expect(buttonMatch[0].includes("var(--color-brand)")).toBe(true);
});

test(".card reuses both tokens too, so it matches .button", () => {
  const styleText = document.querySelector("style").textContent;
  const cardMatch = styleText.match(/\\.card\\s*\\{[^}]*\\}/);
  expect(cardMatch !== null).toBe(true);
  expect(cardMatch[0].includes("var(--space-md)")).toBe(true);
  expect(cardMatch[0].includes("var(--color-brand)")).toBe(true);
});

test("the button and card are still on the page", () => {
  expect(document.querySelectorAll(".button").length).toBe(1);
  expect(document.querySelectorAll(".card").length).toBe(1);
});
`,

  hints: [
    "Add a :root { --space-md: 16px; --color-brand: teal; } block anywhere in the <style> tag.",
    "In .button, add padding: var(--space-md); and background: var(--color-brand);",
    "In .card, add padding: var(--space-md); and border-color: var(--color-brand); (you can leave its existing border line above that).",
  ],

  solution: `=== CODE ===
<style>
  :root {
    --space-md: 16px;
    --color-brand: teal;
  }
  .button {
    border: none;
    padding: var(--space-md);
    background: var(--color-brand);
  }
  .card {
    border: 2px solid black;
    border-color: var(--color-brand);
    padding: var(--space-md);
  }
</style>
<button class="button">Go</button>
<div class="card">A card</div>
=== LINE BY LINE ===
:root defines the two tokens once: --space-md (a spacing value) and --color-brand (a color), named after their JOB, not their raw number.
.button and .card both reach for the exact same var(--space-md) and var(--color-brand), instead of each writing their own "16px" and "teal" by hand. If the brand color ever changes, editing ONE line in :root updates both components together, and they can never quietly drift out of sync the way separately hand-typed values eventually do.
This is the same trick Hexhammer's own design system uses for its 8 level colors and its spacing scale, just with two tokens instead of dozens.`,
};
