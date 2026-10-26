import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l6-s03",
  level: 6,
  order: 3,
  title: "Effects",
  runner: "react",

  look: `An EFFECT is code that runs AFTER a render finishes, to do something OUTSIDE of React itself: setting the document's title, talking to a server, subscribing to something. useEffect takes the effect function, plus a DEPENDENCY ARRAY that decides when it reruns.

  React.useEffect(() => {
    document.title = "Count: " + count;
  }, [count]);

[count] means "only rerun this effect when count has actually changed since the last render". An empty array [] means "run it once, right after the first render, never again". Leaving the array off ENTIRELY means "rerun after every single render" — rarely what you actually want, since it repeats the effect's work even when nothing relevant changed.`,

  type: `Finish the effect: set document.title to "Count: " followed by the current count, so the title always reflects it.`,

  break: `Break it on purpose: remove the dependency array entirely (just React.useEffect(() => { ... }); with no second argument). The title still technically stays correct here, but now the effect reruns after EVERY render, even ones that have nothing to do with count — in a bigger component doing real work (a network request, say), that would mean repeating it for no reason, every single time anything else changes. Add [count] back.`,

  say: `In one sentence: what does the dependency array actually control?`,

  starterCode: `function Counter() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // your code here
  }, [count]);

  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
`,

  tests: `test("the title reflects the count, both at the start and after it changes", async () => {
  // One sequential test on purpose: a separate test clicking the button could run concurrently
  // with this one (each awaits settle() independently) and race it over the SAME component.
  await settle();
  expect(document.title).toBe("Count: 0");

  document.getElementById("inc").click();
  await settle();
  expect(document.title).toBe("Count: 1");
});
`,

  hints: [
    "Inside the effect, set the real browser title: document.title = ...;",
    'Build the string by joining the label and the number: "Count: " + count',
    'document.title = "Count: " + count;',
  ],

  solution: `=== CODE ===
function Counter() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    document.title = "Count: " + count;
  }, [count]);

  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
=== LINE BY LINE ===
React.useEffect(() => { ... }, [count]) runs its function AFTER React has finished rendering, and ONLY when count is different from what it was on the previous render.
document.title = "Count: " + count is a real, visible side effect OUTSIDE of React's own rendering: React does not manage the browser tab's title for you, so an effect is exactly the right place to do it.
Clicking the button changes count, which triggers a re-render AND (because count is in the dependency array) reruns this effect right after, keeping the title in sync automatically.`,
};
