import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s18",
  level: 5,
  order: 18,
  title: "Security: OWASP Top 10",
  runner: "worker",

  look: `The OWASP Top 10 is a well-known, regularly updated list of the most common, most dangerous web security mistakes. It is not a single technique, so this strike is guided-local: an overview, then a few of its categories checked closely. You already met several of these by name, earlier in this level and the last one:

  Broken Access Control       missing or wrong permission checks (your RBAC strike)
  Injection                   untrusted input changing the MEANING of a command (next strike)
  Cryptographic Failures      weak or missing hashing/encryption (your password-hashing strike)
  Security Misconfiguration   defaults left on that should have been turned off
  Identification & Auth Failures   weak login/session handling

The value of a list like this is not memorizing all 10 by name: it is recognizing that most real security bugs are the SAME handful of mistakes, repeated across countless different apps, which is exactly why a top-10 list is worth having at all.`,

  type: `Fill in the answers object:
  brokenAccessControl   pick a, b or c: which strike you have already built is an example of preventing Broken Access Control?
  cryptographicFailures pick a, b or c: which strike you have already built is an example of avoiding a Cryptographic Failure?
  listValue             pick a, b or c: what is the real value of a "top 10" list like this?`,

  break: `Try it for real, for free: search "OWASP Top 10" and skim the current official list. Notice how many of the ten you can already explain in your own words, using strikes you have already done in this level.`,

  say: `In one sentence: why is a short, repeated list of common mistakes more useful to a working developer than an exhaustive list of every possible attack?`,

  starterCode: `// Strike 18: OWASP Top 10.

// brokenAccessControl: which strike is an example of preventing Broken Access Control?
//   a) password hashing
//   b) RBAC (requireRole), refusing a request whose role does not match
//   c) CORS

// cryptographicFailures: which strike is an example of avoiding a Cryptographic Failure?
//   a) hashing passwords with a random salt, instead of storing them as plain text
//   b) pagination
//   c) request validation

// listValue: what is the real value of a "top 10" list like this?
//   a) memorizing all ten exact names, in order
//   b) recognizing that most real bugs are the SAME handful of well-known mistakes, repeated across different apps
//   c) it guarantees your app has no other security problems

const answers = {
  brokenAccessControl: "",
  cryptographicFailures: "",
  listValue: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("brokenAccessControl", () => {
  if (said(answers.brokenAccessControl) !== "b") {
    throw new Error("Which strike is an example of preventing Broken Access Control? (a, b or c)");
  }
});

test("cryptographicFailures", () => {
  if (said(answers.cryptographicFailures) !== "a") {
    throw new Error("Which strike is an example of avoiding a Cryptographic Failure? (a, b or c)");
  }
});

test("listValue", () => {
  if (said(answers.listValue) !== "b") {
    throw new Error('What is the real value of a "top 10" list like this? (a, b or c; see the starter file for the options)');
  }
});
`,

  hints: [
    "brokenAccessControl: think about which strike checks WHO is allowed to do something, and refuses everyone else.",
    "cryptographicFailures: think about which strike protects a SECRET VALUE by never storing it in a reversible form.",
    'listValue: the value is (b): most real bugs are the SAME handful of well-known mistakes, repeated, which is exactly why recognizing the pattern matters more than memorizing all ten names.',
  ],

  solution: `=== CODE ===
const answers = {
  brokenAccessControl: "b",
  cryptographicFailures: "a",
  listValue: "b",
};
=== LINE BY LINE ===
brokenAccessControl is b: requireRole checks WHO is asking and refuses anyone whose role does not match, which is exactly what "access control" means — and getting it wrong (or forgetting it) is the single most common category on the real list.
cryptographicFailures is a: storing a password hash with a random salt, instead of the plain password (or a weak, fast hash), is a direct, concrete fix for this category.
listValue is b: a top-10 list is useful specifically because the same well-known mistakes keep reappearing across different apps. Recognizing the SHAPE of a mistake ("this is basically Broken Access Control again") matters far more day-to-day than reciting all ten names from memory.`,
};
