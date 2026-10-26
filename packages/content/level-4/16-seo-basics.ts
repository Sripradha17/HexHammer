import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s16",
  level: 4,
  order: 16,
  title: "SEO basics",
  runner: "iframe",

  look: `SEO (Search Engine Optimization) is making your page easy for a search engine (and for a person scanning results) to understand. Good news: most of it is stuff you already know how to do well.

Two things every page needs, in its <head>:

  <title>Hexhammer: learn to code by hand</title>
  <meta name="description" content="A free classroom for learning to code, by hand." />

The <title> is the big blue link text and the browser tab's label. The description is the small grey summary shown under it in search results. Neither should be missing, and neither should just say "Home" or "Untitled".

The rest of good SEO is stuff you have already learned in this level: ONE clear <h1>, a sensible heading order, semantic tags like <nav> and <main> instead of div soup, and real alt text on images. Search engines and screen readers both lean on the exact same well-structured HTML.`,

  type: `Fix the <head> and the structure:
1. Give the page a real <title> (not empty, not "Untitled") inside <head>.
2. Add a <meta name="description" content="..." /> inside <head>, with a real sentence (not empty).
3. There are currently two <h1> tags on the page; change the second one to <h2>, so there is only one h1.`,

  break: `Break it on purpose: write two words as the title, like <title>My Page</title>, and a one-word description like content="Home". Both TECHNICALLY pass our length-only tests below, but imagine this as a real search result: "My Page - Home" tells a searcher nothing about what your page actually offers. The tests can check that something is THERE; only you can make it actually useful. Write a real, specific title and description.`,

  say: `In one sentence: what do the <title> and meta description tags control in a search result?`,

  starterCode: `<!-- Strike 16: SEO basics. Note: <head> and <title> are allowed here, just this once! -->
<head>
  <title></title>
</head>
<h1>Hexhammer</h1>
<p>Learn to code by hand.</p>
<h1>Get started</h1>
<p>Pick a level and begin.</p>
`,

  tests: `test("the page has a real title", () => {
  const title = document.querySelector("title");
  expect(title !== null).toBe(true);
  expect(title.textContent.trim().length > 5).toBe(true);
});

test("the page has a real meta description", () => {
  const description = document.querySelector('meta[name="description"]');
  expect(description !== null).toBe(true);
  const content = description.getAttribute("content") || "";
  expect(content.trim().length > 10).toBe(true);
});

test("there is exactly one h1", () => {
  expect(document.querySelectorAll("h1").length).toBe(1);
});
`,

  hints: [
    'Put a real sentence between <title> and </title>, describing the page, like "Hexhammer: learn to code by hand".',
    'Add a new line inside <head>: <meta name="description" content="..." /> with a real sentence in content.',
    "Change the second <h1>Get started</h1> to <h2>Get started</h2>.",
  ],

  solution: `=== CODE ===
<head>
  <title>Hexhammer: learn to code by hand</title>
  <meta name="description" content="A free, browser-based classroom for learning to code by hand." />
</head>
<h1>Hexhammer</h1>
<p>Learn to code by hand.</p>
<h2>Get started</h2>
<p>Pick a level and begin.</p>
=== LINE BY LINE ===
<title> is what shows as the clickable blue link in search results, and as the browser tab's label. It should say what the page actually is, on its own, out of context.
<meta name="description" content="..."> supplies the short grey summary line under that title in search results. Search engines sometimes write their own if this is missing or too thin, which is rarely as good as one you wrote yourself.
Changing the second h1 to h2 leaves exactly one h1 on the page (the page's real, single main heading), with Get started correctly nested UNDER it as a subsection, matching what you practised in the WCAG strike.`,
};
