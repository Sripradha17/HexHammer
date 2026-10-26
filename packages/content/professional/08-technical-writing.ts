import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s08",
  level: 0,
  track: "professional",
  order: 8,
  title: "Technical writing",

  look: `Good technical writing puts the CONCLUSION first (BLUF: Bottom Line Up Front), then the supporting detail. A busy reader who only reads the first sentence should still walk away with the important part.

  Weak:    "We looked into the slowdown and there were several factors involved..."
  Better:  "The checkout page was slow because of an N+1 database query. Fixed; page load dropped from 4.2s to 0.9s."

Specific beats vague, every time. "It got a lot faster" tells a reader nothing they can act on or verify. "4.2s to 0.9s" is a claim someone could actually check.`,

  type: `Fill in the answers object:
  blufMeans      pick a, b or c: what does BLUF (Bottom Line Up Front) mean?
  specificOrVague pick a, b or c: which is more useful in technical writing: specific numbers, or vague impressions?
  rewriteVague   write one word: "it got faster" — is this sentence SPECIFIC or VAGUE?`,

  break: `Try it for real, for free: take any vague sentence you have written recently (a commit message, a Slack update, a comment) and rewrite it with a real, specific, checkable number or fact in it instead of a vague impression.`,

  say: `In one sentence: why does a specific, checkable claim ("4.2s to 0.9s") serve a reader better than a vague one ("it got a lot faster")?`,

  starterCode: `// Strike 8: technical writing.

// blufMeans: what does BLUF (Bottom Line Up Front) mean?
//   a) write the conclusion FIRST, then the supporting detail
//   b) write as much detail as possible before the conclusion
//   c) never state a conclusion at all

// specificOrVague: which is more useful in technical writing?
//   a) vague impressions, since they sound more confident
//   b) specific, checkable numbers and facts
//   c) neither matters as long as the writing is long

const answers = {
  blufMeans: "",
  specificOrVague: "",
  rewriteVague: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("blufMeans", () => {
  if (said(answers.blufMeans) !== "a") {
    throw new Error("What does BLUF (Bottom Line Up Front) mean? (a, b or c)");
  }
});

test("specificOrVague", () => {
  if (said(answers.specificOrVague) !== "b") {
    throw new Error("Which is more useful in technical writing? (a, b or c)");
  }
});

test("rewriteVague", () => {
  if (said(answers.rewriteVague) !== "vague") {
    throw new Error('Write one word: specific or vague. Is "it got faster" specific or vague?');
  }
});
`,

  hints: [
    'blufMeans: "front" is the key word — the conclusion goes FIRST, not buried at the end.',
    "specificOrVague: a specific claim is one a reader could actually go verify; a vague one cannot be checked at all.",
    'rewriteVague: write the single word: vague — it names no real number, so nobody could check it.',
  ],

  solution: `=== CODE ===
const answers = {
  blufMeans: "a",
  specificOrVague: "b",
  rewriteVague: "vague",
};
=== LINE BY LINE ===
blufMeans is a: putting the conclusion FIRST respects a busy reader's time: even if they only read one sentence, they walk away with the important part.
specificOrVague is b: a specific, checkable claim ("4.2s to 0.9s") is something a reader could actually go verify. A vague one ("a lot faster") asks them to just trust you, with nothing to check it against.
rewriteVague is "vague": it names no real number and no real baseline, so there is genuinely nothing in it for a reader to verify or act on.`,
};
