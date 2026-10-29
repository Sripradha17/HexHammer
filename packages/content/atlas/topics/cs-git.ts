// Topic: Git and version control. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csGit: Topic = {
  id: "cs-git",
  domainId: "",
  moduleId: "",
  title: "Git and version control",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain commits, branches and HEAD as a graph of snapshots.",
    "Resolve a merge conflict confidently.",
    "Choose between merge and rebase, and know when rewriting history is unsafe.",
    "Undo common mistakes safely: restore, revert, reset and reflog.",
  ],
  prerequisites: [],
  subtopics: ["Working tree, staging area, repository", "Commits as snapshots", "Branches are pointers", "HEAD", "Merge and fast-forward", "Conflicts", "Rebase", "Undo: restore, revert, reset, reflog", "Good commit messages"],
  strikeIds: ["l3-s05", "l3-s07", "l3-s08"],

  story:
    "Friday, 5 p.m.: someone force-pushes to main and three people's work disappears from the shared branch. Another developer is too scared to touch a merge conflict, so they delete their branch and redo a day's work by hand. Both stories end the same way once you see Git for what it is: a graph of snapshots with sticky-note labels on it. Almost nothing in Git is truly lost, and almost everything is safe once you know which commands rewrite history.",
  mentalModel: {
    plain:
      "A commit is a snapshot of your whole project plus a pointer to its parent commit(s), so commits form a graph. A branch is just a movable label pointing at one commit. HEAD is 'where you are now'. Committing creates a new snapshot and moves the current branch's label forward. Merging joins two lines of history; rebasing replays your commits on top of another branch as new commits.",
    analogy:
      "A family tree of photos. Each photo (commit) shows the whole house at one moment and remembers which photo came before it. Branches are sticky notes saying 'Ada's version is here'. Merging takes a new family photo with both parents. Rebasing reshoots your photos as if you had started from a later moment.",
    analogyLimit:
      "Re-shot photos (rebased commits) are new photos with new ids. Anyone who already copied your old photos now has a different history from you, which is why you never rebase shared branches.",
  },
  lessonSections: [
    {
      heading: "1. Three places your changes live",
      body:
        "Working tree: the files you edit. Staging area (index): what will go into the next commit; `git add` puts changes there. Repository: the committed history; `git commit` saves the staged snapshot.\n\n`git status` tells you exactly which place each change is in. `git diff` shows unstaged changes; `git diff --staged` shows what will be committed.",
    },
    {
      heading: "2. Commits, branches and HEAD",
      body:
        "Each commit has an id (a hash), a snapshot, a message, an author and its parent(s). A branch is a pointer to a commit, which moves forward when you commit on it.\n\n`git switch -c feature` creates a new label at the current commit and moves HEAD onto it. Branches are cheap: making one costs almost nothing, so make one for every piece of work.",
    },
    {
      heading: "3. Merging and conflicts",
      body:
        "`git merge feature` brings feature's commits into your branch. If your branch has no new commits, Git just moves the label forward (fast-forward). Otherwise it creates a merge commit with two parents.\n\nA conflict happens when both sides changed the same lines. Git marks them with <<<<<<<, ======= and >>>>>>>. You edit the file to the correct final version (often a mix of both), remove the markers, run the tests, then `git add` and continue. A conflict is a question, not an error.",
    },
    {
      heading: "4. Rebase: a straight line",
      body:
        "`git rebase main` takes your branch's commits and replays them on top of the latest main, giving a straight history without merge commits.\n\nThe golden rule: rebase only commits that nobody else has. Rebasing rewrites commits (new ids); if others built on the old ones, their history no longer matches. For shared branches, merge. If you must force-push your own branch, use `--force-with-lease`.",
    },
    {
      heading: "5. Undo, safely",
      body:
        "Discard unstaged edits to a file: `git restore file`. Unstage: `git restore --staged file`.\n\nUndo a commit that is already pushed: `git revert <commit>` creates a NEW commit that reverses it; history is kept, safe for shared branches.\n\nMove your branch back locally: `git reset --soft HEAD~1` (keep changes staged) or `--hard` (throw them away, careful).\n\nLost something? `git reflog` lists everywhere HEAD has been; you can return to any of those commits.",
    },
    {
      heading: "6. Commits other people can read",
      body:
        "Make small commits that each do one thing and keep tests passing. Write messages in the imperative, with a short subject and, when useful, a body explaining WHY: 'Fix rounding in cart total (prices arrived as strings)'.\n\nNever commit secrets, build output or node_modules: use .gitignore.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Git is learned at a real terminal; the worked example is a real session showing a conflict appear and get resolved, and the strikes walk through branching, merging and undoing in a sandbox repository.",
  codeExamples: [
    {
      title: "A conflict, resolved",
      language: "bash",
      code: `$ git switch -c price-fix
$ # edit cart.js: change the tax rate line to 0.20, then commit
$ git commit -am "Use 20% tax rate"
$ git switch main
$ # meanwhile main changed the same line to 0.21
$ git merge price-fix
CONFLICT (content): Merge conflict in cart.js
$ cat cart.js
<<<<<<< HEAD
const TAX = 0.21;
=======
const TAX = 0.20;
>>>>>>> price-fix
$ # decide the correct value, remove the markers, keep one line: const TAX = 0.20;
$ npm test && git add cart.js && git commit --no-edit
$ git log --oneline --graph -3`,
      expectedOutput: `*   9f3c2e1 Merge branch 'price-fix'
|\\
| * 4b7d0a2 Use 20% tax rate
* | c81e5f9 Set tax rate to 21%`,
      steps: [
        "The feature branch and main both changed the same line, so Git cannot choose automatically and stops with a conflict.",
        "Between <<<<<<< HEAD and ======= is main's version; between ======= and >>>>>>> is the branch's version.",
        "You decide the correct final content (here, talking to whoever changed main would be wise), remove the markers, and run the tests before committing.",
        "The log graph shows two lines of history joined by a merge commit with two parents.",
      ],
    },
  ],
  practicalApplication:
    "Typical team flow: branch from main, commit small steps, push, open a pull request, keep the branch up to date (rebase your own branch or merge main into it), get review, merge, delete the branch. Protect main from force pushes. Use revert, not reset, on shared branches. Use git bisect to find which commit introduced a bug, and git blame (with care) to find why a line exists. In interviews, merge versus rebase and 'how do you undo a pushed commit' come up constantly.",
  commonMistakes: [
    {
      mistake: "Rebasing or force-pushing a shared branch.",
      symptom: "Teammates see diverged histories, duplicate commits, or lost work.",
      fix: "Only rebase your own unpushed or unshared commits; on shared branches, merge or revert. Use --force-with-lease if you must force-push your own branch.",
    },
    {
      mistake: "Using reset --hard to undo something already pushed.",
      symptom: "Your branch and the remote disagree; a force push then deletes others' work.",
      fix: "Use git revert, which adds a new commit undoing the change.",
    },
    {
      mistake: "Committing secrets.",
      symptom: "An API key is in history, even after deleting it in a later commit.",
      fix: "Rotate the key immediately (it is compromised), then clean history if needed; add the file to .gitignore.",
    },
    {
      mistake: "Resolving conflicts by blindly taking 'mine' or 'theirs'.",
      symptom: "Someone's fix silently disappears.",
      fix: "Read both sides, combine them deliberately, and run the tests before committing.",
    },
  ],
  misconceptions: [
    { myth: "A branch is a copy of the code.", truth: "A branch is a tiny pointer to a commit; creating one is instant." },
    { myth: "Git stores differences between files.", truth: "Each commit is a snapshot of the whole tree (stored efficiently, with unchanged files shared)." },
    { myth: "Once you reset or delete a branch, the work is gone.", truth: "Commits stay reachable through the reflog for weeks; you can usually recover them." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s05", why: "Stage, commit and read history by hand." },
    { kind: "strike", strikeId: "l3-s07", why: "Create branches, merge them and resolve a real conflict." },
    { kind: "strike", strikeId: "l3-s08", why: "Undo safely: restore, revert and reset." },
    {
      kind: "predict",
      question: {
        id: "cs-git-p1",
        prompt: "You committed a bug that is already pushed to main and teammates have pulled it. What is the safe way to undo it?",
        choices: ["git reset --hard HEAD~1 and force push", "git revert <commit> and push", "Delete the repository", "git commit --amend and force push"],
        answerIndex: 1,
        explanation: "revert adds a new commit that undoes the change, so history stays consistent for everyone. Resetting or amending rewrites shared history.",
        objective: 3,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-git-k1",
      prompt: "What is a Git branch?",
      choices: ["A full copy of the project", "A movable pointer to a commit", "A separate repository", "A zip file of changes"],
      answerIndex: 1,
      explanation: "That is why creating and switching branches is so fast.",
      objective: 0,
    },
    {
      id: "cs-git-k2",
      prompt: "What does `git add` do?",
      choices: ["Uploads to GitHub", "Puts changes into the staging area for the next commit", "Creates a branch", "Deletes untracked files"],
      answerIndex: 1,
      explanation: "add stages changes; commit saves the staged snapshot; push uploads commits.",
      objective: 0,
    },
  ],
  project: {
    title: "Git Time Machine: a guided repository of mistakes and recoveries",
    summary: "Create a practice repository with a script that sets up tricky situations (conflict, bad pushed commit, lost commit after reset, secret committed), then solve each and document the exact commands and why they are safe.",
    type: "exercise",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A setup script that creates a repository and builds each scenario reproducibly.",
      "Solve a three-way conflict, revert a pushed bad commit, and recover a commit 'lost' by reset --hard using reflog.",
      "Rebase a feature branch onto main and explain the before/after graph.",
      "A written guide (README) for each scenario: symptoms, commands, and why they are safe or unsafe.",
    ],
    acceptanceCriteria: [
      "Running the setup script twice produces the same scenarios.",
      "Each solution is verified by a check script (for example: the lost commit's file exists again).",
      "The guide states which commands rewrite history and when they must not be used.",
    ],
    technologies: ["Git", "Bash or Node.js scripts"],
    milestones: [
      { title: "Scenarios", done_when: "The setup script creates all four situations." },
      { title: "Solutions", done_when: "Each is solved and verified by a script." },
      { title: "Rebase", done_when: "Before/after graphs are captured and explained." },
      { title: "Guide", done_when: "The README is a guide you would give a new teammate." },
    ],
    testIdeas: ["Run checks after each solution", "Re-run setup on a clean folder"],
    stretchGoals: ["Add a git bisect scenario", "Add an interactive rebase to clean up commits before review"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-git-a1",
        prompt: "What does HEAD refer to?",
        choices: ["The first commit ever", "The commit (usually via a branch) you currently have checked out", "The remote server", "The newest commit on GitHub"],
        answerIndex: 1,
        explanation: "HEAD is 'where you are now'; new commits are added on top of it.",
        objective: 0,
      },
      {
        id: "cs-git-a2",
        prompt: "What do you do when Git reports a merge conflict?",
        choices: [
          "Delete your branch and start again",
          "Edit the marked sections into the correct final content, remove the markers, test, add and commit",
          "Always keep your own version",
          "Run git push --force",
        ],
        answerIndex: 1,
        explanation: "Conflicts are decisions Git leaves to you. Combine both sides deliberately and verify with tests.",
        objective: 1,
      },
      {
        id: "cs-git-a3",
        prompt: "When is rebasing unsafe?",
        choices: ["On your own local branch", "On commits other people already have, like a shared branch", "Before opening a pull request", "When the branch has one commit"],
        answerIndex: 1,
        explanation: "Rebase creates new commits; anyone who had the old ones now has a diverged history.",
        objective: 2,
      },
      {
        id: "cs-git-a4",
        prompt: "You ran `git reset --hard` and lost a commit you needed. How do you get it back?",
        choices: ["It is gone forever", "Find it in `git reflog` and reset or branch to it", "Ask GitHub support", "git revert HEAD"],
        answerIndex: 1,
        explanation: "The reflog records where HEAD has been, so the commit's id is still there for a while.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-git-q01", tags: ["git", "merge-rebase"], difficulty: "core", kind: "concept",
      prompt: "What is the difference between merge and rebase? Which do you use?",
      expectedElements: ["merge keeps history, adds merge commit", "rebase replays commits, linear history, new ids", "never rebase shared commits", "team convention"],
      modelAnswer: "Merge joins two branches with a merge commit, preserving exactly what happened, including parallel work. Rebase replays my commits on top of another branch, creating new commits and a straight history that is easier to read. Because rebase rewrites commit ids, I only rebase my own unshared branch, for example to update it before a pull request; shared branches are merged. In practice I follow the team's convention, often squash or rebase-merge for pull requests.",
      explanation: "The golden rule must appear.",
      commonWrongAnswers: ["Rebase is always better."],
    },
    {
      id: "cs-git-q02", tags: ["git", "undo"], difficulty: "foundation", kind: "concept",
      prompt: "How do you undo a commit that has already been pushed to a shared branch?",
      expectedElements: ["git revert creates inverse commit", "history preserved", "avoid reset + force push", "revert merge commits with -m"],
      modelAnswer: "Use git revert with the commit's id. It creates a new commit that reverses the changes, so the history everyone else has stays valid, and I push normally. I avoid reset followed by a force push on shared branches, because it rewrites history others depend on. For a merge commit, revert needs -m to say which parent to keep.",
      explanation: "Safe undo is the most practical Git skill.",
      commonWrongAnswers: ["git reset --hard and force push."],
    },
    {
      id: "cs-git-q03", tags: ["git", "internals"], difficulty: "core", kind: "concept",
      prompt: "How does Git store history?",
      expectedElements: ["content-addressed objects (blobs, trees, commits)", "commit = snapshot + parents + metadata", "hashes", "branches are refs to commits", "DAG"],
      modelAnswer: "Git is a content-addressed store. Files are stored as blobs, directories as trees pointing to blobs and other trees, and each commit points to one root tree plus its parent commits, the author and message. Every object is identified by a hash of its content, so identical files are stored once. Commits form a directed acyclic graph, and branches and tags are just named references to commits.",
      explanation: "Snapshots, not diffs, is the key correction to a common belief.",
      commonWrongAnswers: ["Git stores a list of diffs per file."],
    },
    {
      id: "cs-git-q04", tags: ["git", "conflicts"], difficulty: "foundation", kind: "scenario",
      prompt: "Walk me through resolving a merge conflict.",
      expectedElements: ["identify files (git status)", "read both sides and intent", "edit to final version, remove markers", "run tests", "add and commit/continue", "ask the other author if unsure"],
      modelAnswer: "git status lists the conflicted files. In each, I read both versions between the markers and work out what each side intended, checking the commits or asking the other author if it is not clear. I edit the file into the correct final version, remove the markers, run the tests and build, then git add the file and complete the merge or rebase with commit or rebase --continue.",
      explanation: "Understanding intent is what separates a good resolution from a lucky one.",
      commonWrongAnswers: ["Always accept the incoming change."],
    },
    {
      id: "cs-git-q05", tags: ["git", "workflow"], difficulty: "foundation", kind: "concept",
      prompt: "Describe a good Git workflow for a team.",
      expectedElements: ["short-lived feature branches", "small commits, clear messages", "pull requests with review and CI", "protected main", "keep branches up to date", "delete merged branches"],
      modelAnswer: "Everyone works on short-lived branches from main, makes small focused commits with clear messages, and opens a pull request early. CI runs tests on every pull request, at least one reviewer approves, and main is protected from direct pushes and force pushes. Branches are kept up to date with main and deleted after merging. Short-lived branches keep conflicts small.",
      explanation: "Protected main and CI on PRs are the expected elements.",
      commonWrongAnswers: ["Everyone pushes to main."],
    },
    {
      id: "cs-git-q06", tags: ["git", "security"], difficulty: "core", kind: "scenario",
      prompt: "You accidentally pushed an API key to a public repository. What do you do?",
      expectedElements: ["revoke/rotate the key immediately", "assume compromised", "remove from history (filter-repo) if needed", "check logs for misuse", "prevent: .gitignore, secret scanning"],
      modelAnswer: "First, revoke and rotate the key immediately, because bots scan public repositories within minutes, so it must be treated as compromised. Then check the provider's logs for misuse. Removing it from the latest commit is not enough, since it is still in history; if needed, rewrite history with git filter-repo and coordinate with the team. Finally prevent a repeat: keep secrets in environment variables, add .env to .gitignore, and enable secret scanning and pre-commit hooks.",
      explanation: "Rotate first is the critical ordering.",
      commonWrongAnswers: ["Delete the file in a new commit and move on."],
    },
    {
      id: "cs-git-q07", tags: ["git", "reflog"], difficulty: "core", kind: "concept",
      prompt: "What is the reflog, and when has it saved you?",
      expectedElements: ["local log of where HEAD/branches pointed", "recover after reset/rebase/branch delete", "local only, expires"],
      modelAnswer: "The reflog is a local record of everywhere HEAD and each branch have pointed, including commits no branch points to any more. After a bad reset --hard, a botched rebase or a deleted branch, I find the commit in git reflog and create a branch or reset to it. It only exists on my machine and entries expire after a while, so it is a safety net, not a backup.",
      explanation: "Knowing it is local-only is a good nuance.",
      commonWrongAnswers: ["It is the same as git log."],
    },
    {
      id: "cs-git-q08", tags: ["git", "commits"], difficulty: "foundation", kind: "concept",
      prompt: "What makes a good commit?",
      expectedElements: ["one logical change", "builds and tests pass", "clear imperative subject", "body explains why", "no unrelated changes/secrets"],
      modelAnswer: "A good commit contains one logical change that leaves the project building and its tests passing, so it can be reviewed, reverted or bisected on its own. Its subject line is short and in the imperative, like 'Fix rounding in cart total', and the body explains why the change was needed when that is not obvious. It does not mix in unrelated formatting or anything secret.",
      explanation: "Linking good commits to bisect and revert shows depth.",
      commonWrongAnswers: ["One big commit at the end of the day."],
    },
  ],
  references: [
    { title: "Pro Git book (free online)", url: "https://git-scm.com/book/en/v2", kind: "book" },
    { title: "Git docs: git-revert", url: "https://git-scm.com/docs/git-revert", kind: "official-docs" },
    { title: "The Missing Semester of Your CS Education (MIT): Version Control (Git)", url: "https://missing.csail.mit.edu/2020/version-control/", kind: "course" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Snapshots, branches as pointers, and 'never rewrite shared history' are stable Git fundamentals."],
  versionSpecific: ["Newer commands (git switch, git restore) replaced parts of git checkout in Git 2.23."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
