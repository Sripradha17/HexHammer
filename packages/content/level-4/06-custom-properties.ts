import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s06",
  level: 4,
  order: 6,
  title: "CSS: custom properties",
  runner: "iframe",

  look: `A custom property is a named value you invent yourself, like a variable, but for CSS. Its name must start with two dashes. You set it once and reuse it anywhere with var(...).

  <style>
    :root {
      --accent: teal;
    }
    .button {
      background: var(--accent);
    }
    .link {
      color: var(--accent);
    }
  </style>

:root means "the very top of the page", so anything set there is visible EVERYWHERE (custom properties flow down to children, the same way color and font do). Change --accent once, and both the button and the link update.

You can also OVERRIDE a custom property inside a smaller part of the page. Only that part (and its children) sees the new value; everything else keeps the original:

  <style>
    :root { --accent: teal; }
    .warning { --accent: red; }     /* only inside .warning */
  </style>
  <div class="warning">
    <button class="button">Danger</button>     <!-- this one is red -->
  </div>
  <button class="button">Safe</button>          <!-- this one stays teal -->

This is Hexhammer's own trick too: packages/design-system/src/tokens.css is full of custom properties like --hh-purple, all reused across the whole app.`,

  type: `In the <style> tag:
1. On :root, set a custom property --accent to the value teal.
2. Inside .warning, OVERRIDE --accent to the value crimson (only inside .warning).
3. Make .button's background use var(--accent), so it picks up whichever --accent is in effect around it.`,

  break: `Break it on purpose: move the --accent: crimson override out of .warning and onto :root instead (so there is only one --accent again, and it is crimson everywhere). Look at "Your page": now BOTH buttons are red, because there is no override left, just one value for the whole page. Put the override back inside .warning.`,

  say: `In one sentence: what is a CSS custom property, and how do you override it for just one part of the page?`,

  starterCode: `<!-- Strike 6: CSS custom properties. -->
<style>
  .button {
    background: gray;
    border: none;
    padding: 8px 16px;
  }
</style>
<button class="button">Safe</button>
<div class="warning">
  <button class="button">Danger</button>
</div>
`,

  tests: `test(":root sets --accent to teal", () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  expect(value).toBe("teal");
});

test(".warning overrides --accent to crimson", () => {
  const warning = document.querySelector(".warning");
  expect(warning !== null).toBe(true);
  const value = getComputedStyle(warning).getPropertyValue("--accent").trim();
  expect(value).toBe("crimson");
});

test(".button actually reuses var(--accent), instead of a hardcoded color", () => {
  const styleText = document.querySelector("style").textContent;
  const buttonRule = styleText.match(/\\.button\\s*\\{[^}]*\\}/);
  expect(buttonRule !== null).toBe(true);
  expect(buttonRule[0].includes("var(--accent)")).toBe(true);
});
`,

  hints: [
    "Add a :root { } block with --accent: teal; inside it, above or below the existing .button rule.",
    "Add a .warning { } block with --accent: crimson; inside it. This only changes --accent for things inside .warning.",
    "In .button, add background: var(--accent); (you can leave the old gray background line, the new one below it wins).",
  ],

  solution: `=== CODE ===
<style>
  :root {
    --accent: teal;
  }
  .warning {
    --accent: crimson;
  }
  .button {
    background: gray;
    background: var(--accent);
    border: none;
    padding: 8px 16px;
  }
</style>
<button class="button">Safe</button>
<div class="warning">
  <button class="button">Danger</button>
</div>
=== LINE BY LINE ===
:root { --accent: teal; } sets a page-wide default. Every element can read --accent unless something closer overrides it.
.warning { --accent: crimson; } only changes --accent for .warning and whatever is INSIDE it. Nothing outside .warning is affected, because custom properties only flow DOWN to children, never sideways or up.
background: var(--accent) tells the browser "look up the current value of --accent right here, and use it". The button outside .warning sees teal (from :root). The button inside .warning sees crimson (the closer override wins), even though both buttons share the exact same CSS rule.`,
};
