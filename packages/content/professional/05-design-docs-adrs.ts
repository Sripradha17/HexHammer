import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s05",
  level: 0,
  track: "professional",
  order: 5,
  title: "Writing design docs and ADRs",

  look: `An ADR (Architecture Decision Record) is a short, permanent record of ONE decision: what was decided, why, and what it costs. Its whole point is answering a question someone will ask six months from now: "why did we do it THIS way?" — without an ADR, that answer often disappears along with whoever remembers it.

A real ADR has three parts:
  CONTEXT        what situation forced a decision? What were the real constraints?
  DECISION       what was actually chosen, stated plainly
  CONSEQUENCES   what does this cost, on purpose? What did it rule out?

A good ADR writes down the CONSEQUENCES honestly, including the downsides — "chose a relational database over a document store; this means schema changes need a migration, which is slower than a document store's flexibility, but we get real transactions and joins" tells a future reader the whole trade, not just the winning side.`,

  type: `Fill in the answers object:
  adrPurpose      pick a, b or c: what is an ADR's real purpose?
  adrShape        pick a, b or c: what three parts does a real ADR have?
  honestCons      write one word: yes or no. Should an ADR's "Consequences" section include the real DOWNSIDES of the choice, not just the benefits?`,

  break: `Try it for real, for free: think of one real technical decision you (or this project) already made — which database, which framework, which pattern — and write a 3-line ADR for it right now: Context, Decision, Consequences.`,

  say: `In one sentence: why is writing down the CONSEQUENCES of a decision, including its real downsides, more useful to a future reader than only writing down what was chosen?`,

  starterCode: `// Strike 5: writing design docs and ADRs.

// adrPurpose: what is an ADR's real purpose?
//   a) to make the team look thorough to outsiders
//   b) to answer "why did we do it this way?" for a future reader, permanently
//   c) to replace code comments entirely

// adrShape: what three parts does a real ADR have?
//   a) Introduction, Body, Conclusion
//   b) Context, Decision, Consequences
//   c) Problem, Solution, Code

const answers = {
  adrPurpose: "",
  adrShape: "",
  honestCons: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("adrPurpose", () => {
  if (said(answers.adrPurpose) !== "b") {
    throw new Error("What is an ADR's real purpose? (a, b or c)");
  }
});

test("adrShape", () => {
  if (said(answers.adrShape) !== "b") {
    throw new Error("What three parts does a real ADR have? (a, b or c)");
  }
});

test("honestCons", () => {
  if (said(answers.honestCons) !== "yes") {
    throw new Error('Write one word: yes or no. Should Consequences include real downsides, not just benefits?');
  }
});
`,

  hints: [
    "adrPurpose: think about who reads an ADR, and when — usually much later, by someone who was not in the room for the original discussion.",
    "adrShape: write the exact three words, in order: Context, Decision, Consequences.",
    'honestCons: write the single word: yes — a one-sided ADR that only lists benefits is not honestly describing a TRADE-off at all.',
  ],

  solution: `=== CODE ===
const answers = {
  adrPurpose: "b",
  adrShape: "b",
  honestCons: "yes",
};
=== LINE BY LINE ===
adrPurpose is b: an ADR exists for the reader who was NOT in the room, months or years later, asking "why is it built this way?" Without one, that answer usually just disappears.
adrShape is b: Context (the real constraints), Decision (what was actually chosen), Consequences (what it costs, on purpose) — all three matter; a decision without its context or its cost is much harder to trust or revisit later.
honestCons is "yes": every real decision is a TRADE, not a pure win. Writing down the real downside is what makes an ADR trustworthy enough to actually rely on later, instead of reading like marketing for a choice that was never really examined.`,
};
