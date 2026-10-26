import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s03",
  level: 0,
  track: "professional",
  order: 3,
  title: "Reading unfamiliar code",

  look: `You will spend far more time READING code than writing it from scratch. A few real habits make an unfamiliar codebase tractable instead of overwhelming:

Start from an ENTRY POINT, not a random file. A route handler, a button's onClick, a test file — something with a clear "this is what triggers this" story, then follow it outward only as far as you need.

Do not try to understand EVERYTHING before touching anything. Understand enough to make your one change safely, and let the rest stay a mystery until you actually need it.

Real proof this works: open apps/api/src/middleware/validate.ts right now, in this very project. You do not need to understand the whole API to read that ONE file: what it takes in, what it checks, what it does on success versus failure. That is the whole skill.`,

  type: `Fill in the answers object:
  whereToStart    pick a, b or c: where should you start reading an unfamiliar codebase?
  howMuchToRead   pick a, b or c: how much of a codebase should you understand before making one small change?
  realFileProof   write one word, no slashes: the exact filename (with extension) this strike pointed you at, inside apps/api/src/middleware/`,

  break: `Try it for real, for free: open apps/api/src/middleware/errorHandler.ts (right next to validate.ts) and read it cold, using the same method: what triggers it, what it does, nothing more for now.`,

  say: `In one sentence: why is trying to understand an entire unfamiliar codebase before touching anything usually the wrong approach?`,

  starterCode: `// Strike 3: reading unfamiliar code.

// whereToStart: where should you start reading an unfamiliar codebase?
//   a) the file with the most lines, since it is probably the most important
//   b) a clear entry point (a route, a button handler, a test), then follow it outward
//   c) alphabetically, one file at a time

// howMuchToRead: how much should you understand before making one small change?
//   a) the entire codebase, completely, first
//   b) enough to make that one change safely; the rest can stay a mystery for now
//   c) nothing at all; just try things and see what breaks

const answers = {
  whereToStart: "",
  howMuchToRead: "",
  realFileProof: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("whereToStart", () => {
  if (said(answers.whereToStart) !== "b") {
    throw new Error("Where should you start reading an unfamiliar codebase? (a, b or c)");
  }
});

test("howMuchToRead", () => {
  if (said(answers.howMuchToRead) !== "b") {
    throw new Error("How much should you understand before making one small change? (a, b or c)");
  }
});

test("realFileProof", () => {
  if (said(answers.realFileProof) !== "validate.ts") {
    throw new Error('Write the exact filename, with extension: the file this strike pointed you at in apps/api/src/middleware/. Answer: validate.ts');
  }
});
`,

  hints: [
    "whereToStart: something with a clear 'this is what triggers this' story is much easier to follow than a random file.",
    "howMuchToRead: trying to understand everything first usually means never actually starting.",
    'realFileProof: write it exactly as it appears in apps/api/src/middleware/: validate.ts',
  ],

  solution: `=== CODE ===
const answers = {
  whereToStart: "b",
  howMuchToRead: "b",
  realFileProof: "validate.ts",
};
=== LINE BY LINE ===
whereToStart is b: an entry point gives you a real, concrete story to follow ("this route calls this, which calls this"), instead of trying to build a mental model of the whole system from nothing.
howMuchToRead is b: understanding EVERYTHING first is usually impossible and always slow. Understanding enough for the one change in front of you is almost always the faster, safer path — you can always come back for more later.
realFileProof is "validate.ts": real, tiny, self-contained proof that reading ONE well-scoped file, cold, is a genuinely learnable skill, not something that requires knowing the whole app first.`,
};
