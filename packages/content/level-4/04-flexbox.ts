import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s04",
  level: 4,
  order: 4,
  title: "CSS: flexbox",
  runner: "iframe",

  look: `Flexbox lines boxes up in a ROW (or a column) and is brilliant at spacing and centering them, which used to be surprisingly hard in CSS.

  <style>
    .row { display: flex; }
  </style>
  <div class="row">
    <div>one</div>
    <div>two</div>
  </div>

The moment you write display: flex, the DIRECT children line up in a row automatically. Then a few more properties control the spacing:

  justify-content: center          bunch them in the middle, along the row
  justify-content: space-between   push the first and last to the edges, spread the rest
  align-items: center              center them the OTHER way (up and down, in a row)
  gap: 16px                        a fixed gap between every child, no margins needed

Picture a row of people. justify-content is where they stand ALONG the line. align-items is whether they stand at the top, middle, or bottom of the line.`,

  type: `Style the box with class "row" so that its children:
1. Display as a flex row (display: flex).
2. Are centered along the row (justify-content: center).
3. Are centered up and down too (align-items: center).
4. Have a 12px gap between them.`,

  break: `Break it on purpose: set justify-content: flex-start instead of center, and look at "Your page". The three boxes bunch up on the left instead of the middle. Put center back, and notice how much easier that one-line change was than the old way of centering things in CSS.`,

  say: `In one sentence: what does display: flex do to an element's direct children?`,

  starterCode: `<!-- Strike 4: flexbox. Style .row so its three boxes line up centered, with a gap. -->
<style>
  .row {
    border: 2px solid black;
    height: 80px;
  }
  .box {
    width: 40px;
    height: 40px;
    background: gold;
  }
</style>
<div class="row">
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>
`,

  tests: `test("the row is a flex container", () => {
  const row = document.querySelector(".row");
  expect(getComputedStyle(row).display).toBe("flex");
});

test("children are centered both ways", () => {
  const row = document.querySelector(".row");
  const style = getComputedStyle(row);
  expect(style.justifyContent).toBe("center");
  expect(style.alignItems).toBe("center");
});

test("there is a 12px gap between the boxes", () => {
  const row = document.querySelector(".row");
  expect(getComputedStyle(row).gap).toBe("12px");
});

test("the three boxes are still there", () => {
  expect(document.querySelectorAll(".row .box").length).toBe(3);
});
`,

  hints: [
    "Add the new lines inside the existing .row { } block in the <style> tag: display: flex; to start.",
    "justify-content: center; centers along the row. align-items: center; centers the other way.",
    "gap: 12px; adds even spacing between the children, without needing any margin on the boxes themselves.",
  ],

  solution: `=== CODE ===
<style>
  .row {
    border: 2px solid black;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  .box {
    width: 40px;
    height: 40px;
    background: gold;
  }
</style>
<div class="row">
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>
=== LINE BY LINE ===
display: flex turns .row into a flex container. Its direct children (the three .box divs) automatically line up in a row, side by side, with no floats or extra markup needed.
justify-content: center gathers the children together in the middle ALONG the row (the main axis).
align-items: center centers them the OTHER way, so a 40px box sits in the middle of the 80px-tall row instead of stuck to the top.
gap: 12px puts 12 pixels of space between each pair of children, and only between them (no space is added before the first or after the last).`,
};
