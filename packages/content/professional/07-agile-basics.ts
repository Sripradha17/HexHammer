import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s07",
  level: 0,
  track: "professional",
  order: 7,
  title: "Agile basics",

  look: `Agile teams work in short, repeated cycles instead of one long plan-everything-upfront project. A few terms you will hear constantly:

  BACKLOG      the full list of work not yet started, roughly ordered by priority
  SPRINT       a short, fixed time box (often 1-2 weeks) where the team commits to a slice of the backlog
  STANDUP      a short daily check-in: what I did, what I am doing next, anything blocking me
  STORY POINTS a rough, relative size estimate (not hours) — "this is about as big as that other thing we did"
  RETRO        a short meeting AFTER a sprint: what went well, what did not, what to change next time

The real point of all of it is the same: work in small enough cycles that you can course-correct FREQUENTLY, instead of discovering a big plan was wrong only at the very end.`,

  type: `Fill in the answers object:
  sprintIs        pick a, b or c: what is a sprint?
  standupPurpose  pick a, b or c: what is a daily standup actually for?
  retroWhen       write one word: does a retro happen BEFORE or AFTER a sprint?`,

  break: `Try it for real, for free: if this project (Hexhammer) ran retros, what would go in "what went well" and "what would we change next time", based on your OWN experience working through it so far? Write a real one-line answer to each.`,

  say: `In one sentence: why does working in short cycles (sprints) let a team course-correct faster than one long plan-everything-upfront project?`,

  starterCode: `// Strike 7: Agile basics.

// sprintIs: what is a sprint?
//   a) a code review meeting
//   b) a short, fixed time box where the team commits to a slice of the backlog
//   c) the final release of a project

// standupPurpose: what is a daily standup actually for?
//   a) a detailed status report for management
//   b) a short check-in: what I did, what's next, anything blocking me
//   c) planning the next sprint in full detail

const answers = {
  sprintIs: "",
  standupPurpose: "",
  retroWhen: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("sprintIs", () => {
  if (said(answers.sprintIs) !== "b") {
    throw new Error("What is a sprint? (a, b or c)");
  }
});

test("standupPurpose", () => {
  if (said(answers.standupPurpose) !== "b") {
    throw new Error("What is a daily standup actually for? (a, b or c)");
  }
});

test("retroWhen", () => {
  if (said(answers.retroWhen) !== "after") {
    throw new Error('Write one word: before or after. Does a retro happen before or after a sprint?');
  }
});
`,

  hints: [
    "sprintIs: think about the word 'time box' — a fixed, short period, not an open-ended one.",
    "standupPurpose: it is meant to be SHORT, a quick sync, not a detailed report.",
    'retroWhen: write the single word: after — you reflect on a sprint once it has actually happened.',
  ],

  solution: `=== CODE ===
const answers = {
  sprintIs: "b",
  standupPurpose: "b",
  retroWhen: "after",
};
=== LINE BY LINE ===
sprintIs is b: a fixed, short time box the team commits to, which is exactly what keeps the cycle SHORT enough to course-correct often, instead of only finding out a plan was wrong months later.
standupPurpose is b: a standup is deliberately short — a sync, not a status report. Its whole value is surfacing blockers FAST, while they are still cheap to fix.
retroWhen is "after": a retro looks back at a sprint that already happened, specifically so the team can change something concrete for the NEXT one, based on real, recent experience rather than guesswork.`,
};
