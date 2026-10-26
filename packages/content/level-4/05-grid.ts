import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s05",
  level: 4,
  order: 5,
  title: "CSS: grid",
  runner: "iframe",

  look: `Flexbox lines things up in ONE direction. Grid lays things out in a full ROWS-AND-COLUMNS table, without needing a <table>.

  <style>
    .gallery { display: grid; grid-template-columns: 1fr 1fr 1fr; }
  </style>
  <div class="gallery">
    <div>1</div><div>2</div><div>3</div>
    <div>4</div><div>5</div><div>6</div>
  </div>

display: grid turns on the grid, and grid-template-columns says how many columns there are and how wide each one is. fr means "a fraction of the leftover space": 1fr 1fr 1fr makes three EQUAL columns. Items automatically wrap onto a new row once a row is full, no extra markup needed.

A shortcut for "N equal columns": repeat(3, 1fr) means exactly the same as 1fr 1fr 1fr, just shorter to type.

  grid-template-columns: repeat(3, 1fr);

Just like flexbox, grid understands gap for even spacing between cells:

  gap: 12px;`,

  type: `Style the box with class "gallery" so that:
1. It becomes a grid (display: grid).
2. It has 3 equal columns, using repeat(3, 1fr).
3. It has a 10px gap.
Do not change the HTML: there should still be 6 tiles inside.`,

  break: `Break it on purpose: change repeat(3, 1fr) to repeat(2, 1fr). Look at "Your page": now there are 2 columns and 3 rows instead of 3 columns and 2 rows. The SAME six tiles, a completely different layout, from one number. Put the 3 back.`,

  say: `In one sentence: what is the difference between flexbox and grid?`,

  starterCode: `<!-- Strike 5: grid. Style .gallery so the 6 tiles form a 3-column grid with a gap. -->
<style>
  .gallery {
    border: 2px solid black;
  }
  .tile {
    background: gold;
    height: 40px;
  }
</style>
<div class="gallery">
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
</div>
`,

  tests: `test("the gallery is a grid", () => {
  const gallery = document.querySelector(".gallery");
  expect(getComputedStyle(gallery).display).toBe("grid");
});

test("the gallery has a 10px gap", () => {
  const gallery = document.querySelector(".gallery");
  expect(getComputedStyle(gallery).gap).toBe("10px");
});

test("all six tiles are still there", () => {
  expect(document.querySelectorAll(".gallery .tile").length).toBe(6);
});
`,

  hints: [
    "Add the new lines inside the existing .gallery { } block: display: grid; to start.",
    "grid-template-columns: repeat(3, 1fr); makes three equal-width columns. You do not need to add anything to .tile.",
    "gap: 10px; adds even spacing both between columns and between rows.",
  ],

  solution: `=== CODE ===
<style>
  .gallery {
    border: 2px solid black;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .tile {
    background: gold;
    height: 40px;
  }
</style>
<div class="gallery">
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
  <div class="tile"></div>
</div>
=== LINE BY LINE ===
display: grid turns .gallery into a grid container.
grid-template-columns: repeat(3, 1fr) says "make 3 columns, each the same fraction of the space". repeat(3, 1fr) is shorthand for 1fr 1fr 1fr. With six tiles and three columns, the browser automatically wraps them into two rows, with no extra markup.
gap: 10px spaces the cells apart, both across and down, without needing margin on every tile.
Flexbox is for lining things up along ONE line (and wrapping is a bit of an afterthought). Grid is built for a real two-dimensional layout: rows AND columns together, planned up front.`,
};
