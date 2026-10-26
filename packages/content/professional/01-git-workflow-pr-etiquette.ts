import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s01",
  level: 0,
  track: "professional",
  order: 1,
  title: "Git workflow and PR etiquette",

  look: `You already know the git MECHANICS (Level 3: branches, pull requests, rebase, conflicts). This strike is about the HABITS around them, the ones that make a team actually want to review your work.

A good PR is SMALL and FOCUSED: one logical change, easy to hold in your head, easy to review carefully. A 2,000-line PR mixing a bug fix, a refactor and a new feature basically guarantees a rushed, shallow review.

A good PR description says WHY, not just what the diff already shows: "Fixes a race condition where two requests could both pass the balance check before either deducted it" tells a reviewer far more than "fix bug".

Once a PR is open for review, never force-push over commits a reviewer has already looked at, without saying so. A force-push silently invalidates their read of the diff; they cannot tell what changed since their last look.`,

  type: `Fill in the answers object:
  prSize          pick a, b or c: what makes a PR easier to review carefully?
  prDescription   pick a, b or c: what should a good PR description explain?
  afterReview     pick a, b or c: what should you do before force-pushing over commits a reviewer already looked at?`,

  break: `Try it for real, for free: open any real open-source project's pull requests on GitHub and skim ten of them. Notice which ones got fast, thorough reviews, and guess why — size and a clear description are usually a big part of the answer.`,

  say: `In one sentence: why does a small, focused PR get a better review than a large one covering several unrelated changes?`,

  starterCode: `// Strike 1: Git workflow and PR etiquette.

// prSize: what makes a PR easier to review carefully?
//   a) as many changes as possible in one PR, to save round trips
//   b) small and focused: one logical change
//   c) no description at all, let the diff speak for itself

// prDescription: what should a good PR description explain?
//   a) WHY the change was made, not just what the diff already shows
//   b) the author's full git history
//   c) nothing; the code should be self-explanatory

const answers = {
  prSize: "",
  prDescription: "",
  afterReview: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("prSize", () => {
  if (said(answers.prSize) !== "b") {
    throw new Error("What makes a PR easier to review carefully? (a, b or c)");
  }
});

test("prDescription", () => {
  if (said(answers.prDescription) !== "a") {
    throw new Error("What should a good PR description explain? (a, b or c)");
  }
});

test("afterReview", () => {
  if (said(answers.afterReview) !== "say so") {
    throw new Error('Write the phrase: "say so" — tell your reviewer before force-pushing over commits they already looked at.');
  }
});
`,

  hints: [
    "prSize: think about how much a reviewer can actually hold in their head carefully, at once.",
    "prDescription: the diff already shows WHAT changed; a description earns its place by adding something the diff cannot say on its own.",
    'afterReview: write the exact phrase: "say so"',
  ],

  solution: `=== CODE ===
const answers = {
  prSize: "b",
  prDescription: "a",
  afterReview: "say so",
};
=== LINE BY LINE ===
prSize is b: a small, single-purpose PR is something a reviewer can actually hold in their head, all at once, and review carefully rather than skim.
prDescription is a: the diff already shows WHAT changed, line by line. A description earns its place by explaining WHY, the part no diff can show on its own.
afterReview: "say so" — a silent force-push after review has started makes a reviewer's earlier read of the diff invisible to them. A quick heads-up ("rebased to fix the merge conflict, no logic changes") keeps their trust and their time well spent.`,
};
