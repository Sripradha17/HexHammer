import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s10",
  level: 3,
  order: 10,
  title: "npm and packages",

  look: `Nobody builds everything from scratch. Other developers share ready-made code as PACKAGES: date helpers, web servers, test tools. npm (Node Package Manager) is the app store for those packages, and it comes with Node.

Every project has a file called package.json. It is the project's ID card and shopping list:

  {
    "name": "my-app",
    "scripts": { "test": "vitest", "build": "vite build" },     // shortcuts you can run
    "dependencies": { "express": "^5.0.0" },                     // needed to RUN the app
    "devDependencies": { "vitest": "^3.0.0" }                    // only needed while BUILDING it
  }

The commands:

  npm init -y                   make a new package.json (answer yes to everything)
  npm install lodash            add a package (npm i lodash is the short form)
  npm install --save-dev vitest add a tool that only developers need (-D is the short form)
  npm run build                 run the script called build
  npm test                      run the script called test (test and start have shortcuts)
  npm ci                        install EXACTLY what the lock file says, for clean and repeatable installs

Version numbers look like 1.4.2 (major.minor.patch). The ^ in ^1.4.2 means "any newer 1.x.x is fine, but do not jump to 2.0.0" (a big number change can break things).

Packages land in a folder called node_modules. It is huge, so you NEVER commit it: your .gitignore lists it, and npm install rebuilds it.

This is a GUIDED-LOCAL strike: you try the commands in a new folder.`,

  type: `Fill in the answers object:
  newProject       make a new package.json, saying yes to everything
  addPackage       add the package lodash
  addDevTool       add the package vitest as a developer-only tool (use the long flag)
  runBuild         run the script called build
  cleanInstall     install exactly what the lock file says
  caretMeaning     what does ^1.4.2 allow? pick a, b or c (see the starter file)`,

  break: `Try it for real, in an empty folder:
  mkdir npm-play
  cd npm-play
  Run your newProject command, then open package.json in your editor and read it.
  Run your addPackage command and watch: a node_modules folder and package-lock.json appear.
  Run your addDevTool command and see it land under devDependencies.
Break it on purpose: delete the node_modules folder completely, then run npm install. Everything comes back, because package.json and the lock file remember what you need. That is why node_modules is never committed.`,

  say: `In one sentence: what is a package, and why do we never commit the node_modules folder?`,

  starterCode: `// Strike 10: npm and packages.

// caretMeaning: what does "^1.4.2" allow?
//   a) exactly 1.4.2 and nothing else
//   b) any newer 1.x.x version, but not 2.0.0
//   c) any version at all, even 9.0.0

const answers = {
  newProject: "",
  addPackage: "",
  addDevTool: "",
  runBuild: "",
  cleanInstall: "",
  caretMeaning: "",
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

test("newProject", () => {
  need("Make a new package.json, yes to everything", answers.newProject, ["npm init -y", "npm init --yes"]);
});
test("addPackage", () => {
  need("Add the package lodash", answers.addPackage, ["npm install lodash", "npm i lodash", "npm add lodash"]);
});
test("addDevTool", () => {
  need("Add vitest as a developer-only tool (--save-dev)", answers.addDevTool, [
    "npm install --save-dev vitest",
    "npm install -D vitest",
    "npm i -D vitest",
    "npm i --save-dev vitest",
  ]);
});
test("runBuild", () => {
  need("Run the script called build", answers.runBuild, ["npm run build"]);
});
test("cleanInstall", () => {
  need("Install exactly what the lock file says", answers.cleanInstall, ["npm ci"]);
});
test("caretMeaning", () => {
  need("What does ^1.4.2 allow? (a, b or c)", answers.caretMeaning, ["b", "B"]);
});
`,

  hints: [
    "All npm commands start with npm. Adding things uses install (or i). Running a script uses run and then the script's name.",
    "A developer-only tool uses a flag: --save-dev (or -D for short) between install and the package name.",
    'For the caret: think of 1.x.x as "same big version". A jump to 2.0.0 might break things, so it stays out.',
  ],

  solution: `=== CODE ===
const answers = {
  newProject: "npm init -y",
  addPackage: "npm install lodash",
  addDevTool: "npm install --save-dev vitest",
  runBuild: "npm run build",
  cleanInstall: "npm ci",
  caretMeaning: "b",
};
=== LINE BY LINE ===
npm init -y writes a starter package.json without asking questions (-y means yes).
npm install lodash downloads the package into node_modules and writes its name into dependencies in package.json.
--save-dev files vitest under devDependencies: tools you need while building, but not when the finished app runs.
npm run build runs whatever the "build" script in package.json says. npm test is a shortcut for npm run test.
npm ci is "clean install": it deletes node_modules and installs exactly the versions in package-lock.json. Great for build servers, because everyone gets the same thing.
^1.4.2 is b: the caret allows new minor and patch releases (1.5.0, 1.4.9) but stops before the next major (2.0.0), which is allowed to break your code.`,
};
