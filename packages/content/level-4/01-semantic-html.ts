import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s01",
  level: 4,
  order: 1,
  title: "Semantic HTML",
  runner: "iframe",

  look: `Welcome to a brand new kind of strike! From here on, you are not writing a function. You are building a real WEB PAGE, and you will see it rendered on the right, live, as you type.

HTML tags describe what a piece of a page IS, not just how it looks. Tags that describe their MEANING are called semantic tags. Compare these two ways of building the exact same-looking page:

  <div class="header">...</div>       <header>...</header>
  <div class="nav">...</div>          <nav>...</nav>
  <div class="main">...</div>         <main>...</main>
  <div class="footer">...</div>       <footer>...</footer>

Both can look identical, but the right column tells the browser, a search engine, and a blind visitor's screen reader what each piece actually IS. That is semantic HTML.

The main landmarks of a page:
  <header>   the top: a logo, a title
  <nav>      the links that move you around the site
  <main>     the ONE most important content of the page (only one per page!)
  <footer>   the bottom: copyright, small links

A page should have exactly ONE <h1> (its main heading), the way a book has one title.`,

  type: `Build a tiny page with all the landmarks. In the editor:
1. A <header> containing an <h1> with the text "Hexhammer".
2. A <nav> containing at least two links (<a href="#">...</a>).
3. A <main> containing one <p> of any text.
4. A <footer> containing any text.`,

  break: `Break it on purpose: change your <main> to a second <header>, so the page has two headers and no main. Run the tests and read which one fails. Semantic tags are not just decoration: tools (and our tests!) really do look for them by name. Put <main> back.`,

  say: `In one sentence: what is the difference between <div class="nav"> and <nav>?`,

  starterCode: `<!-- Strike 1: semantic HTML. Build the page, then look at "Your page" on the right! -->
<div class="header">
  <h1>Hexhammer</h1>
</div>
<div class="nav">
  <a href="#">Home</a>
</div>
<div class="content">
  <p>Hello!</p>
</div>
<div class="footer">Made with Hexhammer</div>
`,

  tests: `test("there is exactly one header, nav, main and footer", () => {
  expect(document.querySelectorAll("header").length).toBe(1);
  expect(document.querySelectorAll("nav").length).toBe(1);
  expect(document.querySelectorAll("main").length).toBe(1);
  expect(document.querySelectorAll("footer").length).toBe(1);
});

test("the header contains the one and only h1", () => {
  expect(document.querySelectorAll("h1").length).toBe(1);
  const h1 = document.querySelector("header h1");
  expect(h1 !== null).toBe(true);
  expect(h1.textContent).toBe("Hexhammer");
});

test("the nav has at least two links", () => {
  const links = document.querySelectorAll("nav a");
  expect(links.length >= 2).toBe(true);
});

test("main has a paragraph, and footer is not empty", () => {
  expect(document.querySelectorAll("main p").length >= 1).toBe(true);
  expect(document.querySelector("footer").textContent.trim().length > 0).toBe(true);
});
`,

  hints: [
    "Swap each labelled div for its matching semantic tag: header, nav, main, footer. The opening AND the closing tag both need to change.",
    'The <h1> goes INSIDE the <header>, not beside it. The nav needs a second <a href="#">...</a> next to the first.',
    'Your "content" div should become <main>, and it needs a <p>text</p> inside it, not just bare text.',
  ],

  solution: `=== CODE ===
<header>
  <h1>Hexhammer</h1>
</header>
<nav>
  <a href="#">Home</a>
  <a href="#">About</a>
</nav>
<main>
  <p>Hello!</p>
</main>
<footer>Made with Hexhammer</footer>
=== LINE BY LINE ===
header wraps the top of the page and holds the one <h1>, the page's main heading.
nav wraps the links that move you around the site. Two <a href="#">...</a> links satisfy "at least two". A real href would point somewhere; "#" is a placeholder.
main wraps the ONE most important block of content, here a single <p>. A page should only ever have one <main>.
footer wraps the bottom of the page. Its text just needs to not be empty.
Nothing here LOOKS any different without CSS, but a screen reader, a search engine, and our own tests can now tell exactly what each part of the page is for.`,
};
