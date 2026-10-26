import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s02",
  level: 0,
  track: "professional",
  order: 2,
  title: "Giving and receiving code review",

  look: `Giving review: comment on the CODE, never the person. "This function does X" not "you did X wrong". Ask a genuine question when you are not sure of the author's reasoning ("what happens if this array is empty?") instead of commanding a fix outright — often the answer reveals something you missed, and even when it does not, a question invites a conversation instead of shutting one down.

Receiving review: a comment is about making the CODE better, not a verdict on you. If a comment is unclear, ask for clarification instead of guessing what they meant. It is genuinely fine to push back on a suggestion, as long as you explain your reasoning — a good reviewer wants to be convinced, not just obeyed.

  "This is wrong."                         a verdict, no path forward
  "What happens here if the list is empty?"  a real question, invites a real answer
  "Consider handling the empty-list case explicitly, since callers might reasonably pass one."  specific, actionable, respectful`,

  type: `Fill in the answers object:
  betterComment    pick a, b or c: which of the three example comments above is the most useful REVIEW comment?
  unclearComment   pick a, b or c: a reviewer leaves a comment you do not understand. What should you do?
  pushingBack      pick a, b or c: is it ever appropriate to disagree with a review comment?`,

  break: `Try it for real, for free: find a real code review comment you have received or given (on any project) and rewrite it in the other two styles from Look — a bare verdict, and a genuine question. Notice how differently each one would land.`,

  say: `In one sentence: why does asking a question often work better as a review comment than stating a command?`,

  starterCode: `// Strike 2: giving and receiving code review.

// betterComment: which of these is the most useful REVIEW comment?
//   a) "This is wrong."
//   b) "What happens here if the list is empty?"
//   c) "Consider handling the empty-list case explicitly, since callers might reasonably pass one."

// unclearComment: a reviewer leaves a comment you do not understand. What should you do?
//   a) guess what they meant and just change something
//   b) ask them to clarify
//   c) ignore it and hope they do not notice

const answers = {
  betterComment: "",
  unclearComment: "",
  pushingBack: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("betterComment", () => {
  if (said(answers.betterComment) !== "c") {
    throw new Error("Which of these is the most useful REVIEW comment? (a, b or c)");
  }
});

test("unclearComment", () => {
  if (said(answers.unclearComment) !== "b") {
    throw new Error("A reviewer leaves a comment you do not understand. What should you do? (a, b or c)");
  }
});

test("pushingBack", () => {
  if (said(answers.pushingBack) !== "yes") {
    throw new Error('Write one word: yes or no. Is it ever appropriate to disagree with a review comment, if you explain your reasoning?');
  }
});
`,

  hints: [
    "betterComment: the best one is specific AND actionable AND explains why, all three at once.",
    "unclearComment: guessing wastes both your time and theirs if you guess wrong; ask.",
    'pushingBack: write the single word: yes — as long as you explain your reasoning, disagreement is a normal, healthy part of review.',
  ],

  solution: `=== CODE ===
const answers = {
  betterComment: "c",
  unclearComment: "b",
  pushingBack: "yes",
};
=== LINE BY LINE ===
betterComment is c: "This is wrong" gives no path forward. A question is better, but a specific, actionable, respectful suggestion that also explains WHY is the most useful of the three: the author knows exactly what to consider and why it matters.
unclearComment is b: guessing wastes time on both sides if you guess wrong, and can even introduce a NEW bug while trying to satisfy an unclear comment. A quick clarifying question is faster and safer.
pushingBack is "yes": review is a conversation, not a one-way verdict. A good reviewer wants to be convinced by real reasoning, not just obeyed — disagreeing WITH reasoning attached is a completely normal, healthy part of the process.`,
};
