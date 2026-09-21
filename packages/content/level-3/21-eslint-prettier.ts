import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s21",
  level: 3,
  order: 21,
  title: "ESLint and Prettier",

  look: `Two helpers keep your code tidy, and they do DIFFERENT jobs:

  ESLint is a proofreader for MISTAKES.
    It spots things that are probably bugs: a variable you made but never used, a comparison with == instead of ===, code that can never run.

  Prettier is a stylist for LOOKS.
    It rewrites spacing, quotes, line length and commas so all code looks the same, no matter who typed it. It never argues about taste: it just decides.

Why use them? Nobody wastes review time on "add a space here" or "use double quotes". The tools do that. Humans talk about ideas.

The commands:

  npx eslint .                 check every file for mistakes
  npx eslint . --fix           fix the mistakes that are safe to fix automatically
  npx prettier --check .       say which files are not formatted (changes nothing)
  npx prettier --write .       rewrite the files with the correct formatting

In THIS project they are already wired up as shortcuts:  npm run lint  and  npm run format.

Many editors can run Prettier every time you save a file, so formatting becomes automatic. (Your Hexhammer project already has that in .vscode/settings.json!)

This is a GUIDED-LOCAL strike: run both tools in your Hexhammer project.`,

  type: `Fill in the answers object:
  checkForMistakes   the command that checks all files for mistakes (use npx and eslint)
  autoFixMistakes    the same command, but fixing the safe ones automatically
  checkFormatting    the command that only CHECKS formatting, changes nothing
  rewriteFormatting  the command that rewrites files with the right formatting
  catchesUnused      which tool complains about an unused variable? eslint or prettier
  fixesQuotes        which tool changes single quotes to double quotes? eslint or prettier`,

  break: `Try it for real, in your Hexhammer folder:
  1. Run  npm run lint  (it should say all is well).
  2. Make a scratch file called scratch.js in the project folder containing:   var unused = 1;   and a second line   if (1 == 1) { }
  3. Run  npx eslint scratch.js  and read what it complains about.
  4. Now add some ugly spacing:   const   x    =   'hi'   and run  npx prettier --write scratch.js  and see it fix the look.
Break it on purpose: notice that Prettier did NOT fix the "unused" mistake. Prettier only changes looks. ESLint finds mistakes. Delete scratch.js when you are done.`,

  say: `In one sentence: what is the difference between ESLint and Prettier?`,

  starterCode: `// Strike 21: ESLint and Prettier.

const answers = {
  checkForMistakes: "",
  autoFixMistakes: "",
  checkFormatting: "",
  rewriteFormatting: "",
  catchesUnused: "",
  fixesQuotes: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().split(" ").filter(Boolean).join(" ");
}
function need(what, actual, accepted) {
  if (!accepted.includes(said(actual))) {
    throw new Error(what + ' (you wrote: "' + said(actual) + '")');
  }
}

test("checkForMistakes", () => {
  need("Check all files for mistakes", answers.checkForMistakes, ["npx eslint .", "npx eslint"]);
});
test("autoFixMistakes", () => {
  need("Check and fix the safe mistakes automatically", answers.autoFixMistakes, [
    "npx eslint . --fix",
    "npx eslint --fix .",
    "npx eslint --fix",
  ]);
});
test("checkFormatting", () => {
  need("Only CHECK the formatting, change nothing", answers.checkFormatting, ["npx prettier --check ."]);
});
test("rewriteFormatting", () => {
  need("Rewrite the files with the right formatting", answers.rewriteFormatting, ["npx prettier --write ."]);
});
test("catchesUnused", () => {
  need("Which tool complains about an unused variable?", answers.catchesUnused, ["eslint", "ESLint"]);
});
test("fixesQuotes", () => {
  need("Which tool changes single quotes to double quotes?", answers.fixesQuotes, ["prettier", "Prettier"]);
});
`,

  hints: [
    'npx runs a tool from your project without installing it globally. The tool names are eslint and prettier, and the dot at the end means "the whole folder".',
    "ESLint has a flag --fix for automatic repairs. Prettier has two flags: --check to look, --write to change files.",
    "Mistakes are ESLint's job. Looks (quotes, spacing) are Prettier's job.",
  ],

  solution: `=== CODE ===
const answers = {
  checkForMistakes: "npx eslint .",
  autoFixMistakes: "npx eslint . --fix",
  checkFormatting: "npx prettier --check .",
  rewriteFormatting: "npx prettier --write .",
  catchesUnused: "eslint",
  fixesQuotes: "prettier",
};
=== LINE BY LINE ===
npx eslint . reads every file in the folder (the dot) and reports likely mistakes. Adding --fix lets it repair the ones that have one obvious safe fix.
npx prettier --check . is a dry run: it lists files that are not formatted and changes nothing. Handy in automatic checks before merging. --write actually rewrites the files.
An unused variable is a possible mistake, so ESLint reports it. Quotes are just style, so Prettier fixes them. That is the whole split: ESLint = mistakes, Prettier = looks.`,
};
