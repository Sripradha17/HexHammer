import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s05",
  level: 3,
  order: 5,
  title: "Git: branches",

  look: `Git saves the history of your project, like a video game with unlimited save points. Each save point is a commit.

A BRANCH is a parallel universe. You copy the project, try something risky, and the main project (called main) stays safe. If the experiment works, you MERGE it back. If not, you throw the branch away.

The commands you need (you type them in a terminal inside your project folder):

  git branch                   list your branches (the * marks where you are)
  git switch -c my-idea        make a new branch called my-idea AND move onto it
  git switch main              move back to main
  git merge my-idea            bring my-idea's work into the branch you are on
  git branch -d my-idea        delete the branch (only if it was merged)

Good branch names say what the work is: feature/login, fix/typo-in-footer.

This is a GUIDED-LOCAL strike. Git cannot run inside this page, so you will practise it in a real terminal on your own computer. Here you fill in the commands you used, and the tests check them.`,

  type: `In the editor, fill in the answers object with the commands (type each one as you would in the terminal):
  listBranches    show all the branches
  createAndSwitch make a new branch called feature/login and move onto it
  switchToMain    move back to the main branch
  mergeLogin      (while on main) bring feature/login into main
  deleteLogin     delete the merged feature/login branch`,

  break: `Try it for real, in a SAFE scratch folder (never inside a project you care about):

  mkdir git-play
  cd git-play
  git init
  git switch -c main          (only if git says you are on "master")
  echo hello > a.txt
  git add a.txt
  git commit -m "first save"

Now do your five commands from the answers, in order. Make a file change on feature/login and commit it before you merge. Then run git branch to see what is left.
Break it on purpose: try git branch -d on a branch that was NOT merged. Git refuses to protect your work. Read the message!`,

  say: `In one sentence: what is a branch, and why do people make one before changing something risky?`,

  starterCode: `// Strike 5: Git branches. Type the commands you used in your practice folder.

const answers = {
  listBranches: "",
  createAndSwitch: "",
  switchToMain: "",
  mergeLogin: "",
  deleteLogin: "",
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

test("listBranches", () => {
  need("Which command lists the branches?", answers.listBranches, ["git branch", "git branch --list"]);
});
test("createAndSwitch", () => {
  need("Make a branch called feature/login AND move onto it (git switch -c ...)", answers.createAndSwitch, [
    "git switch -c feature/login",
    "git switch --create feature/login",
    "git checkout -b feature/login",
  ]);
});
test("switchToMain", () => {
  need("Move back to main", answers.switchToMain, ["git switch main", "git checkout main"]);
});
test("mergeLogin", () => {
  need("While on main, merge feature/login into it", answers.mergeLogin, ["git merge feature/login"]);
});
test("deleteLogin", () => {
  need("Delete the merged branch (the safe lowercase -d)", answers.deleteLogin, [
    "git branch -d feature/login",
    "git branch --delete feature/login",
  ]);
});
`,

  hints: [
    "Every Git command starts with the word git. The branch commands start with git branch or git switch.",
    "git switch -c NAME creates and moves in one go. To go back you just leave out -c. git merge NAME merges NAME into where you are standing.",
    "To delete a merged branch: git branch -d feature/login (small d = safe delete).",
  ],

  solution: `=== CODE ===
const answers = {
  listBranches: "git branch",
  createAndSwitch: "git switch -c feature/login",
  switchToMain: "git switch main",
  mergeLogin: "git merge feature/login",
  deleteLogin: "git branch -d feature/login",
};
=== LINE BY LINE ===
git branch: lists the branches and puts a star next to the one you are on.
git switch -c feature/login: -c means "create". You start the branch from wherever you are standing and move onto it in one step.
git switch main: moves you back. Your files change to match main. The work on feature/login is safe, just not visible right now.
git merge feature/login: merging always brings the OTHER branch into the one you are standing on. That is why you must be on main first.
git branch -d feature/login: the small -d only deletes a branch whose work is already merged, so you cannot lose anything by accident. The big -D forces it, so be careful with that one.`,
};
