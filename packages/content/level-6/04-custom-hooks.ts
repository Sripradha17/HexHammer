import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l6-s04",
  level: 6,
  order: 4,
  title: "Custom hooks",
  runner: "react",

  look: `A custom hook is just a plain function that calls OTHER hooks (useState, useEffect, ...) inside it, so you can reuse stateful behavior across different components instead of copy-pasting it.

  function useCounter(initial) {
    const [count, setCount] = React.useState(initial);
    function increment() {
      setCount(count + 1);
    }
    return { count, increment };
  }

  function Counter() {
    const { count, increment } = useCounter(0);
    return <button onClick={increment}>{count}</button>;
  }

The name matters, not just as a convention: React (and the tooling built around it) specifically recognizes a function starting with "use" as a hook, which is how it knows to enforce the real rules hooks have (like "only call them at a component's top level, never inside an if or a loop").`,

  type: `Finish useCounter(initial): it should return { count, increment }, where increment increases count by 1 each time it is called.`,

  break: `Break it on purpose: rename useCounter to trackCount (dropping the "use" prefix). The hook still technically runs here, but you have broken the one real signal React's own tooling (ESLint's hook rules, React DevTools) uses to recognize "this is a hook, enforce the hook rules on it". Always start a custom hook's name with use.`,

  say: `In one sentence: what does a custom hook actually let you reuse, that a plain helper function could not?`,

  starterCode: `function useCounter(initial) {
  const [count, setCount] = React.useState(initial);
  // your code here: define increment, then return { count, increment }
}

function Counter() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={increment}>+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
`,

  tests: `test("count starts at the initial value, then increment correctly counts up", async () => {
  // One sequential test on purpose: separate tests here would each await settle()
  // independently and could race each other over the SAME counter.
  await settle();
  expect(document.getElementById("count").textContent).toBe("0");

  document.getElementById("inc").click();
  await settle();
  expect(document.getElementById("count").textContent).toBe("1");

  // One click, then a real wait for React to re-render, THEN the next click — not two clicks
  // back to back, which would both see the SAME count value and only add 1 total, not 2 (a
  // real, well-known React gotcha, saved for a later, more advanced strike).
  document.getElementById("inc").click();
  await settle();
  document.getElementById("inc").click();
  await settle();
  expect(document.getElementById("count").textContent).toBe("3");
});
`,

  hints: [
    "Define a plain function inside useCounter: function increment() { ... }",
    "increment should call setCount with the new value: setCount(count + 1);",
    "return { count, increment }; at the end of useCounter.",
  ],

  solution: `=== CODE ===
function useCounter(initial) {
  const [count, setCount] = React.useState(initial);
  function increment() {
    setCount(count + 1);
  }
  return { count, increment };
}

function Counter() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={increment}>+1</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
=== LINE BY LINE ===
useCounter(initial) calls React.useState itself, INSIDE the hook, so all the real stateful logic (the state, and the one function allowed to change it) lives in one reusable place.
return { count, increment } hands the CALLING component exactly what it needs, without that component ever having to know HOW counting is implemented underneath.
Counter itself stays tiny: it just asks useCounter for a count and a way to increase it, and wires increment straight into a button's onClick — any other component needing the exact same counting behavior could call useCounter(0) too, with zero duplicated logic.`,
};
