import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s04",
  level: 2,
  order: 4,
  title: "Destructuring and spread",

  look: `Destructuring is UNPACKING, like opening a lunchbox and taking each snack out by name.

  const { name, age } = { name: "Sam", age: 10, hobby: "chess" };   // name is "Sam", age is 10
  const [first, second] = ["red", "blue", "green"];                  // first is "red", second is "blue"

You can even unpack right in the function's input list:

  function hello({ name }) { return "Hi " + name; }

Spread (three dots ...) is a PHOTOCOPIER. It copies everything out of an array or object.

  const more = [...[1, 2], 3];            // [1, 2, 3]   a new array
  const merged = { ...{ a: 1 }, b: 2 };   // { a: 1, b: 2 }   a new object

Copies are safe: changing the copy never changes the original.`,

  type: `Finish four functions:
1. describeUser({ name, age }) returns "Sam is 10". Unpack the input right in the parentheses.
2. swap(pair) takes [a, b] and returns [b, a]. Unpack it with [first, second].
3. mergeSettings(defaults, custom) returns a NEW object with both. If both have the same key, custom wins. Use spread.
4. addToEnd(list, item) returns a NEW array with the item at the end. The original must stay the same.`,

  break: `Break it on purpose: in addToEnd, use list.push(item) and return list instead of using spread.
The result looks right, but the ORIGINAL array got changed too. A test will catch it. Copies are safer. Put spread back.`,

  say: `In one sentence: what does the spread operator (...) do, and why is making a copy safer than changing the original?`,

  starterCode: `// Strike 4: destructuring and spread.

function describeUser(user) {
  // unpack name and age, then return "Sam is 10"
}

function swap(pair) {
  // return the two items in the opposite order
}

function mergeSettings(defaults, custom) {
  // return a new object: defaults first, then custom on top
}

function addToEnd(list, item) {
  // return a new array with the item on the end. Do not change list!
}
`,

  tests: `test("describeUser unpacks name and age", () => {
  expect(describeUser({ name: "Sam", age: 10 })).toBe("Sam is 10");
});

test("swap flips a pair", () => {
  expect(swap([1, 2])).toEqual([2, 1]);
  expect(swap(["a", "b"])).toEqual(["b", "a"]);
});

test("mergeSettings lets custom win", () => {
  expect(mergeSettings({ color: "red", size: 1 }, { size: 2 })).toEqual({ color: "red", size: 2 });
});

test("mergeSettings does not change the defaults", () => {
  const defaults = { color: "red" };
  mergeSettings(defaults, { color: "blue" });
  expect(defaults).toEqual({ color: "red" });
});

test("addToEnd adds one item", () => {
  expect(addToEnd([1, 2], 3)).toEqual([1, 2, 3]);
});

test("addToEnd does not change the original array", () => {
  const original = [1, 2];
  addToEnd(original, 3);
  expect(original).toEqual([1, 2]);
});
`,

  hints: [
    "In the parentheses of describeUser you can write curly braces: function describeUser({ name, age }). Now name and age are ready to use.",
    "swap: const [first, second] = pair; gives you the two pieces. Then return them in a new array in the other order.",
    "Spread goes inside the brackets: [...list, item] for arrays, and { ...defaults, ...custom } for objects. Later items win.",
  ],

  solution: `=== CODE ===
function describeUser({ name, age }) {
  return name + " is " + age;
}

function swap(pair) {
  const [first, second] = pair;
  return [second, first];
}

function mergeSettings(defaults, custom) {
  return { ...defaults, ...custom };
}

function addToEnd(list, item) {
  return [...list, item];
}
=== LINE BY LINE ===
describeUser: the curly braces in the input list unpack the object. We get name and age as ready-made boxes without writing user.name.
swap: [first, second] = pair unpacks by position. Then we build a new array with them in the other order.
mergeSettings: { ...defaults, ...custom } copies defaults in first, then copies custom on top. When a key is in both, the later copy wins, so custom wins. The original objects are untouched.
addToEnd: [...list, item] is a photocopy of list with one more item on the end. Because it is a new array, the original stays exactly as it was.`,
};
