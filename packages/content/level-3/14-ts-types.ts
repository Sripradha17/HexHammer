import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s14",
  level: 3,
  order: 14,
  title: "TypeScript: types",

  look: `TypeScript is JavaScript with LABELS on the boxes. A label says what kind of thing a box may hold. If you put the wrong thing in, TypeScript tells you BEFORE you run the code, like a spell-checker for bugs.

  let age: number = 30;             // this box holds numbers only
  let name: string = "Sam";
  let happy: boolean = true;
  let scores: number[] = [1, 2, 3];   // a list of numbers
  let id: string | number;            // a union: a string OR a number

  age = "thirty";                     // ERROR: a string cannot go in a number box

Functions get labels too: what goes in, and what comes out.

  function add(a: number, b: number): number {
    return a + b;
  }

TypeScript is also clever at GUESSING (inference). You do not have to label everything:

  let city = "Paris";      // TypeScript guesses: string
  let items = [1, 2, 3];   // TypeScript guesses: number[]

Your browser cannot run TypeScript directly. It is compiled into plain JavaScript first. Here you practise reading and writing the type labels, and you can check them for free in the TypeScript Playground (typescriptlang.org/play): hover over a variable to see its type.

This is a GUIDED-LOCAL strike.`,

  type: `Fill in the answers object (write each type exactly as TypeScript would show it):
  inferAge       let age = 30;                    what type does TypeScript guess for age?
  inferItems     let items = [1, 2, 3];           what type is items?
  inferFlag      let done = false;                what type is done?
  returnType     function add(a: number, b: number) { return a + b; }   what does add return?
  idType         write the type for a box that can hold a string OR a number
  greetSignature write the function line: greet takes name (a string) and returns a string. Just the first line, like function greet(name: string): string`,

  break: `Try it for real, for free: open typescriptlang.org/play in your browser.
  Type:  let age: number = 30;  then on the next line  age = "thirty";
You will see a red squiggle. Hover over it and read the message. That is TypeScript catching a bug before anything runs.
Break it on purpose: hover over a variable that has no label (let city = "Paris";) and see the type TypeScript guessed.`,

  say: `In one sentence: what does TypeScript add to JavaScript, and when does it tell you about a mistake?`,

  starterCode: `// Strike 14: TypeScript types. Write each type as text.

const answers = {
  inferAge: "",
  inferItems: "",
  inferFlag: "",
  returnType: "",
  idType: "",
  greetSignature: "",
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

test("inferAge", () => {
  need("What type does TypeScript guess for let age = 30?", answers.inferAge, ["number"]);
});
test("inferItems", () => {
  need("What type is let items = [1, 2, 3]?", answers.inferItems, ["number[]", "Array<number>"]);
});
test("inferFlag", () => {
  need("What type is let done = false?", answers.inferFlag, ["boolean"]);
});
test("returnType", () => {
  need("What does add(a: number, b: number) return?", answers.returnType, ["number"]);
});
test("idType", () => {
  need("The type of a box that holds a string OR a number", answers.idType, ["string | number", "number | string"]);
});
test("greetSignature", () => {
  need("greet takes name (string) and returns a string", answers.greetSignature, [
    "function greet(name: string): string",
    "function greet(name: string): string {",
  ]);
});
`,

  hints: [
    "TypeScript names the basic types in lowercase: string, number, boolean. Lists put square brackets after the item type.",
    "A union uses the pipe sign between the choices, like string | number.",
    "A function line goes: function NAME(input: TYPE): RETURNTYPE. The input label goes after a colon inside the brackets, the return label after a colon outside.",
  ],

  solution: `=== CODE ===
const answers = {
  inferAge: "number",
  inferItems: "number[]",
  inferFlag: "boolean",
  returnType: "number",
  idType: "string | number",
  greetSignature: "function greet(name: string): string",
};
=== LINE BY LINE ===
inferAge: 30 is a number, so TypeScript labels the box number for you. That guessing is called inference.
inferItems: a list of numbers is number[] (read it as "number, many").
inferFlag: true and false are booleans.
returnType: adding two numbers always gives a number, so TypeScript works out the return type without you writing it.
idType: the | sign makes a union, meaning "either of these".
greetSignature: name: string labels the input, and the : string after the brackets labels what the function gives back.`,
};
