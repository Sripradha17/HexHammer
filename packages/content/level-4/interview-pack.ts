import type { InterviewPack } from "../types";

// Level 4 Interview Pack: Say-It cards, one Solve-It problem (tests only, NO solution), one STAR prompt.
export const interviewPack: InterviewPack = {
  level: 4,

  sayIt: [
    {
      question: "Why use <nav>, <main> and <button> instead of styled <div>s for the same job?",
      answer:
        "Semantic tags carry real MEANING a screen reader and a search engine can both use for free: <nav> announces itself as navigation, a real <button> is keyboard-focusable and clickable with Enter/Space automatically. A styled <div> gives you none of that for free; you would have to rebuild it all by hand with ARIA and JavaScript.",
    },
    {
      question: "What is the CSS box model, and what does box-sizing: border-box change?",
      answer:
        "Every element is content, then padding, then border, then margin, stacked outward. By default, width only sets the CONTENT box, so padding and border make the element bigger than the width you wrote. border-box makes width include padding and border too, so the element is exactly that wide.",
    },
    {
      question: "When do you reach for flexbox versus grid?",
      answer:
        "Flexbox is for ONE dimension at a time (a row OR a column of items that should flex to fit). Grid is for TWO dimensions at once (rows AND columns together, like a real layout grid). A simple navbar is flexbox; a whole page layout with a sidebar is usually grid.",
    },
    {
      question: "What is a CSS custom property, and why reuse var(--x) instead of repeating a literal value?",
      answer:
        "A custom property (--accent: teal;) is a named value you define once and reuse anywhere with var(--accent). Change the one definition, and every place that reused it updates together, instead of hunting down every literal 'teal' by hand.",
    },
    {
      question: "What does tabindex do, and why is a positive tabindex usually a bad idea?",
      answer:
        "tabindex controls keyboard focus order. tabindex=\"0\" adds an element to the NATURAL tab order (useful for a custom interactive element). A POSITIVE tabindex (like 5) jumps that element to a fixed position, ahead of everything else, which usually breaks the page's real reading order for keyboard users.",
    },
    {
      question: "Why is innerHTML dangerous for untrusted text, when textContent is not?",
      answer:
        "innerHTML PARSES the string as real HTML: untrusted text containing a <script> or an onerror= attribute can actually run. textContent always inserts the string as plain, inert text, no matter what it looks like — it can never create a new element or run anything.",
    },
    {
      question: "Name one Core Web Vital, and what it actually measures.",
      answer:
        "LCP (Largest Contentful Paint) measures how long until the biggest visible thing on the screen has loaded. CLS (Cumulative Layout Shift) measures how much content unexpectedly jumps around after it loads. Both measure a REAL user's experience, not just a generic 'page load time'.",
    },
    {
      question: 'Why does sandbox="allow-scripts" (with no allow-same-origin) block localStorage?',
      answer:
        "That combination deliberately gives the iframe an OPAQUE origin: it can run scripts, but it has no real origin of its own to store anything under. localStorage (and cookies, and reaching the parent page) all require a real origin, so the browser refuses them outright, by design.",
    },
    {
      question: "What is the same-origin policy, and how does CORS relate to it?",
      answer:
        "By default, a page's own JavaScript can only freely read responses from its OWN origin (protocol + domain + port) — that is the same-origin policy, enforced by the BROWSER. CORS is how a SERVER grants permission for pages from OTHER origins to read its responses, via an Access-Control-Allow-Origin header.",
    },
    {
      question: "What is the value of a design token like --space-md, beyond just saving a few keystrokes?",
      answer:
        "A token names an INTENT ('medium spacing'), not just a value. Every component that reuses it stays consistent automatically, and the whole design system's spacing can be tuned in one place, instead of hunting down every hardcoded pixel value across the codebase.",
    },
  ],

  solveIt: {
    title: "Accessibility and safety helpers",
    minutes: 30,
    prompt: `Write three small pure-logic functions, each inspired by a real Level 4 idea.

1. firstSkippedHeading(levels) is given an array of heading levels, like [1, 2, 3, 2, 4]. Find the INDEX of the first place a level jumps by MORE than 1 from the one before it (a "skipped" heading level, the exact bug the WCAG strike taught you to catch). Return -1 if there is no skip. Going DOWN a level (3 then 2) is always fine; only jumping UP by more than 1 counts as a skip.

2. escapeHtml(text) escapes the five characters that make text unsafe to insert into HTML: & < > " ' become &amp; &lt; &gt; &quot; &#39;. Escape & FIRST, before the others (otherwise you would double-escape the ampersands you just inserted).

3. parseQueryString(query) parses a URL query string like "a=1&b=two" (with or without a leading "?") into a plain object: { a: "1", b: "two" }.

Talk out loud as you work: say your plan before you type, then say what each part is doing. Start a 30-minute timer.`,
    starterCode: `// Solve-It: accessibility and safety helpers.

function firstSkippedHeading(levels) {
  // your code here
}

function escapeHtml(text) {
  // your code here
}

function parseQueryString(query) {
  // your code here
}
`,
    tests: `test("firstSkippedHeading finds a real skip", () => {
  expect(firstSkippedHeading([1, 2, 3, 2, 4])).toBe(4);
});

test("firstSkippedHeading returns -1 when there is no skip", () => {
  expect(firstSkippedHeading([1, 2, 3, 2, 3])).toBe(-1);
});

test("firstSkippedHeading: going down a level is never a skip", () => {
  expect(firstSkippedHeading([1, 3])).toBe(1);
  expect(firstSkippedHeading([3, 1, 2])).toBe(-1);
});

test("escapeHtml escapes all five dangerous characters, & first", () => {
  expect(escapeHtml("<script>alert('hi')</script>")).toBe(
    "&lt;script&gt;alert(&#39;hi&#39;)&lt;/script&gt;",
  );
  expect(escapeHtml('Tom & Jerry "friends"')).toBe("Tom &amp; Jerry &quot;friends&quot;");
});

test("parseQueryString parses a real query string", () => {
  expect(parseQueryString("a=1&b=two")).toEqual({ a: "1", b: "two" });
});

test("parseQueryString handles a leading question mark", () => {
  expect(parseQueryString("?x=5")).toEqual({ x: "5" });
});

test("parseQueryString handles a single field with no &", () => {
  expect(parseQueryString("name=hex")).toEqual({ name: "hex" });
});
`,
  },

  star: {
    prompt:
      "Tell me about a time you improved a page's accessibility or performance. What did you measure, and how did you know it actually got better, not just different?",
    tips: [
      "S (Situation): what was the real problem, and who did it actually affect?",
      "T (Task): was this assigned to you, or did you find it yourself?",
      "A (Action): what you actually changed, and what tool told you where to look (a screen reader, Lighthouse, EXPLAIN-style measurement).",
      "R (Result): the number or observation that PROVED it improved, before versus after. Vague ('it felt faster') is much weaker than specific ('LCP went from 4.2s to 1.8s').",
      "Interviewers want proof you MEASURED the improvement, not just that you believe you made one. Practice out loud for about two minutes.",
    ],
  },
};
