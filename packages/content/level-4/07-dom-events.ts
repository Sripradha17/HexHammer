import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s07",
  level: 4,
  order: 7,
  title: "DOM and events",
  runner: "iframe",

  look: `The DOM (Document Object Model) is your HTML, turned into objects JavaScript can read and change. Every tag becomes a live object you can grab and update.

  <p id="greeting">Hello</p>
  <script>
    const el = document.getElementById("greeting");   // grab it
    el.textContent = "Hi there!";                       // change it
  </script>

An EVENT is something that just happened: a click, a key press, a page load. You LISTEN for one with addEventListener, and hand it a function to run when it fires:

  <button id="go">Go</button>
  <script>
    document.getElementById("go").addEventListener("click", function () {
      console.log("clicked!");
    });
  </script>

Do not use onclick="..." written inside the HTML: keeping your JavaScript in a <script> tag, separate from your markup, is the modern habit, and it is what addEventListener is for.

Your <script> tag can go right after the HTML it uses: by the time it runs, the browser has already built the elements above it, so document.getElementById can find them.`,

  type: `Build a tiny counter:
1. A <button id="add">+1</button>.
2. A <p id="count">0</p>.
3. A <script> that adds a click listener to the button. Each click should add 1 to a running total and put the new total into the paragraph's text (as text, like "1", "2", "3").`,

  break: `Break it on purpose: change addEventListener("click", ...) to addEventListener("clic", ...) (a typo in the event name). Click the button in "Your page": nothing happens, and there is no error message anywhere, because "clic" is just a made-up event name that will simply never fire. Typos in event names fail silently, so double-check the spelling: click, not clic. Fix it.`,

  say: `In one sentence: what does addEventListener do, and what are its two main inputs?`,

  starterCode: `<!-- Strike 7: DOM and events. -->
<button id="add">+1</button>
<p id="count">0</p>

<script>
  // your code here
</script>
`,

  tests: `test("starts at 0", () => {
  expect(document.getElementById("count").textContent).toBe("0");
});

test("one click adds 1", () => {
  document.getElementById("add").click();
  expect(document.getElementById("count").textContent).toBe("1");
});

test("two more clicks keep counting from where it left off (3 total)", () => {
  document.getElementById("add").click();
  document.getElementById("add").click();
  expect(document.getElementById("count").textContent).toBe("3");
});
`,

  hints: [
    "In your <script>, make a variable to hold the running total: let total = 0;",
    'Grab the button and add a listener: document.getElementById("add").addEventListener("click", function () { ... });',
    'Inside the listener: total = total + 1; then document.getElementById("count").textContent = total; (JavaScript turns the number into text for you here).',
  ],

  solution: `=== CODE ===
<button id="add">+1</button>
<p id="count">0</p>

<script>
  let total = 0;
  document.getElementById("add").addEventListener("click", function () {
    total = total + 1;
    document.getElementById("count").textContent = total;
  });
</script>
=== LINE BY LINE ===
let total = 0 makes a box to remember the running count. Because it is declared OUTSIDE the click listener, it survives between clicks instead of resetting each time.
addEventListener("click", function () { ... }) registers the function to run every time the button is clicked, from now on, however many times that is.
Inside the function: total = total + 1 adds one, and textContent = total puts the new number into the paragraph. Setting textContent to a number is fine: JavaScript converts it to text automatically.
The tests click the real button (button.click()) and then read the paragraph's real text, exactly like a person clicking with a mouse would.`,
};
