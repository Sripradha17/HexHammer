import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s15",
  level: 3,
  order: 15,
  title: "TypeScript: narrowing",

  look: `Sometimes a box could hold several kinds of things (a union like string | number). Before you use it, you must CHECK which kind it is. TypeScript follows your checks and NARROWS the type inside each branch, like a detective ruling out suspects.

  function shout(x: string | number) {
    if (typeof x === "string") {
      return x.toUpperCase();     // here TypeScript knows x is a string
    }
    return x.toFixed(2);          // here it knows x must be a number
  }

The checks you can use:
  typeof x === "string"       basic kinds: string, number, boolean
  Array.isArray(x)            is it a list?
  x === null                  is it "nothing"? (careful: typeof null is "object", a famous JavaScript quirk!)
  "meow" in pet               does this object have a meow key?
  x instanceof Dog            was it made from the Dog class?
  shape.kind === "circle"     a "tag" field: a DISCRIMINATED UNION, the tidiest way of all

  type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };

The good news: these checks are REAL JavaScript that runs when your program runs. So in this strike you write the checks for real, and the tests run them.`,

  type: `Finish three functions (plain JavaScript, using the narrowing checks):
1. describe(value) returns: for a string "text of length N", for a number "number N", for an array "list of N", for null "nothing", for anything else "something else". Check null and arrays BEFORE you fall back to "something else".
2. area(shape) works with tagged shapes: { kind: "circle", radius }, { kind: "rect", width, height }, { kind: "square", side }. Return the area (round the circle's area to 2 decimals). For an unknown kind, throw new Error("Unknown shape").
3. speak(pet) returns pet.meow() if the pet has a meow method, pet.bark() if it has a bark method (use the "in" check), and "..." if it has neither.`,

  break: `Break it on purpose: in describe, put the typeof value === "object" check BEFORE the null check.
typeof null is "object", so null would be treated as an object, and you would get the wrong answer (or a crash). Order of checks matters. Put null first.`,

  say: `In one sentence: what is narrowing, and name two checks you can use to do it.`,

  starterCode: `// Strike 15: narrowing. Plain JavaScript checks that TypeScript can follow.

function describe(value) {
  // string, number, array, null, or something else
}

function area(shape) {
  // circle, rect or square (check shape.kind)
}

function speak(pet) {
  // use "meow" in pet, and "bark" in pet
}
`,

  tests: `test("describe a string", () => {
  expect(describe("hello")).toBe("text of length 5");
});

test("describe a number", () => {
  expect(describe(42)).toBe("number 42");
});

test("describe an array", () => {
  expect(describe([1, 2, 3])).toBe("list of 3");
});

test("describe null as nothing", () => {
  expect(describe(null)).toBe("nothing");
});

test("describe anything else", () => {
  expect(describe(true)).toBe("something else");
  expect(describe({ a: 1 })).toBe("something else");
});

test("area of a circle (rounded to 2 decimals)", () => {
  expect(area({ kind: "circle", radius: 2 })).toBe(12.57);
});

test("area of a rectangle and a square", () => {
  expect(area({ kind: "rect", width: 3, height: 4 })).toBe(12);
  expect(area({ kind: "square", side: 5 })).toBe(25);
});

test("area throws for an unknown shape", () => {
  let message = null;
  try { area({ kind: "triangle" }); } catch (error) { message = error.message; }
  expect(message).toBe("Unknown shape");
});

test("speak uses whichever method the pet has", () => {
  expect(speak({ meow: () => "meow!" })).toBe("meow!");
  expect(speak({ bark: () => "woof!" })).toBe("woof!");
  expect(speak({})).toBe("...");
});
`,

  hints: [
    'describe: an if / else if chain. typeof value === "string", typeof value === "number", Array.isArray(value), value === null. Put the null check before anything that treats value as an object.',
    'area: check shape.kind with if or switch. The circle is Math.PI * r * r, and Math.round(x * 100) / 100 rounds to two decimals. End with throw new Error("Unknown shape").',
    'speak: if ("meow" in pet) { return pet.meow(); } then the same for "bark", then return "..." at the end.',
  ],

  solution: `=== CODE ===
function describe(value) {
  if (typeof value === "string") {
    return "text of length " + value.length;
  } else if (typeof value === "number") {
    return "number " + value;
  } else if (Array.isArray(value)) {
    return "list of " + value.length;
  } else if (value === null) {
    return "nothing";
  }
  return "something else";
}

function area(shape) {
  if (shape.kind === "circle") {
    return Math.round(Math.PI * shape.radius * shape.radius * 100) / 100;
  } else if (shape.kind === "rect") {
    return shape.width * shape.height;
  } else if (shape.kind === "square") {
    return shape.side * shape.side;
  }
  throw new Error("Unknown shape");
}

function speak(pet) {
  if ("meow" in pet) {
    return pet.meow();
  }
  if ("bark" in pet) {
    return pet.bark();
  }
  return "...";
}
=== LINE BY LINE ===
describe: each check rules out one suspect. After the string and number checks, arrays get their own check (typeof an array is "object", which is not helpful). null is checked with === because typeof null lies and says "object".
area: shape.kind is the tag. Once you know it is "circle", the object is guaranteed to have a radius, so in TypeScript you could read shape.radius safely. That is a discriminated union. Math.round(x * 100) / 100 keeps two decimals. Anything unexpected throws, so mistakes are loud.
speak: "meow" in pet asks "does the object have this key?". It is the safe way to check a method exists before calling it.`,
};
