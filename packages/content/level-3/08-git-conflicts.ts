import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s08",
  level: 3,
  order: 8,
  title: "Git: conflicts",

  look: `A merge conflict happens when two branches changed the SAME line of the SAME file in different ways. Git does not know which one is right, so it asks YOU. It is not an error and it is not scary: it is Git being polite.

Git marks the file with three special lines:

  <<<<<<< HEAD
  <h1>Welcome to my site</h1>
  =======
  <h1>Hello, friends!</h1>
  >>>>>>> feature/greeting

  <<<<<<<   start of MY version (the branch I am on)
  =======   the dividing line
  >>>>>>>   end of THEIR version (the branch I am merging in)

How to fix it, step by step:
  1. Open the file and read both versions.
  2. Decide: keep mine, keep theirs, or mix them.
  3. Delete all three marker lines, leaving only the code you want.
  4. git add index.html          tell Git "this file is fixed"
  5. git commit                  (or git merge --continue) to finish

Changed your mind? git merge --abort puts everything back.

This is a GUIDED-LOCAL strike: you make a conflict on purpose in a scratch folder.`,

  type: `Fill in the answers object:
  startMarker     the line that starts my version (seven of the same character)
  dividerMarker   the dividing line
  endMarker       the line that ends their version
  markFixed       tell Git that index.html is fixed
  cancelMerge     stop the merge and go back to before`,

  break: `Make a conflict on purpose, in your git-play scratch folder:
  1. On main: create index.html containing one line, Hello. Add and commit it.
  2. git switch -c greeting. Change the line to Hello, friends! Commit.
  3. git switch main. Change the SAME line to Welcome! Commit.
  4. git merge greeting  (boom: CONFLICT!)
  5. Open index.html. Find the markers. Fix the file, then run your markFixed command and finish with git commit.
Break it on purpose: start the merge again and try your cancelMerge command instead. Everything goes back.`,

  say: `In one sentence: what is a merge conflict, and how do you fix one?`,

  starterCode: `// Strike 8: merge conflicts.

const answers = {
  startMarker: "",
  dividerMarker: "",
  endMarker: "",
  markFixed: "",
  cancelMerge: "",
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

test("startMarker", () => {
  need("The marker that starts MY version: seven < signs", answers.startMarker, ["<<<<<<<", "<<<<<<< HEAD"]);
});
test("dividerMarker", () => {
  need("The dividing line: seven = signs", answers.dividerMarker, ["======="]);
});
test("endMarker", () => {
  need("The marker that ends THEIR version: seven > signs", answers.endMarker, [">>>>>>>", ">>>>>>> greeting"]);
});
test("markFixed", () => {
  need("Tell Git index.html is fixed (git add ...)", answers.markFixed, ["git add index.html", "git add ."]);
});
test("cancelMerge", () => {
  need("Stop the merge and go back", answers.cancelMerge, ["git merge --abort"]);
});
`,

  hints: [
    "The three markers each repeat one character seven times: the start uses less-than signs, the divider uses equals signs, the end uses greater-than signs.",
    "To tell Git a file is fixed you stage it again, with the same command you use to save a change before committing: git add and then the file name.",
    "To cancel: git merge --abort.",
  ],

  solution: `=== CODE ===
const answers = {
  startMarker: "<<<<<<<",
  dividerMarker: "=======",
  endMarker: ">>>>>>>",
  markFixed: "git add index.html",
  cancelMerge: "git merge --abort",
};
=== LINE BY LINE ===
<<<<<<< marks the start of the version from the branch you are standing on. ======= splits the two versions. >>>>>>> marks the end of the version coming in.
You must delete all three marker lines yourself. If you leave one behind, your file will be broken (a stray <<<<<<< is not valid code).
git add index.html: Git treats "add" as "I have dealt with this file". Once every conflicted file is added, you can commit and the merge is complete.
git merge --abort: if you panic halfway, this restores your files to the moment before you typed git merge.`,
};
