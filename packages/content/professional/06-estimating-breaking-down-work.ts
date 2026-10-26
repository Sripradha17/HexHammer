import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s06",
  level: 0,
  track: "professional",
  order: 6,
  title: "Estimating and breaking down work",

  look: `A task like "add user profiles" is nearly impossible to estimate honestly, because it is really several DIFFERENT, differently-sized pieces hiding inside one vague sentence. Breaking it down first is what makes estimating possible at all:

  "add user profiles"
    -> add a Profile table + migration                    (small, well-understood)
    -> a GET /profile/:id route                            (small)
    -> a form to edit your own profile                     (medium)
    -> validate and sanitize profile fields                (small)
    -> let OTHER users view a profile (privacy rules!)      (medium-to-large, genuinely uncertain)

Notice the LAST piece is the one that actually carries the real uncertainty (privacy rules can hide a lot of unexpected complexity). A good breakdown makes uncertainty VISIBLE instead of hiding it inside one big, falsely-confident number.`,

  type: `Fill in the answers object:
  whyBreakDown    pick a, b or c: what does breaking a vague task into pieces actually make possible?
  hiddenRisk      pick a, b or c: in the example above, which piece most likely carries the REAL uncertainty?
  bigNumber       write one word: yes or no. Is one big, confident-sounding estimate for a vague, un-broken-down task usually trustworthy?`,

  break: `Try it for real, for free: pick any vague task you can think of ("improve the checkout flow", "make the app faster") and break it into 4-5 concrete pieces, the way the example above does. Notice how much more honestly you can estimate each piece than the vague whole.`,

  say: `In one sentence: why does a big, single, confident-sounding estimate for a vague task usually hide more risk than several honest smaller estimates?`,

  starterCode: `// Strike 6: estimating and breaking down work.

// whyBreakDown: what does breaking a vague task into pieces actually make possible?
//   a) making the total number look bigger to management
//   b) estimating each piece honestly, and seeing WHERE the real uncertainty actually lives
//   c) nothing; a good estimator does not need to break things down

// hiddenRisk: which piece most likely carries the REAL uncertainty, in the example?
//   a) add a Profile table + migration
//   b) validate and sanitize profile fields
//   c) letting other users view a profile (privacy rules)

const answers = {
  whyBreakDown: "",
  hiddenRisk: "",
  bigNumber: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("whyBreakDown", () => {
  if (said(answers.whyBreakDown) !== "b") {
    throw new Error("What does breaking a vague task into pieces actually make possible? (a, b or c)");
  }
});

test("hiddenRisk", () => {
  if (said(answers.hiddenRisk) !== "c") {
    throw new Error("Which piece most likely carries the REAL uncertainty? (a, b or c)");
  }
});

test("bigNumber", () => {
  if (said(answers.bigNumber) !== "no") {
    throw new Error('Write one word: yes or no. Is one big estimate for a vague, un-broken-down task usually trustworthy?');
  }
});
`,

  hints: [
    "whyBreakDown: think about what a single vague number HIDES, that several honest smaller numbers cannot.",
    "hiddenRisk: the well-understood, mechanical pieces (a table, a route) are usually the SAFE ones; the piece with real-world rules attached is where surprises tend to live.",
    'bigNumber: write the single word: no',
  ],

  solution: `=== CODE ===
const answers = {
  whyBreakDown: "b",
  hiddenRisk: "c",
  bigNumber: "no",
};
=== LINE BY LINE ===
whyBreakDown is b: a single vague estimate flattens several very different pieces into one falsely-confident number. Breaking it down lets you estimate the well-understood pieces honestly, and flag the genuinely uncertain ones as genuinely uncertain.
hiddenRisk is c: a table and a migration are mechanical and well-understood. Privacy rules around who can see what are exactly the kind of real-world complexity that tends to hide unexpected scope until you are already in the middle of it.
bigNumber is "no": a single confident number for a task that was never actually broken down usually just means the uncertainty was hidden, not resolved.`,
};
