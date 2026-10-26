import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s09",
  level: 4,
  order: 9,
  title: "CSS: responsive design",
  runner: "iframe",

  look: `Responsive design means your page adapts to whatever screen it is shown on: a huge monitor, a laptop, or a phone in someone's pocket. The main tool is a MEDIA QUERY: a rule that only applies when the screen matches a condition.

  <style>
    .row {
      display: block;         /* stacked, the default: safe on a narrow phone */
    }
    @media (min-width: 600px) {
      .row {
        display: flex;        /* side by side, once there is enough room */
      }
    }
  </style>

Read @media (min-width: 600px) { ... } as "once the screen is AT LEAST 600 pixels wide, also apply these rules". The habit called MOBILE FIRST is to write your plain, un-wrapped CSS for the narrow phone case, then ADD rules inside a min-width media query for wider screens. That way a phone never has to download or fight against desktop layout rules it does not need.

You will meet this exact pattern again in Hexhammer's own CSS: search app.css for @media (min-width: and you will find the real thing.`,

  type: `Make .row respond to screen width:
1. Outside any media query, .row should be display: block (the safe, narrow default).
2. Inside a @media (min-width: 600px) block, .row should become display: flex.
Do not change the HTML.`,

  break: `Break it on purpose: change min-width: 600px to max-width: 600px. Now the flex layout applies BELOW 600px and disappears above it: backwards from what you want. min-width means "at least this wide" (grows up from small); max-width means "at most this wide" (shrinks down from large). Put min-width back.`,

  say: `In one sentence: what does @media (min-width: 600px) mean, and what is "mobile first"?`,

  starterCode: `<!-- Strike 9: responsive design. -->
<style>
  .row {
    border: 2px solid black;
  }
</style>
<div class="row">
  <div>one</div>
  <div>two</div>
</div>
`,

  tests: `test(".row is block by default, OUTSIDE the media query (the narrow-screen case)", () => {
  const styleText = document.querySelector("style").textContent;
  const outsideMedia = styleText.replace(/@media[\\s\\S]*/, "");
  const rowRule = outsideMedia.match(/\\.row\\s*\\{[^}]*\\}/);
  expect(rowRule !== null).toBe(true);
  expect(rowRule[0].includes("display")).toBe(true);
  expect(rowRule[0].includes("block")).toBe(true);
});

test("the stylesheet has a min-width media query that turns .row into flex", () => {
  const styleText = document.querySelector("style").textContent;
  const mediaMatch = styleText.match(/@media[^{]*min-width:\\s*600px[^{]*\\{[\\s\\S]*?\\}\\s*\\}/);
  expect(mediaMatch !== null).toBe(true);
  expect(mediaMatch[0].includes("display")).toBe(true);
  expect(mediaMatch[0].includes("flex")).toBe(true);
});
`,

  hints: [
    "Add display: block; to the existing .row { } rule, outside of any media query.",
    "Below that rule, add a new block: @media (min-width: 600px) { }",
    "Inside the media query, write a new .row { display: flex; } rule. It only takes effect once the screen is wide enough.",
  ],

  solution: `=== CODE ===
<style>
  .row {
    border: 2px solid black;
    display: block;
  }
  @media (min-width: 600px) {
    .row {
      display: flex;
    }
  }
</style>
<div class="row">
  <div>one</div>
  <div>two</div>
</div>
=== LINE BY LINE ===
.row { display: block; } is the safe, plain default: on a narrow phone screen, this is all that ever applies.
@media (min-width: 600px) { ... } wraps a second .row rule that ONLY takes effect once the screen is at least 600 pixels wide. Below that width, the browser skips everything inside the media query completely, as if it were not there.
Because the wide-screen rule comes AFTER the plain one, and both are equally specific, the later one wins once the media query becomes active. That is mobile first: start simple, then layer on more for the room you have.`,
};
