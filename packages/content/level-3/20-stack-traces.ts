import type { Lesson } from "../types";

// NOTE for editing this file: the code below contains regular expressions with backslashes,
// so the fields that hold code use String.raw. That keeps every backslash exactly as typed.
export const lesson: Lesson = {
  id: "l3-s20",
  level: 3,
  order: 20,
  title: "Debugging: stack traces",

  look: String.raw`When your program crashes, JavaScript prints a STACK TRACE. It looks scary, but it is really a map that says exactly where things went wrong and how the program got there.

  TypeError: user is undefined
      at validate (app.js:10:9)
      at saveUser (app.js:20:5)
      at handleClick (app.js:35:3)

How to read it:
  Line 1 is WHAT went wrong: the kind of error (TypeError) and a message.
  Each "at" line is a function that was running, with the file, line and column: app.js:10:9 means file app.js, line 10, column 9.
  The FIRST "at" line is where the error happened. The lines below it are who called that function, going backwards, like footprints: validate was called by saveUser, which was called by handleClick, which was the button click.

How to use it:
  1. Read line 1, the message.
  2. Go to the first "at" line and open that file and line.
  3. Look at the lines below to see how you got there.
Most bugs are found within a minute of reading the trace properly.

You will write a tiny stack trace reader. It is real code, so the tests run it here in the page.`,

  type: String.raw`Finish three functions. Each gets the text of a stack trace (a string, with one line per row):
1. errorInfo(stack) returns { type, message } from the FIRST line. For "TypeError: user is undefined" it returns { type: "TypeError", message: "user is undefined" }.
2. functionNames(stack) returns the names of the functions from the "at" lines, from the top (where it broke) to the bottom. For a line like "at validate (app.js:10:9)" the name is "validate". A line with no name and no brackets, like "at app.js:50:7", counts as "<anonymous>".
3. whereItBroke(stack) returns the place of the FIRST "at" line as text, like "validate at app.js:10:9". For an anonymous first line it is "<anonymous> at app.js:50:7".`,

  break: String.raw`Make a real one: open DevTools (F12), go to the Console, and type  null.name  and press Enter.
Read the error you get: it has a kind, a message, and "at" lines. Now try  undefinedFunction()  for a different error. Notice how the message tells you what you did wrong in plain words.
Break it on purpose: in your functionNames, forget to skip the first line of the stack. The first line is the message, not a function, so your list gets one extra wrong item. Only lines that start with "at" are function lines.`,

  say: String.raw`In one sentence: how do you read a stack trace, and which line do you look at first?`,

  starterCode: String.raw`// Strike 20: stack traces. Plain text in, useful answers out.

function errorInfo(stack) {
  // { type: "TypeError", message: "user is undefined" }
}

function functionNames(stack) {
  // ["validate", "saveUser", ...] from the "at" lines
}

function whereItBroke(stack) {
  // "validate at app.js:10:9"
}
`,

  tests: String.raw`const sample = [
  "TypeError: user is undefined",
  "    at validate (app.js:10:9)",
  "    at saveUser (app.js:20:5)",
  "    at Object.handleClick (app.js:35:3)",
].join("\n");

const anonymous = [
  "Error: boom",
  "    at app.js:50:7",
  "    at run (main.js:2:1)",
].join("\n");

test("errorInfo reads the type and the message", () => {
  expect(errorInfo(sample)).toEqual({ type: "TypeError", message: "user is undefined" });
  expect(errorInfo("RangeError: too big")).toEqual({ type: "RangeError", message: "too big" });
});

test("functionNames lists the functions from the top", () => {
  expect(functionNames(sample)).toEqual(["validate", "saveUser", "Object.handleClick"]);
});

test("functionNames uses <anonymous> for lines with no name", () => {
  expect(functionNames(anonymous)).toEqual(["<anonymous>", "run"]);
});

test("whereItBroke gives the first function and its place", () => {
  expect(whereItBroke(sample)).toBe("validate at app.js:10:9");
});

test("whereItBroke works when the first line has no name", () => {
  expect(whereItBroke(anonymous)).toBe("<anonymous> at app.js:50:7");
});
`,

  hints: [
    'Split the stack into lines with stack.split("\\n"). Line 0 is the message. The "at" lines are the ones whose trimmed text starts with "at ".',
    'errorInfo: take the first line and cut it at the first ": " (colon and space). What is before it is the type, what is after it is the message. indexOf and slice are good for this.',
    'For an "at" line, remove the "at " start. If it ends with a closing bracket, the name is before " (" and the place is inside the brackets. If there is no bracket, the whole rest is the place and the name is "<anonymous>". Write one small helper that returns both, and use it twice.',
  ],

  solution: String.raw`=== CODE ===
function errorInfo(stack) {
  const firstLine = stack.split("\n")[0];
  const cut = firstLine.indexOf(": ");
  return {
    type: firstLine.slice(0, cut),
    message: firstLine.slice(cut + 2),
  };
}

function readAtLines(stack) {
  const frames = [];
  for (const line of stack.split("\n")) {
    const text = line.trim();
    if (!text.startsWith("at ")) {
      continue;
    }
    const rest = text.slice(3);
    const open = rest.indexOf(" (");
    if (rest.endsWith(")") && open !== -1) {
      frames.push({ name: rest.slice(0, open), place: rest.slice(open + 2, -1) });
    } else {
      frames.push({ name: "<anonymous>", place: rest });
    }
  }
  return frames;
}

function functionNames(stack) {
  return readAtLines(stack).map((frame) => frame.name);
}

function whereItBroke(stack) {
  const first = readAtLines(stack)[0];
  return first.name + " at " + first.place;
}
=== LINE BY LINE ===
errorInfo: the first line looks like "Type: message". indexOf(": ") finds where the colon and space are. slice cuts the text before it (the type) and after it (the message, skipping the 2 characters of ": ").
readAtLines is a small helper both other functions share. It loops over the lines, ignores any that do not start with "at " (like the message line), and drops the "at " part.
If the rest looks like "name (place)", we cut the name off before " (" and take the place from inside the brackets. If there are no brackets, the whole thing is the place and the function has no name.
functionNames just picks out the names. whereItBroke takes the FIRST frame, because the first "at" line is where the error happened.
One helper used twice is a good habit: no repeated code, and one place to fix if the format changes.`,
};
