import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l6-s02",
  level: 6,
  order: 2,
  title: "State",
  runner: "react",

  look: `STATE is a value a component remembers BETWEEN renders, and can change over time. useState gives you one piece of state, plus a function to change it:

  const [count, setCount] = React.useState(0);

count is the CURRENT value (0 at first). setCount is the ONLY correct way to change it: calling setCount(5) tells React "the real value is now 5, please re-render anything that depends on it." Changing a plain variable directly would not trigger a re-render at all; React would never find out.

  <button onClick={() => setCount(count + 1)}>+1</button>

The handler is wrapped in () => ...: React needs a FUNCTION to call LATER, when the button is actually clicked, not a value to use RIGHT NOW while rendering.`,

  type: `Add an onClick handler to the button that increases count by 1 each time it is clicked.`,

  break: `Break it on purpose: remove the arrow-function wrapper, writing onClick={setCount(count + 1)} instead of onClick={() => setCount(count + 1)}. This calls setCount IMMEDIATELY, during render, which triggers another render, which calls it again — React stops you with a real error: "Maximum update depth exceeded". Always hand React a function to call LATER, not a value computed right now.`,

  say: `In one sentence: why does changing a plain variable directly not make React re-render, the way calling setCount does?`,

  starterCode: `function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc">+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
`,

  tests: `test("the counter starts at 0, then correctly counts up as you click", async () => {
  // All in ONE test on purpose: separate tests here would run concurrently (each one awaits
  // settle() independently), racing each other over the SAME counter. One sequential test keeps
  // every click-then-check pair strictly in order, with no race between separate test() calls.
  await settle();
  expect(document.getElementById("count").textContent).toBe("0");

  document.getElementById("inc").click();
  await settle();
  expect(document.getElementById("count").textContent).toBe("1");

  // One click, then a real wait for React to re-render, THEN the next click — not two clicks
  // back to back. Firing both in the same instant would have both see the SAME count value
  // (count + 1 computed from the same, not-yet-updated closure), only adding 1 total instead
  // of 2 — a real, well-known React gotcha, saved for a later, more advanced strike.
  document.getElementById("inc").click();
  await settle();
  document.getElementById("inc").click();
  await settle();
  expect(document.getElementById("count").textContent).toBe("3");
});
`,

  hints: [
    "Add onClick={...} to the button.",
    "The handler needs to be a function that calls setCount with the new value: () => setCount(count + 1)",
    '<button id="inc" onClick={() => setCount(count + 1)}>+1</button>',
  ],

  solution: `=== CODE ===
function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
=== LINE BY LINE ===
const [count, setCount] = React.useState(0) gives this component ONE remembered value, starting at 0, and the ONE function allowed to change it.
onClick={() => setCount(count + 1)} hands React a function to run LATER, when the button is actually clicked — not the RESULT of calling setCount right now, during render.
Every call to setCount triggers a fresh render of this component, with count now holding the new value, which is why {count} in the JSX always shows the latest number.`,
};
