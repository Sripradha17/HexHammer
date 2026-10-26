import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s14",
  level: 4,
  order: 14,
  title: "Web security: XSS",
  runner: "iframe",

  look: `XSS (Cross-Site Scripting) is what happens when text from someone ELSE (a comment, a search box, a username) gets treated as real HTML on your page, instead of as plain text. If an attacker's comment contains a <script> tag and your page runs it, that script can act as if it were you: read your cookies, click buttons, steal things.

The trap is one property: innerHTML PARSES its text as real HTML. textContent NEVER does; it always shows the text exactly as typed, safely.

  const comment = '<img src=x onerror="alert(1)">';

  el.innerHTML = comment;     // DANGEROUS: actually creates the <img>, which runs onerror
  el.textContent = comment;   // SAFE: shows the literal text "<img src=x onerror=...>" on screen

Rule of thumb: if you are inserting text that came from a PERSON (a form, a URL, another user), always use textContent (or an equivalent safe helper), never innerHTML. Only use innerHTML for HTML that YOU wrote yourself, as a fixed string in your own code.`,

  type: `Finish showComment(text). It should safely display untrusted text inside the element with id="output", so that even HTML-looking text shows up as plain, harmless text on the screen (use textContent, not innerHTML).`,

  break: `Break it on purpose: write showComment using el.innerHTML = text; instead of textContent. Run the tests: the "does not create a real element" test fails, because the <img> tag in the test's text got parsed into an ACTUAL image element sitting in your page, exactly the danger this strike is about. Switch back to textContent.`,

  say: `In one sentence: why is textContent safe for untrusted text, when innerHTML is not?`,

  starterCode: `<!-- Strike 14: XSS. -->
<div id="output"></div>

<script>
  function showComment(text) {
    // your code here
  }
  window.showComment = showComment;
</script>
`,

  tests: `test("shows plain text normally", () => {
  window.showComment("Nice article!");
  expect(document.getElementById("output").textContent).toBe("Nice article!");
});

test("HTML-looking text is shown as text, not turned into real elements", () => {
  window.showComment('<img src=x onerror="window.__hacked = true">');
  const output = document.getElementById("output");
  expect(output.querySelector("img")).toBe(null);
  expect(output.textContent.includes("<img")).toBe(true);
  expect(window.__hacked).toBe(undefined);
});
`,

  hints: [
    'Grab the output element: const output = document.getElementById("output");',
    "Set its textContent, not its innerHTML: output.textContent = text;",
    "That single line is the whole fix: textContent always treats its input as plain text, never as markup to parse.",
  ],

  solution: `=== CODE ===
<div id="output"></div>

<script>
  function showComment(text) {
    const output = document.getElementById("output");
    output.textContent = text;
  }
  window.showComment = showComment;
</script>
=== LINE BY LINE ===
document.getElementById("output") grabs the box we are going to fill.
output.textContent = text puts the text in as literal characters. Even if text is '<img src=x onerror="...">', the browser shows those exact characters on screen (angle brackets and all); it never tries to build a real <img> element out of them, so the onerror handler never has a chance to run.
The second test proves it two ways: output.querySelector("img") finds no real image (nothing was parsed), and window.__hacked was never set (the "attack" script never ran).`,
};
