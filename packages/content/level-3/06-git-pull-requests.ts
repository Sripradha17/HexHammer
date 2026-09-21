import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s06",
  level: 3,
  order: 6,
  title: "Git: pull requests",

  look: `On a team you do not merge straight into main. You ask politely: "Here is my branch. Would you look it over and merge it?" That polite ask is a PULL REQUEST (PR).

The steps:
  1. Work on a branch:               git switch -c fix/typo
  2. Save your work:                 git add .   then   git commit -m "Fix typo in footer"
  3. Send the branch to GitHub:      git push -u origin fix/typo      (-u remembers where it goes)
  4. On GitHub, click "Compare and pull request", write a title and a short description.
  5. Teammates review it, ask for changes, and approve.
  6. The PR is merged. Delete the branch.

A good PR is SMALL (one idea), has a clear title ("Fix footer typo"), explains WHY, and says how you tested it.

This is a GUIDED-LOCAL strike: the pushing and the PR happen on GitHub (free), outside this page. You fill in the answers below.`,

  type: `Fill in the answers object:
  pushFirstTime   push your current branch fix/typo to origin, and remember it for later (-u)
  whatIsAPr       pick the best description: a, b or c (see the starter file)
  bestTitle       pick the best PR title: a, b or c
  smallIsGood     pick the best reason to keep PRs small: a, b or c`,

  break: `Try it for real, for free:
  1. Create a free GitHub account if you have none, and make a new EMPTY repository called git-play (no README).
  2. In your git-play folder from the last strike, run the two lines GitHub shows you (git remote add origin ... and git push -u origin main).
  3. Make a branch, change a file, commit, and run your pushFirstTime command.
  4. On GitHub, open a pull request from your branch to main. Look at the "Files changed" tab.
Break it on purpose: leave the PR description empty and imagine being the reviewer. Notice how much harder it is to review without a "why"!`,

  say: `In one sentence: what is a pull request, and what makes a good one?`,

  starterCode: `// Strike 6: pull requests.

// whatIsAPr:
//   a) a way to delete a branch
//   b) a request to merge my branch into another one, with a chance for others to review it
//   c) a command that downloads the whole internet
//
// bestTitle:
//   a) "stuff"
//   b) "Fixed things and also changed the colors and added login"
//   c) "Fix typo in the footer"
//
// smallIsGood:
//   a) small PRs are easier and faster to review, so bugs get caught
//   b) small PRs use less disk space
//   c) small PRs cannot be merged

const answers = {
  pushFirstTime: "",
  whatIsAPr: "",
  bestTitle: "",
  smallIsGood: "",
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

test("pushFirstTime", () => {
  need("Push fix/typo to origin and remember it (-u)", answers.pushFirstTime, [
    "git push -u origin fix/typo",
    "git push --set-upstream origin fix/typo",
    "git push -u origin HEAD",
  ]);
});
test("whatIsAPr", () => {
  need("Which describes a pull request? (a, b or c)", answers.whatIsAPr, ["b", "B"]);
});
test("bestTitle", () => {
  need("Which title is clear and about ONE thing? (a, b or c)", answers.bestTitle, ["c", "C"]);
});
test("smallIsGood", () => {
  need("Why keep pull requests small? (a, b or c)", answers.smallIsGood, ["a", "A"]);
});
`,

  hints: [
    "The push command starts with git push. The -u flag goes right after push, then the remote name (origin), then the branch name.",
    "A pull request is a REQUEST to merge, not a command. Read option b again.",
    "A good title is short and about one thing. A good reason for small PRs is about how people review them.",
  ],

  solution: `=== CODE ===
const answers = {
  pushFirstTime: "git push -u origin fix/typo",
  whatIsAPr: "b",
  bestTitle: "c",
  smallIsGood: "a",
};
=== LINE BY LINE ===
git push -u origin fix/typo: push sends your commits to the shared copy on GitHub, which Git calls origin. -u links your local branch with the remote one, so next time a plain git push works.
whatIsAPr is b: the PR is where the team discusses and reviews before the code reaches main. Nothing is merged until someone agrees.
bestTitle is c: it names one clear change. Titles like "stuff" tell a reviewer nothing, and a title with "and also" means the PR does too many things.
smallIsGood is a: a reviewer can read 20 changed lines carefully. Nobody really reads 2,000 lines, so big PRs hide bugs.`,
};
