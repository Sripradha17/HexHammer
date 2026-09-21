import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s07",
  level: 3,
  order: 7,
  title: "Git: rebase",

  look: `You branched off main last Monday. Since then, your friends added new work to main. Now your branch is behind. How do you catch up? Two ways:

  MERGE   ties the two histories together with an extra "merge commit". Nothing is rewritten, but history gets a bit tangled.
  REBASE  picks up your commits, moves the start of your branch to the newest main, and replays your commits on top. History stays a neat straight line.

Picture your work as a train of carriages. Rebase unhooks your carriages, drives to the end of main's train, and hooks them on again.

  git switch fix/typo      be on YOUR branch
  git rebase main          replay my commits on top of the newest main

If your changes clash with someone else's, Git stops and asks you to fix the clash. Then:
  git rebase --continue    keep going after you fixed it
  git rebase --abort       cancel everything, go back to how it was (a great panic button!)

THE GOLDEN RULE: rebase REWRITES history (your commits get new IDs). Never rebase commits that other people already have.

This is a GUIDED-LOCAL strike: you practise in a scratch folder, and fill in the answers.`,

  type: `Fill in the answers object:
  rebaseOntoMain     while on your feature branch, replay it on top of main
  continueRebase     keep going after you fixed a clash
  cancelRebase       give up and go back to how things were
  goldenRule         pick a, b or c (see the starter file)`,

  break: `Try it for real in your git-play scratch folder:
  1. On main, make a commit A (change a file). Now make a branch: git switch -c my-work. On my-work make a commit B.
  1b. Switch back to main (git switch main) and make one more commit C. Now the two branches have gone in different directions.
  2. Run git log --oneline --graph --all and look at the fork.
  3. git switch my-work and run your rebaseOntoMain command. Run the log again. The fork is now a straight line!
Break it on purpose: make BOTH branches edit the same line of the same file, and start a rebase. See the clash message, then use your cancelRebase command. Nothing is lost.`,

  say: `In one sentence: what is the difference between merge and rebase, and what is the golden rule of rebase?`,

  starterCode: `// Strike 7: rebase.

// goldenRule:
//   a) always rebase branches that other people are also using
//   b) never rebase commits that other people already have
//   c) rebase is only allowed on Tuesdays

const answers = {
  rebaseOntoMain: "",
  continueRebase: "",
  cancelRebase: "",
  goldenRule: "",
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

test("rebaseOntoMain", () => {
  need("On your branch, replay your commits on top of main", answers.rebaseOntoMain, ["git rebase main"]);
});
test("continueRebase", () => {
  need("Keep going after fixing a clash", answers.continueRebase, ["git rebase --continue"]);
});
test("cancelRebase", () => {
  need("Cancel the rebase and go back", answers.cancelRebase, ["git rebase --abort"]);
});
test("goldenRule", () => {
  need("Which is the golden rule of rebase? (a, b or c)", answers.goldenRule, ["b", "B"]);
});
`,

  hints: [
    "All three commands start with git rebase. The two helpers add a flag that starts with two dashes.",
    "To rebase onto main you name main: git rebase main. The helpers are --continue and --abort.",
    "The golden rule is about protecting other people: their copies of your commits would no longer match.",
  ],

  solution: `=== CODE ===
const answers = {
  rebaseOntoMain: "git rebase main",
  continueRebase: "git rebase --continue",
  cancelRebase: "git rebase --abort",
  goldenRule: "b",
};
=== LINE BY LINE ===
git rebase main: run it while standing on your branch. Git remembers your commits, moves your branch's starting point to the tip of main, then replays them one by one.
git rebase --continue: if a replayed commit clashed, Git pauses. You fix the file, git add it, and then --continue moves on to the next commit.
git rebase --abort: the panic button. It puts everything back exactly as it was before you started.
goldenRule is b: rebase gives your commits brand-new IDs. If a teammate already has the old ones, their history and yours no longer match and it becomes a mess. Rebase only your own private work.`,
};
