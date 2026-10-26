import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s03",
  level: 4,
  order: 3,
  title: "CSS: the box model",
  runner: "iframe",

  look: `Every single thing on a web page is a rectangle: a box. CSS's box model is the recipe for how big that box really is. From the inside out:

  content   the text or picture itself
  padding   see-through space INSIDE the border, like padding in an envelope
  border    a line drawn around the padding
  margin    see-through space OUTSIDE the border, pushing other boxes away

  .card {
    width: 200px;
    padding: 16px;
    border: 2px solid black;
    margin: 12px;
  }

Here is the trap: by default, padding and border are ADDED on top of your width, so a "200px" box can actually take up 220px. box-sizing: border-box fixes that, so width really means the whole box, padding and border included. Most developers turn it on everywhere.

  .card {
    box-sizing: border-box;
  }

Style goes inside a <style> tag, which you can put right in the page:

  <style>
    .card { padding: 16px; }
  </style>
  <div class="card">Hi</div>`,

  type: `Style the box with class "card" so that:
1. box-sizing is border-box.
2. padding is 16px.
3. border is 2px solid (any color).
Use a <style> tag. Do not change the HTML structure that is already there.`,

  break: `Break it on purpose: set padding: 16px but leave out box-sizing: border-box. Look at "Your page": the box is now wider than its neighbours, because the padding got ADDED to the width instead of eating into it. Put border-box back.`,

  say: `In one sentence: what does box-sizing: border-box change?`,

  starterCode: `<!-- Strike 3: the box model. Style .card in the <style> tag. -->
<style>
  .card {
    width: 200px;
  }
</style>
<div class="card">I am a card.</div>
`,

  tests: `test("the card uses border-box sizing", () => {
  const card = document.querySelector(".card");
  expect(card !== null).toBe(true);
  expect(getComputedStyle(card).boxSizing).toBe("border-box");
});

test("the card has 16px of padding", () => {
  const card = document.querySelector(".card");
  expect(getComputedStyle(card).paddingTop).toBe("16px");
  expect(getComputedStyle(card).paddingLeft).toBe("16px");
});

test("the card has a 2px solid border", () => {
  const card = document.querySelector(".card");
  const style = getComputedStyle(card);
  expect(style.borderTopWidth).toBe("2px");
  expect(style.borderTopStyle).toBe("solid");
});
`,

  hints: [
    "Add lines inside the existing .card { } block in the <style> tag. You do not need a new selector.",
    "box-sizing: border-box; and padding: 16px; are both one-line declarations, just like width.",
    "border is a shorthand for three things in one line: border: 2px solid black; (width, style, then any color).",
  ],

  solution: `=== CODE ===
<style>
  .card {
    width: 200px;
    box-sizing: border-box;
    padding: 16px;
    border: 2px solid black;
  }
</style>
<div class="card">I am a card.</div>
=== LINE BY LINE ===
width: 200px sets the box's target size.
box-sizing: border-box changes what "200px" MEANS: the padding and border now live INSIDE that 200px, instead of adding to it. Without this line, the real box would swell to 220px (200 + 16 padding on each side... well, plus the border too) once you add padding and a border.
padding: 16px pushes the text 16 pixels away from the edge on every side.
border: 2px solid black draws a 2-pixel solid black line around the padding. The three values are the width, the style, and the color, in that order.`,
};
