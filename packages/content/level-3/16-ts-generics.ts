import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s16",
  level: 3,
  order: 16,
  title: "TypeScript: generics",

  look: `A generic is a function or type with a PLACEHOLDER for the type, like a label that says "this box holds THING" where THING gets filled in later.

Imagine a function that returns the first item of a list. It should work for a list of numbers, a list of names, a list of anything. And it should promise: "if you give me numbers, I give you back a number".

  function first<T>(list: T[]): T {
    return list[0];
  }

  first([1, 2, 3])        // TypeScript works out T = number, so the answer is a number
  first(["a", "b"])       // T = string, so the answer is a string

T is just a name (people usually use T for "type"). Read <T> as "for any type T".

Generics show up everywhere, and you have already met them:
  Array<number>          the same as number[]
  Promise<string>        a promise that will hold a string
  Map<string, number>    a map from strings to numbers

You can make your own types generic too:

  interface Box<T> { value: T }
  const luckyNumber: Box<number> = { value: 7 };

And you can put a rule on the placeholder with extends: <T extends { length: number }> means "T can be any type, as long as it has a length" (strings and arrays qualify).

This is a GUIDED-LOCAL strike: try the examples in the TypeScript Playground (typescriptlang.org/play).`,

  type: `Fill in the answers object:
  firstSignature   write the first line of first: takes list (an array of T), returns T, generic in T
  boxOfString      write the type of a Box that holds a string
  resultNumbers    what type does first([1, 2, 3]) return?
  resultWords      what type does first(["a", "b"]) return?
  promiseOfNumber  write the type of a promise that will hold a number
  ruleWord         the word used to put a rule on T, in <T ... { length: number }>`,

  break: `Try it for real, for free, in typescriptlang.org/play:
  Paste the first function above and then write  const x = first([1, 2, 3]);  Hover over x and read its type.
Break it on purpose: change the call to first(["a", "b"]) and hover again. The same function, a different type back. That is the magic of generics: one function, many types, no lying.`,

  say: `In one sentence: what is a generic, and what does the letter T stand for?`,

  starterCode: `// Strike 16: generics. Write each type as text.

const answers = {
  firstSignature: "",
  boxOfString: "",
  resultNumbers: "",
  resultWords: "",
  promiseOfNumber: "",
  ruleWord: "",
};
`,

  tests: `function squash(text) {
  return String(text).split(" ").join("").split("\\n").join("");
}
function need(what, actual, accepted) {
  const got = squash(actual);
  if (!accepted.map(squash).includes(got)) {
    throw new Error(what + ' (you wrote: "' + String(actual).trim() + '")');
  }
}

test("firstSignature", () => {
  need("first takes list (an array of T) and returns T, generic in T", answers.firstSignature, [
    "function first<T>(list: T[]): T",
    "function first<T>(list: Array<T>): T",
    "function first<T>(list: T[]): T {",
    "function first<T>(list: Array<T>): T {",
  ]);
});
test("boxOfString", () => {
  need("A Box that holds a string", answers.boxOfString, ["Box<string>"]);
});
test("resultNumbers", () => {
  need("What does first([1, 2, 3]) return?", answers.resultNumbers, ["number"]);
});
test("resultWords", () => {
  need('What does first(["a", "b"]) return?', answers.resultWords, ["string"]);
});
test("promiseOfNumber", () => {
  need("A promise that will hold a number", answers.promiseOfNumber, ["Promise<number>"]);
});
test("ruleWord", () => {
  need("The word that puts a rule on T", answers.ruleWord, ["extends"]);
});
`,

  hints: [
    "Put <T> right after the function name, then use T where the real type would go. An array of T can be written T[] (or Array<T>).",
    "A generic type puts the real type inside angle brackets after its name: Box<string>, Promise<number>.",
    "The rule word for a generic is the same word you use for classes that inherit: extends.",
  ],

  solution: `=== CODE ===
const answers = {
  firstSignature: "function first<T>(list: T[]): T",
  boxOfString: "Box<string>",
  resultNumbers: "number",
  resultWords: "string",
  promiseOfNumber: "Promise<number>",
  ruleWord: "extends",
};
=== LINE BY LINE ===
function first<T>(list: T[]): T: <T> declares the placeholder. list: T[] says the input is an array of whatever T is. : T says the answer has the SAME type as the items. The link between the two Ts is the whole point.
Box<string>: you fill the placeholder in with a real type, in angle brackets.
first([1, 2, 3]) gives a number, and first(["a", "b"]) gives a string. TypeScript works T out from what you pass in.
Promise<number> is a promise that will eventually hold a number.
extends puts a limit on T. <T extends { length: number }> allows strings and arrays but rejects plain numbers, which have no length.`,
};
