// Topic: CI/CD pipelines. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const opsCiCd: Topic = {
  id: "ops-ci-cd",
  domainId: "",
  moduleId: "",
  title: "CI/CD pipelines: from commit to production, safely",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain continuous integration, continuous delivery and continuous deployment and how they differ.",
    "Read and design a pipeline with triggers, jobs, steps, caching and artifacts.",
    "Order pipeline stages for fast feedback and use them as quality gates that block bad changes.",
    "Handle secrets in CI safely and explain why a pipeline is part of your supply chain.",
  ],
  prerequisites: ["cs-git", "test-pyramid-strategy"],
  subtopics: ["CI vs CD vs continuous deployment", "Triggers", "Jobs and steps", "Caching dependencies", "Artifacts", "Quality gates", "Secrets", "Build once, deploy many"],
  strikeIds: ["l3-s06", "l3-s21"],

  story:
    "Friday, 5 pm: someone merges a change that passed on their laptop. The deploy script is run by hand from another laptop with a different Node version, the build differs, and production breaks. Nobody can say exactly what was deployed. A pipeline turns 'it works on my machine' into 'it works on a clean machine, the same way, every time'.",
  mentalModel: {
    plain:
      "CI/CD is an automated assembly line. Every change goes through the same steps on a clean machine: install, check, test, build, and only if all of those pass is it allowed to move closer to production. Each stage is a gate.",
    analogy:
      "An airport's sequence of checks before a plane may take off: fuel, maintenance sign-off, safety checklist, tower clearance. Any failed check stops the departure, and every check is logged.",
    analogyLimit:
      "Planes are checked once per flight. Pipelines run on every single change, dozens of times a day, so speed matters as much as thoroughness: a 2-hour pipeline is a pipeline people learn to bypass.",
  },
  lessonSections: [
    {
      heading: "1. Three terms people mix up",
      body:
        "Continuous integration (CI): every change is merged often and automatically built and tested.\nContinuous delivery: every change that passes is ready to release, and releasing is one button.\nContinuous deployment: every change that passes is released automatically, with no button.",
    },
    {
      heading: "2. The shape of a pipeline",
      body:
        "A trigger (push, pull request, schedule, manual) starts a workflow. A workflow has jobs (which can run in parallel on separate machines), and each job has steps (commands). Jobs can depend on other jobs (`needs:`), forming stages.",
    },
    {
      heading: "3. Fast feedback first",
      body:
        "Order stages from cheapest to most expensive: lint and type-check (seconds), unit tests, then build, then integration tests, then E2E. A typo should fail in 30 seconds, not after a 15-minute E2E run. Cache dependencies (e.g. the npm cache keyed by the lockfile hash) to save minutes on every run.",
    },
    {
      heading: "4. Gates, artifacts and 'build once'",
      body:
        "A gate is a stage that must pass before the next one runs; branch protection makes the PR checks mandatory before merging. Build the deployable artifact (a bundle or a container image) ONCE, store it, and promote that same artifact through staging and production. Rebuilding per environment means you test one thing and ship another.",
    },
    {
      heading: "5. Secrets and the supply chain",
      body:
        "Secrets (deploy keys, tokens) belong in the CI system's encrypted secret store, never in the repository. Give each workflow the least permission it needs. Be careful with workflows triggered by pull requests from forks, which must not receive secrets. Pin third-party actions to a full commit SHA, because a pipeline runs other people's code with access to your secrets.",
    },
    {
      heading: "6. After deploy",
      body:
        "A pipeline does not end at deploy. Run a smoke test against the new version, watch error rates, and have an automated or one-click rollback. Progressive strategies (canary, blue-green) limit how many users see a bad release.",
    },
  ],
  visualizationType: "ci-pipeline",
  codeExamples: [
    {
      title: "A GitHub Actions workflow with fast feedback and a gate",
      language: "yaml",
      code: `name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read            # least privilege for the default token

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm        # reuse downloads, keyed by package-lock.json
      - run: npm ci         # exact versions from the lockfile
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  build:
    needs: checks           # gate: only runs if checks passed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: web-dist, path: apps/web/dist }`,
      expectedOutput: "On a pull request: the 'checks' job runs lint, typecheck and tests. If any step fails, 'build' is skipped and the PR shows a red check. If all pass, 'build' produces the web-dist artifact that later deploy jobs can download.",
      steps: [
        "`on:` lists the triggers: every pull request, and pushes to main.",
        "`permissions: contents: read` limits what the workflow's token can do.",
        "`npm ci` installs exact lockfile versions on a clean machine: reproducible.",
        "Cheap checks run first, so most mistakes fail within a minute.",
        "`needs: checks` makes build a gate behind the checks.",
        "The build output is uploaded once as an artifact, so deploy jobs ship exactly what was tested. (Pinning actions to a full commit SHA instead of @v4 is stricter; see the supply-chain section.)",
      ],
    },
  ],
  practicalApplication:
    "For any repository you own: make 'checks' required on the main branch, ensure `npm ci` (not `npm install`) is used in CI, run the fastest checks first, add dependency caching, and keep secrets in the CI secret store. Time the pipeline and treat 'longer than 10 minutes for feedback' as a bug to fix.",
  commonMistakes: [
    { mistake: "Using `npm install` in CI.", symptom: "CI quietly uses different dependency versions than the lockfile; builds drift.", fix: "Use `npm ci`, which installs exactly the lockfile and fails if it is out of date." },
    { mistake: "Rebuilding the app separately for staging and production.", symptom: "Production behaves differently from what was tested.", fix: "Build once, store the artifact, and promote the same artifact." },
    { mistake: "Printing environment variables while debugging CI.", symptom: "Secrets end up in logs that many people can read.", fix: "Never echo secrets; rely on the platform's masking but do not depend on it." },
  ],
  misconceptions: [
    { myth: "CI means having a build server.", truth: "CI is a practice: integrating small changes frequently. A server running tests on a long-lived branch merged monthly is not CI." },
    { myth: "Continuous deployment is reckless.", truth: "With strong tests, small changes, monitoring and fast rollback, frequent small deploys are usually safer than rare big ones." },
    { myth: "A green pipeline means the change is correct.", truth: "It means the change passed the checks you wrote. Gaps in tests are gaps in the gate." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s06", why: "Practise the pull-request workflow that CI checks plug into." },
    { kind: "strike", strikeId: "l3-s21", why: "Set up the linting and formatting checks a pipeline runs first." },
    { kind: "lab", lab: "ci-pipeline", task: "Build a pipeline from stages in the CI lab and push changes containing different bugs through it.", goal: "Block every injected bug before deploy, with an average time-to-first-failure under 5 simulated minutes." },
    {
      kind: "predict",
      question: {
        id: "ops-ci-cd-p1",
        prompt: "In the example workflow, a unit test fails on a pull request. What happens to the build job?",
        choices: ["It runs anyway", "It is skipped because it needs checks", "It runs first", "It deploys to production"],
        answerIndex: 1,
        explanation: "`needs: checks` means build only runs after checks succeeds. A failure there skips build.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "ops-ci-cd-k1", prompt: "Continuous delivery vs continuous deployment: what is the difference?", choices: ["None", "Delivery keeps every change releasable with a manual release step; deployment releases automatically", "Delivery is for mobile apps only", "Deployment skips tests"], answerIndex: 1, explanation: "The difference is whether a human presses the release button.", objective: 0 },
    { id: "ops-ci-cd-k2", prompt: "Why run lint before E2E tests?", choices: ["Lint is more important", "Cheap checks first give fast feedback and avoid wasting time on slow stages", "E2E needs lint output", "Alphabetical order"], answerIndex: 1, explanation: "Fail fast on the cheapest checks.", objective: 2 },
  ],
  project: {
    title: "Containerised app with a full CI pipeline",
    summary: "Take one of your projects, containerise it, and build a pipeline that lints, tests, builds an image once, scans it, and deploys it to a local or free-tier target with a smoke test and rollback.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A multi-stage Dockerfile producing a small production image.",
      "A workflow: lint → typecheck → unit tests → build image → integration tests against the image → push to a registry (GitHub Container Registry's free tier or a local registry).",
      "Dependency caching and a pipeline under 10 minutes.",
      "Branch protection requiring the checks on main.",
      "A documented rollback procedure (redeploy the previous image tag).",
    ],
    acceptanceCriteria: [
      "A PR with a failing unit test cannot be merged.",
      "The deployed image tag equals the commit SHA of the tested commit.",
      "No secret appears in the repository or in workflow logs (checked with a secret scanner).",
      "Third-party actions are pinned to full commit SHAs.",
    ],
    technologies: ["GitHub Actions", "Docker", "Node.js", "Vitest"],
    milestones: [
      { title: "Checks", done_when: "Lint, typecheck and tests run on every PR." },
      { title: "Image", done_when: "The image is built once and tagged with the SHA." },
      { title: "Gates", done_when: "Branch protection and integration tests against the image are on." },
      { title: "Release", done_when: "Deploy, smoke test and rollback are documented and rehearsed." },
    ],
    testIdeas: ["Break the lockfile and see npm ci fail", "Introduce a lint error", "Simulate a failing smoke test"],
    stretchGoals: ["Add a container vulnerability scan that fails on critical findings."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "ops-ci-cd-a1", prompt: "Which best describes continuous integration?", choices: ["Deploying every hour", "Merging small changes frequently, each automatically built and tested", "Using one big release branch", "Running tests manually before release"], answerIndex: 1, explanation: "CI is the practice of frequent integration with automated verification.", objective: 0 },
      { id: "ops-ci-cd-a2", prompt: "In GitHub Actions, what runs on separate machines and can run in parallel?", choices: ["Steps", "Jobs", "Triggers", "Artifacts"], answerIndex: 1, explanation: "Jobs run on separate runners; steps run sequentially within a job.", objective: 1 },
      { id: "ops-ci-cd-a3", prompt: "Why build an artifact once and promote it?", choices: ["It saves disk space", "So the exact thing that was tested is what reaches production", "Registries require it", "It makes builds faster only"], answerIndex: 1, explanation: "Rebuilding per environment can introduce differences you never tested.", objective: 2 },
      { id: "ops-ci-cd-a4", prompt: "Where should a deploy token live?", choices: ["In .env committed to git", "In the CI platform's encrypted secret store with least privilege", "In the README", "Hard-coded in the workflow file"], answerIndex: 1, explanation: "Secrets stay out of the repository and are scoped minimally.", objective: 3 },
      { id: "ops-ci-cd-a5", prompt: "Why pin third-party CI actions to a full commit SHA?", choices: ["Faster downloads", "A moving tag could be changed to malicious code that runs with your secrets", "GitHub requires it", "It enables caching"], answerIndex: 1, explanation: "Tags can be moved; a SHA identifies exact code. This is a supply-chain control.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "ops-ci-cd-q01", tags: ["ci-cd", "devops"], difficulty: "foundation", kind: "concept", prompt: "Explain CI, continuous delivery and continuous deployment.", expectedElements: ["CI: frequent merges with automated build/test", "delivery: always releasable, manual release", "deployment: automatic release"], modelAnswer: "Continuous integration is merging small changes often, each verified by an automated build and tests. Continuous delivery extends that so every passing change is releasable, and release is a manual decision. Continuous deployment removes the manual step, so every passing change goes to production automatically.", explanation: "Crisp distinction is all that is needed.", commonWrongAnswers: ["They are synonyms."] },
    { id: "ops-ci-cd-q02", tags: ["ci-cd", "design"], difficulty: "core", kind: "design", prompt: "Design a CI/CD pipeline for a Node web service.", expectedElements: ["triggers PR/main", "lint/typecheck/unit first", "build artifact once", "integration/E2E", "security scans", "deploy to staging", "smoke test", "promote to prod", "rollback"], modelAnswer: "On pull requests: install with npm ci and a cache, then lint, typecheck and unit tests in parallel, then build the container image once, tagged with the commit SHA, then integration tests against that image plus dependency and image scans. Required checks gate the merge. On main: push the image, deploy to staging, run smoke and E2E tests, then promote the same image to production with a canary or rolling deploy, watch error rates, and roll back automatically if they spike.", explanation: "Stage ordering and 'same artifact' are key.", commonWrongAnswers: ["Run all tests, then deploy."] },
    { id: "ops-ci-cd-q03", tags: ["ci-cd", "security"], difficulty: "core", kind: "concept", prompt: "How do you handle secrets in CI?", expectedElements: ["platform secret store", "least privilege/short-lived (OIDC)", "no secrets for fork PRs", "never echo", "rotate"], modelAnswer: "Store them in the CI platform's encrypted secret store, scope them to the jobs and environments that need them, and prefer short-lived credentials, for example OIDC federation to a cloud provider instead of long-lived keys. Never pass secrets to workflows triggered by untrusted fork PRs, never print them, and rotate them when people leave or a leak is suspected.", explanation: "OIDC mention is a strong signal.", commonWrongAnswers: ["Base64-encode them in the repo."] },
    { id: "ops-ci-cd-q04", tags: ["ci-cd", "performance"], difficulty: "core", kind: "scenario", prompt: "The pipeline takes 40 minutes. How do you speed it up?", expectedElements: ["measure stages", "cache dependencies", "parallelise jobs/shard tests", "fail fast order", "move tests down pyramid", "only affected tests on PR"], modelAnswer: "Measure where the time goes first. Then cache dependencies and build outputs, run independent jobs in parallel, shard slow test suites across runners, put fast checks first so failures surface early, push E2E checks down to cheaper levels, and run only the affected tests on PRs, with the full suite on main.", explanation: "Measure, then targeted fixes.", commonWrongAnswers: ["Skip tests on PRs."] },
    { id: "ops-ci-cd-q05", tags: ["ci-cd", "debugging"], difficulty: "foundation", kind: "debugging", prompt: "Tests pass locally but fail in CI. What do you check?", expectedElements: ["environment differences (Node version, OS, TZ, env vars)", "lockfile vs installed deps", "test order/parallelism", "missing services", "file path case sensitivity"], modelAnswer: "Differences between the environments: the Node version, OS (case-sensitive paths on Linux), time zone and locale, environment variables, dependencies (`npm ci` uses the lockfile exactly), test parallelism and order, and services the tests expect, like a database. Reproduce it locally with the same container image as CI if possible.", explanation: "Systematic environment diffing.", commonWrongAnswers: ["CI is flaky; re-run it."] },
    { id: "ops-ci-cd-q06", tags: ["ci-cd", "supply-chain"], difficulty: "advanced", kind: "concept", prompt: "Why is a CI pipeline a supply-chain security risk, and how do you reduce it?", expectedElements: ["runs third-party code with secrets", "pin actions by SHA", "least privilege tokens", "protect workflow files", "provenance/signing"], modelAnswer: "A pipeline runs third-party actions, scripts and dependencies with access to secrets and the ability to publish artifacts, so a compromised dependency or a moved action tag can steal secrets or ship malicious builds. Reduce the risk by pinning actions to commit SHAs, keeping default token permissions minimal, reviewing changes to workflow files, isolating untrusted PRs, and generating signed build provenance for artifacts.", explanation: "Real incidents have exploited exactly this.", commonWrongAnswers: ["CI runs in the cloud, so it's secure."] },
    { id: "ops-ci-cd-q07", tags: ["ci-cd", "deploy"], difficulty: "core", kind: "concept", prompt: "Why 'build once, deploy many'?", expectedElements: ["same artifact tested and shipped", "avoid build drift", "faster deploys", "config injected per environment"], modelAnswer: "Building once and promoting the same artifact guarantees that what you tested is what you ship, and avoids drift from rebuilding with different dependency or tool versions. Environment differences are supplied as configuration at deploy time, not baked in at build time.", explanation: "Pairs with 12-factor config.", commonWrongAnswers: ["It saves storage."] },
    { id: "ops-ci-cd-q08", tags: ["ci-cd", "behavioral"], difficulty: "foundation", kind: "behavioral", prompt: "Tell me about a time a pipeline or release process failed. What did you improve?", expectedElements: ["STAR", "impact", "root cause in process not person", "automation/guardrail added", "measured result"], modelAnswer: "Use STAR and keep it blameless: what broke and the impact, what you found the process allowed (for example, manual deploys, or an untested config change), the guardrail you added, such as a required check, build-once promotion or automated rollback, and how you measured the improvement, like fewer failed deploys or a faster recovery.", explanation: "Focus on systems, not people.", commonWrongAnswers: ["Someone else broke it."] },
  ],
  references: [
    { title: "GitHub Docs: Understanding GitHub Actions", url: "https://docs.github.com/en/actions/about-github-actions/understanding-github-actions", kind: "official-docs" },
    { title: "GitHub Docs: Security hardening for GitHub Actions", url: "https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions", kind: "official-docs" },
    { title: "npm Docs: npm ci", url: "https://docs.npmjs.com/cli/v10/commands/npm-ci", kind: "official-docs" },
    { title: "Martin Fowler: Continuous Integration", url: "https://martinfowler.com/articles/continuousIntegration.html", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Automated gates, fast feedback ordering, build once/promote, least-privilege secrets."],
  versionSpecific: ["GitHub Actions syntax and action major versions (checkout@v4, setup-node@v4).", "Node.js LTS version numbers used in CI."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
