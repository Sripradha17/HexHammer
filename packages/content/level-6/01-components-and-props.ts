import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l6-s01",
  level: 6,
  order: 1,
  title: "Components and props",
  runner: "react",

  look: `A React component is just a function that returns JSX (markup that looks like HTML, right inside your JavaScript). PROPS are that function's INPUT: a plain object, handed to it by whoever renders it.

  function Greeting({ name }) {
    return <p>Hello, {name}!</p>;
  }

  <Greeting name="Sam" />   // renders: Hello, Sam!
  <Greeting name="Alex" />  // the SAME component, a DIFFERENT prop, a different result

{name} inside JSX means "insert the real VALUE of this variable here", not the literal word. This is the whole point of a component: write the shape ONCE, reuse it with different data as many times as you need.`,

  type: `Finish Greeting({ name }): return <p>Hello, {name}!</p>, using the real name prop, not a hardcoded word.`,

  break: `Break it on purpose: hardcode the name instead of using the prop (return <p>Hello, Sam!</p>;). Both <Greeting /> elements below still render something — but now the SECOND one wrongly says "Hello, Sam!" too, since it never actually reads its own name prop. Use {name} instead of a literal string.`,

  say: `In one sentence: what are props, and where do they come from?`,

  starterCode: `function Greeting({ name }) {
  // your code here
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <div>
    <div id="a"><Greeting name="Sam" /></div>
    <div id="b"><Greeting name="Alex" /></div>
  </div>
);
`,

  tests: `test("Greeting renders a personalized message using its name prop", async () => {
  await settle();
  expect(document.getElementById("a").textContent).toBe("Hello, Sam!");
});

test("the SAME component works correctly with a different prop value", async () => {
  await settle();
  expect(document.getElementById("b").textContent).toBe("Hello, Alex!");
});
`,

  hints: [
    "Inside Greeting, return real JSX: return <p>Hello, {name}!</p>;",
    "{name} inside JSX inserts the actual value of the name prop. A plain word like Sam, in quotes, would always say the same thing no matter what prop was passed in.",
    "function Greeting({ name }) {\n  return <p>Hello, {name}!</p>;\n}",
  ],

  solution: `=== CODE ===
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <div>
    <div id="a"><Greeting name="Sam" /></div>
    <div id="b"><Greeting name="Alex" /></div>
  </div>
);
=== LINE BY LINE ===
function Greeting({ name }) destructures the one prop it cares about straight out of its input object, the same destructuring you already used for plain function arguments back in Level 2.
<p>Hello, {name}!</p> mixes real markup with a real JavaScript value: anything inside {} in JSX is evaluated as an expression, so {name} becomes whichever string was actually passed in.
<Greeting name="Sam" /> and <Greeting name="Alex" /> are the SAME function, called twice, with two different inputs — exactly like calling greeting("Sam") and greeting("Alex") would be, just written as markup instead of a function call.`,
};
