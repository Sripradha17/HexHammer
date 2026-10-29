// Topic: Modules, packages and dependencies. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csModulesPackages: Topic = {
  id: "cs-modules-packages",
  domainId: "",
  moduleId: "",
  title: "Modules, packages and dependencies",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Split code into modules with import and export, and explain what a module boundary hides.",
    "Explain semantic versioning and read a version range like ^1.4.2.",
    "Explain what a lockfile guarantees and why it is committed.",
    "Judge whether to add a dependency, and keep dependencies safe.",
  ],
  prerequisites: ["cs-functions-scope"],
  subtopics: ["ES modules: import / export", "Named vs default exports", "Module scope", "npm packages and package.json", "SemVer and ranges", "Lockfiles", "Supply-chain safety"],
  strikeIds: ["l2-s13", "l3-s10"],

  story:
    "Friday afternoon: nobody changed any code, but the deploy breaks. A dependency of a dependency released 2.0 with a breaking change, and the project had no lockfile, so the build server installed the new version. Another team discovers a tiny 'left-pad' style package they rely on was deleted overnight. Modules keep your own code organised; packages bring in other people's code, and with it, other people's decisions.",
  mentalModel: {
    plain:
      "A module is one file with its own private scope. It chooses what to share with `export`; other files take what they need with `import`. A package is a folder of modules published to a registry (npm) with a name and a version. package.json lists what you depend on; the lockfile records the exact versions that were actually installed.",
    analogy:
      "Modules are rooms in your house: each has its own things, and a door (exports) to hand out what others may use. Packages are furniture from a shop. package.json is your shopping list ('a sofa, version 2-ish'); the lockfile is the receipt with the exact model numbers, so the same furniture arrives every time.",
    analogyLimit:
      "Shop furniture does not secretly bring its own furniture. Packages do: every package has its own dependencies, so installing one package can install hundreds.",
  },
  lessonSections: [
    {
      heading: "1. A module is a file with private scope",
      body:
        "Variables declared at the top of a module are NOT global: they belong to that module. Only what you `export` can be imported elsewhere.\n\nThis gives you encapsulation: a module can keep helpers private and expose a small, clear interface. Changing private code cannot break other files.",
    },
    {
      heading: "2. import and export",
      body:
        "Named exports: `export function price() {}` and `import { price } from \"./cart.js\"`. Names must match, and a file can have many.\n\nDefault export: `export default function Cart() {}` and `import Cart from \"./Cart.js\"`. One per file; the importer chooses the name.\n\nMany teams prefer named exports: renames are easier to track and autocomplete works better. A module's top-level code runs once, the first time it is imported; later imports share the same instance.",
    },
    {
      heading: "3. Packages and package.json",
      body:
        "`npm install zod` downloads the package into node_modules and records it in package.json.\n\n`dependencies` are needed when the app runs; `devDependencies` only when building or testing (TypeScript, Vitest).\n\nnode_modules is never committed: it can always be rebuilt from package.json and the lockfile.",
    },
    {
      heading: "4. Semantic versioning",
      body:
        "A version is MAJOR.MINOR.PATCH, like 2.5.1.\n\nPATCH: bug fixes, nothing else changes. MINOR: new features, nothing breaks. MAJOR: something may break; read the changelog.\n\nRanges: `^2.5.1` allows any 2.x.x from 2.5.1 upward (not 3.0.0). `~2.5.1` allows only 2.5.x. `2.5.1` exactly pins it. Note the special rule for 0.x versions: `^0.4.2` only allows 0.4.x, because before 1.0 every minor can break.",
    },
    {
      heading: "5. Lockfiles: the same install everywhere",
      body:
        "Ranges mean two installs on different days can get different versions. package-lock.json (or pnpm-lock.yaml, yarn.lock) records the EXACT version of every package in the whole tree, plus a checksum.\n\nCommit it. In CI use `npm ci`, which installs exactly what the lockfile says and fails if it disagrees with package.json. Update dependencies deliberately, in their own pull request.",
    },
    {
      heading: "6. Every dependency is a decision",
      body:
        "Before adding a package, ask: could I write this in 20 lines? Is it maintained? How many dependencies does IT pull in? What is its license?\n\nKeep them safe: run `npm audit`, use tools like Dependabot or Renovate for updates, and be suspicious of packages with names one letter away from popular ones (typosquatting).",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Version ranges are best learned by predicting which versions match: the worked example implements caret ranges in a few lines and the predict exercise asks you to apply them.",
  codeExamples: [
    {
      title: "What does ^ actually allow?",
      language: "js",
      code: `// A tiny version of npm's caret rule, for versions 1.0.0 and above
function parse(v) { return v.split(".").map(Number); }

function satisfiesCaret(version, base) {
  const [M, m, p] = parse(version);
  const [bM, bm, bp] = parse(base);
  if (M !== bM) return false;                 // a new MAJOR may break: not allowed
  if (m !== bm) return m > bm;                 // newer minor: allowed
  return p >= bp;                              // same minor: patch must be at least base
}

for (const v of ["2.5.1", "2.5.9", "2.9.0", "3.0.0", "2.4.9"]) {
  console.log(v, satisfiesCaret(v, "2.5.1"));
}`,
      expectedOutput: `2.5.1 true
2.5.9 true
2.9.0 true
3.0.0 false
2.4.9 false`,
      steps: [
        "^2.5.1 means 'compatible with 2.5.1': same MAJOR (2), and not older than 2.5.1.",
        "2.5.1 and 2.5.9 have the same major and minor and an equal or newer patch: allowed.",
        "2.9.0 is a newer minor in the same major: allowed, because minors should not break anything.",
        "3.0.0 changes the major, which may break things: refused. 2.4.9 is older than the base: refused.",
      ],
    },
  ],
  practicalApplication:
    "On every team: commit the lockfile, install with `npm ci` in CI, upgrade dependencies in small dedicated pull requests with tests, and read the changelog before any MAJOR bump. In code, keep modules small with a clear public surface (an index file that exports only what others should use), and avoid circular imports, which cause 'undefined' values at startup. In interviews, 'how would you upgrade a major version of a core library safely' is a common behavioural-technical question.",
  commonMistakes: [
    {
      mistake: "Not committing the lockfile.",
      symptom: "Works on my machine, breaks in CI or production after a dependency releases a new version.",
      fix: "Commit package-lock.json and install with `npm ci` in CI.",
    },
    {
      mistake: "Putting build or test tools in dependencies.",
      symptom: "Production images are huge and slow to deploy.",
      fix: "Use devDependencies for TypeScript, test runners and linters.",
    },
    {
      mistake: "Two modules importing each other (a cycle).",
      symptom: "An imported value is undefined at startup, but only in some import orders.",
      fix: "Move the shared piece into a third module both can import, or pass it in as a parameter.",
    },
  ],
  misconceptions: [
    { myth: "^1.2.3 means 'version 1.2.3 or anything newer'.", truth: "It means any 1.x.x from 1.2.3 upward. 2.0.0 is excluded because a major version may break things." },
    { myth: "The lockfile is just a cache you can delete when things break.", truth: "It is the record of exactly what works. Deleting it re-resolves every range and can pull in hundreds of new versions at once." },
    { myth: "Each import of a module runs its code again.", truth: "A module runs once; every importer shares the same instance and its state." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s13", why: "Split a small program into modules with named exports, by hand." },
    { kind: "strike", strikeId: "l3-s10", why: "Work with a real package.json: scripts, dependencies and versions." },
    {
      kind: "predict",
      question: {
        id: "cs-modules-packages-p1",
        prompt: "package.json says \"lodash\": \"~4.17.10\". Which version may npm install?",
        choices: ["4.18.0", "4.17.21", "5.0.0", "4.16.9"],
        answerIndex: 1,
        explanation: "The tilde allows only patch updates within 4.17.x, from 4.17.10 upward. 4.17.21 qualifies; 4.18.0 is a new minor, 5.0.0 a new major, and 4.16.9 is older.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-modules-packages-k1",
      prompt: "A library goes from 3.4.2 to 4.0.0. What does that signal?",
      choices: ["Only bug fixes", "New features, nothing broken", "Breaking changes may be included", "Nothing: versions are random"],
      answerIndex: 2,
      explanation: "A MAJOR bump is the author's warning that existing code may need changes.",
      objective: 1,
    },
    {
      id: "cs-modules-packages-k2",
      prompt: "What is the main job of package-lock.json?",
      choices: ["List scripts", "Record the exact installed version of every package in the tree", "Speed up the internet", "Store passwords"],
      answerIndex: 1,
      explanation: "It pins the whole dependency tree so every install, everywhere, gets the same code.",
      objective: 2,
    },
  ],
  project: {
    title: "Dependency Doctor: a CLI that explains your package.json",
    summary: "Build a command-line tool that reads a project's package.json and lockfile, then reports outdated ranges, major-version risks, duplicated packages and dependencies in the wrong section.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Split the tool into modules: read files, parse versions, analyse, print report.",
      "Implement caret and tilde range checks yourself (no semver library) with tests.",
      "Report packages whose installed version (from the lockfile) does not satisfy package.json.",
      "Flag likely dev tools (typescript, vitest, eslint...) listed in dependencies.",
    ],
    acceptanceCriteria: [
      "Tests cover ^ and ~ for normal versions and the 0.x special case.",
      "Running it on this repository prints a report without crashing.",
      "Each module exports only what the others need (checked in review).",
    ],
    technologies: ["Node.js", "TypeScript", "Vitest"],
    milestones: [
      { title: "Versions", done_when: "parse, compare, caret and tilde are tested." },
      { title: "Read", done_when: "package.json and package-lock.json are read and joined." },
      { title: "Analyse", done_when: "Mismatches and misplaced dev tools are found." },
      { title: "Report", done_when: "A readable report prints with a summary count." },
    ],
    testIdeas: ["^0.0.3", "Pre-release tags like 2.0.0-beta.1", "Missing lockfile"],
    stretchGoals: ["Count total transitive dependencies", "Output JSON for CI"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-modules-packages-a1",
        prompt: "In a module, `const secret = 42;` is declared at the top but not exported. Can another file use it?",
        choices: ["Yes, top-level variables are global", "No, it is private to the module", "Only with require", "Only in the browser"],
        answerIndex: 1,
        explanation: "Each ES module has its own scope. Only exported names are visible to importers.",
        objective: 0,
      },
      {
        id: "cs-modules-packages-a2",
        prompt: "Which version satisfies ^1.4.2?",
        choices: ["1.3.9", "1.9.0", "2.0.0", "0.9.9"],
        answerIndex: 1,
        explanation: "Caret allows any 1.x.x at or above 1.4.2. 1.9.0 qualifies; the others are older or a different major.",
        objective: 1,
      },
      {
        id: "cs-modules-packages-a3",
        prompt: "Which command should CI use to install dependencies?",
        choices: ["npm install --force", "npm ci", "npm update", "npm audit fix --force"],
        answerIndex: 1,
        explanation: "npm ci installs exactly what the lockfile says and fails if it is out of sync, giving reproducible builds.",
        objective: 2,
      },
      {
        id: "cs-modules-packages-a4",
        prompt: "You need to pad a string on the left. What is the best choice?",
        choices: ["Install a padding package", "Use the built-in String.prototype.padStart", "Copy code from a forum", "Write a 200-line utility"],
        answerIndex: 1,
        explanation: "The language already provides padStart. Every dependency added is code you did not write, cannot fully control and must keep updated.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-modules-packages-q01", tags: ["semver"], difficulty: "foundation", kind: "concept",
      prompt: "Explain semantic versioning and the difference between ^ and ~.",
      expectedElements: ["MAJOR.MINOR.PATCH meaning", "^ allows minor and patch", "~ allows patch only", "0.x special case"],
      modelAnswer: "SemVer is MAJOR.MINOR.PATCH: patch for fixes, minor for backwards-compatible features, major for breaking changes. A caret range like ^1.4.2 accepts any 1.x.x at or above 1.4.2; a tilde range like ~1.4.2 accepts only 1.4.x patches. For versions below 1.0, the caret is stricter: ^0.4.2 only allows 0.4.x, because pre-1.0 minors may break.",
      explanation: "The 0.x detail is a classic follow-up.",
      commonWrongAnswers: ["^ means any newer version."],
    },
    {
      id: "cs-modules-packages-q02", tags: ["lockfile"], difficulty: "foundation", kind: "concept",
      prompt: "Why commit the lockfile?",
      expectedElements: ["reproducible installs", "exact transitive versions", "CI equals local", "integrity hashes"],
      modelAnswer: "Ranges in package.json resolve to different versions over time, including for every transitive dependency. The lockfile pins the exact version and integrity hash of every package in the tree, so my machine, CI and production all install identical code. Upgrades then happen deliberately in reviewed changes instead of silently on a random build.",
      explanation: "Reproducibility is the key word.",
      commonWrongAnswers: ["It speeds up npm install."],
    },
    {
      id: "cs-modules-packages-q03", tags: ["modules"], difficulty: "foundation", kind: "concept",
      prompt: "Named exports or default exports: which do you prefer and why?",
      expectedElements: ["named: consistent names, better refactoring/autocomplete", "default: one main thing, importer chooses name", "consistency in a codebase"],
      modelAnswer: "I lean towards named exports: the import name must match the export, so names stay consistent across the codebase, renames are easier to find, and editors autocomplete them. Default exports suit files that clearly export one main thing, and some frameworks require them, for example route files. Mostly I care that a codebase is consistent.",
      explanation: "Either answer is fine with a reason.",
      commonWrongAnswers: ["Default exports are faster."],
    },
    {
      id: "cs-modules-packages-q04", tags: ["dependencies", "security"], difficulty: "core", kind: "scenario",
      prompt: "A popular npm package your app depends on is reported to be compromised. What do you do?",
      expectedElements: ["check if you use the affected version (lockfile/npm ls)", "pin or upgrade to a safe version", "rotate secrets if malicious code ran", "check CI and dev machines", "add monitoring (audit/Dependabot)"],
      modelAnswer: "First I check whether we actually installed an affected version, using the lockfile and npm ls, across all projects and CI caches. If so, I pin to a known-good version or remove it, reinstall cleanly and redeploy. If the malicious code could have run, especially in install scripts, I treat secrets on those machines and in CI as leaked and rotate them. Afterwards I make sure audit checks and automated update tooling are in place.",
      explanation: "Rotating secrets is the step many forget.",
      commonWrongAnswers: ["Run npm audit fix and move on."],
    },
    {
      id: "cs-modules-packages-q05", tags: ["modules", "debugging"], difficulty: "core", kind: "debugging",
      prompt: "A value imported from another module is undefined at startup, but fine later. What could cause it?",
      expectedElements: ["circular import", "module not finished evaluating", "fix by extracting shared module or lazy access"],
      modelAnswer: "A circular dependency: module A imports B, and B imports A. When A starts evaluating, it loads B, and B reads A's export before A has finished running, so it sees undefined or hits a temporal dead zone error. The fix is to break the cycle by moving the shared code into a third module, or to access the value lazily inside a function that runs later.",
      explanation: "Circular imports are a real-world classic.",
      commonWrongAnswers: ["The file failed to download."],
    },
    {
      id: "cs-modules-packages-q06", tags: ["dependencies"], difficulty: "core", kind: "design",
      prompt: "How do you decide whether to add a dependency?",
      expectedElements: ["could we write it simply", "maintenance and activity", "size and transitive deps", "license", "security history"],
      modelAnswer: "I ask whether the problem is hard enough to deserve it: date maths, crypto or parsing usually are; a small helper usually is not. Then I check that the package is maintained, how many transitive dependencies and how much bundle size it adds, its license, and its security history. Every dependency is code we have to keep updated and trust, so the bar is real value.",
      explanation: "Judgement plus a checklist is what interviewers want.",
      commonWrongAnswers: ["Always use a library, never reinvent the wheel."],
    },
    {
      id: "cs-modules-packages-q07", tags: ["npm"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between dependencies and devDependencies?",
      expectedElements: ["dependencies needed at runtime", "devDependencies for build/test", "production install skips dev", "affects image size"],
      modelAnswer: "dependencies are packages the application needs while running, such as a web framework. devDependencies are only needed to build, test or lint, such as TypeScript, Vitest or ESLint. A production install with --omit=dev skips them, which keeps deploy images smaller and reduces what can go wrong in production.",
      explanation: "Simple, but tested often.",
      commonWrongAnswers: ["There is no real difference."],
    },
    {
      id: "cs-modules-packages-q08", tags: ["upgrades"], difficulty: "core", kind: "scenario",
      prompt: "How would you upgrade a core library across a major version safely?",
      expectedElements: ["read changelog/migration guide", "dedicated branch/PR", "tests and type checks", "upgrade in steps", "staged rollout"],
      modelAnswer: "I read the changelog and migration guide first, then do the upgrade alone in its own pull request, not mixed with features. I run the type checker and test suite, fix what breaks, and if the gap is several majors, I step through them one at a time. Then I deploy behind monitoring, ideally to a small slice of traffic first, with a quick rollback ready.",
      explanation: "Process and risk management, not a magic command.",
      commonWrongAnswers: ["Run npm update and deploy."],
    },
  ],
  references: [
    { title: "MDN: JavaScript modules", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules", kind: "official-docs" },
    { title: "Semantic Versioning 2.0.0", url: "https://semver.org/", kind: "spec" },
    { title: "npm docs: package-lock.json", url: "https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Encapsulation, versioning contracts and reproducible builds apply to every ecosystem (pip, Maven, Cargo)."],
  versionSpecific: ["npm command names, the package-lock format and ESM/CommonJS details are Node-specific and change over time."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
