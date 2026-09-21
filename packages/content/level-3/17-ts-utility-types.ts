import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s17",
  level: 3,
  order: 17,
  title: "TypeScript: utility types",

  look: `TypeScript comes with ready-made tools that build NEW types out of old ones, like cookie cutters that reshape a cookie you already have. They are called utility types.

Start with a type for a user:

  interface User {
    id: number;
    name: string;
    email: string;
  }

The most useful tools:

  Partial<User>              every field becomes OPTIONAL. Great for "update" forms: send only what changed.
  Required<User>             every field becomes required (the opposite).
  Readonly<User>             every field becomes read-only: no changing it later.
  Pick<User, "name" | "email">   keep ONLY the listed fields.
  Omit<User, "id">           keep everything EXCEPT the listed fields.
  Record<string, number>     an object where every key is a string and every value is a number (a dictionary).
  ReturnType<typeof makeUser>    "whatever type the function makeUser returns".

Why bother? You describe a shape ONCE, and derive the others. If User gets a new field, every derived type updates automatically.

This is a GUIDED-LOCAL strike: try them in the TypeScript Playground (typescriptlang.org/play).`,

  type: `Using the User type above, fill in the answers object with the TYPE for each job:
  allOptional     a User where every field is optional
  onlyNameEmail   only the name and email fields of User
  withoutId       everything in User except id
  allReadonly     a User that cannot be changed
  scoreBoard      an object with string keys and number values
  makeUserResult  the type that function makeUser returns (use ReturnType)`,

  break: `Try it for real, in typescriptlang.org/play:
  Paste the User interface, then write:   const patch: Partial<User> = { name: "Sam" };
It works, because every field is optional now. Now write   const full: User = { name: "Sam" };  and read the red error: the other fields are missing.
Break it on purpose: try  const locked: Readonly<User> = { id: 1, name: "A", email: "a@b.c" };  then  locked.name = "B";  and read the error.`,

  say: `In one sentence: what is a utility type, and give one example of when you would use Partial or Omit.`,

  starterCode: `// Strike 17: utility types. Write each type as text.

// interface User { id: number; name: string; email: string }

const answers = {
  allOptional: "",
  onlyNameEmail: "",
  withoutId: "",
  allReadonly: "",
  scoreBoard: "",
  makeUserResult: "",
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

test("allOptional", () => {
  need("A User where every field is optional", answers.allOptional, ["Partial<User>"]);
});
test("onlyNameEmail", () => {
  need("Only the name and email fields of User", answers.onlyNameEmail, [
    'Pick<User, "name" | "email">',
    "Pick<User, 'name' | 'email'>",
    'Pick<User, "email" | "name">',
    "Pick<User, 'email' | 'name'>",
  ]);
});
test("withoutId", () => {
  need("Everything in User except id", answers.withoutId, ['Omit<User, "id">', "Omit<User, 'id'>"]);
});
test("allReadonly", () => {
  need("A User that cannot be changed", answers.allReadonly, ["Readonly<User>"]);
});
test("scoreBoard", () => {
  need("An object with string keys and number values", answers.scoreBoard, ["Record<string, number>"]);
});
test("makeUserResult", () => {
  need("The type that makeUser returns", answers.makeUserResult, ["ReturnType<typeof makeUser>"]);
});
`,

  hints: [
    "Utility types wrap a type in angle brackets: Name<Something>. Partial, Readonly and Required take just the type. Pick, Omit and Record take two things, separated by a comma.",
    'Pick and Omit name the fields as text in quotes. To name two fields, join them with the pipe sign: "name" | "email".',
    "Record<Keys, Values>: keys are strings and values are numbers. ReturnType<typeof someFunction> uses the word typeof before the function's name.",
  ],

  solution: `=== CODE ===
const answers = {
  allOptional: "Partial<User>",
  onlyNameEmail: 'Pick<User, "name" | "email">',
  withoutId: 'Omit<User, "id">',
  allReadonly: "Readonly<User>",
  scoreBoard: "Record<string, number>",
  makeUserResult: "ReturnType<typeof makeUser>",
};
=== LINE BY LINE ===
Partial<User>: think "partially filled in". Every field gets a question mark, so { name: "Sam" } alone is fine.
Pick<User, "name" | "email">: like picking chocolates from a box, you keep only the ones you name. The pipe joins the names into a union.
Omit<User, "id">: the opposite of pick. Handy for a "create user" form, where the server invents the id.
Readonly<User>: the compiler stops you assigning to any field afterwards.
Record<string, number>: a dictionary where every key is a string and every value a number, like a score board.
ReturnType<typeof makeUser>: typeof turns the function into its type, and ReturnType pulls out what it gives back. If you change the function, this type follows.`,
};
