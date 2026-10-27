// Topic: Design tokens, themes and semantic colors. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const dsDesignTokens: Topic = {
  id: "ds-design-tokens",
  domainId: "",
  moduleId: "",
  title: "Design tokens, themes and semantic color",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain the three layers of tokens (primitive, semantic, component) and why components should use semantic tokens.",
    "Build a light and dark theme by remapping semantic tokens instead of rewriting components.",
    "Check color pairs against WCAG contrast minimums (4.5:1 for body text, 3:1 for large text and UI parts).",
    "Name, version and deprecate tokens so a design system can change without breaking products.",
  ],
  prerequisites: ["web-css-layout"],
  subtopics: ["Primitive tokens", "Semantic tokens", "Component tokens", "Theming with CSS custom properties", "Contrast ratios", "Token naming", "Deprecation"],
  strikeIds: ["l4-s06", "l4-s17"],

  story:
    "Brand changes its primary blue. In one codebase, that is a one-line change. In another, it is 1,400 hard-coded hex values across 300 files, half of which are 'almost the same blue', and dark mode breaks in 40 places. The difference is design tokens.",
  mentalModel: {
    plain:
      "A design token is a named decision, such as 'the color for danger text' or 'the medium spacing step'. Components ask for the decision by name; they never contain the raw value. Change the decision once and every component follows.",
    analogy:
      "Tokens are like contacts in your phone. You call 'Mum', not a number. If Mum changes her number you update one contact, and every shortcut that says 'call Mum' still works. Semantic tokens are like 'Emergency contact', a role that can point to a different person in a different situation (theme).",
    analogyLimit:
      "A phone contact holds one number. Tokens often hold composite values (a full typography style, a shadow stack), and their values can depend on context such as theme, density or platform, which makes naming and tooling more involved than a contact list.",
  },
  lessonSections: [
    {
      heading: "1. Primitive tokens: the raw palette",
      body:
        "Primitive (or 'global') tokens name raw values: `--blue-500: #2f6fed`, `--space-4: 16px`. They describe WHAT a value is, not where it is used. Components should almost never reference them directly.",
    },
    {
      heading: "2. Semantic tokens: the decisions",
      body:
        "Semantic tokens name a ROLE: `--color-text-danger`, `--color-surface-raised`, `--space-stack-md`. They point at primitives: `--color-text-danger: var(--red-700)`. Components use these. Now 'what is danger text?' is answered in one place.",
    },
    {
      heading: "3. Component tokens: local knobs",
      body:
        "For larger systems, components expose their own tokens: `--button-bg: var(--color-action-primary)`. This lets one component be tuned without changing the global meaning of the semantic token. Use them sparingly; too many layers become hard to trace.",
    },
    {
      heading: "4. Themes are just a different mapping",
      body:
        "Dark mode should not need `if (dark)` in components. Instead, the theme re-points semantic tokens: under `[data-theme=\"dark\"]`, `--color-surface` maps to a dark primitive. Every component re-themes for free. This app does exactly this in `packages/design-system/src/tokens.css`.",
    },
    {
      heading: "5. Contrast is a token property, not a page property",
      body:
        "WCAG 2.x contrast ratio compares the relative luminance of two colors: (lighter + 0.05) / (darker + 0.05). Level AA requires at least 4.5:1 for normal text and 3:1 for large text and for UI components such as input borders and focus rings. Because tokens come in pairs (text on surface), you can check every pair once, automatically, instead of auditing every page.",
    },
    {
      heading: "6. Change without breaking people",
      body:
        "Treat tokens as a public API. Name by role, not by value (`--color-danger`, not `--red`). Version the token package with semantic versioning. To remove a token, first mark it deprecated, alias it to its replacement, warn in tooling, and remove it in the next major version.",
    },
  ],
  visualizationType: "contrast",
  codeExamples: [
    {
      title: "Generating CSS custom properties from a token object",
      language: "js",
      code: `const tokens = {
  color: { brand: "#ffb547", text: { default: "#eef1f7" } },
  space: { 1: "4px", 2: "8px" },
};

function toCssVars(obj, prefix = "--hh") {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object"
      ? toCssVars(value, \`\${prefix}-\${key}\`)
      : [\`\${prefix}-\${key}: \${value};\`],
  );
}

console.log(toCssVars(tokens).join("\\n"));`,
      expectedOutput: `--hh-color-brand: #ffb547;
--hh-color-text-default: #eef1f7;
--hh-space-1: 4px;
--hh-space-2: 8px;`,
      steps: [
        "The tokens are plain nested data: the single source of truth, which tools can also export to iOS, Android or Figma.",
        "toCssVars walks each key. Nested objects recurse with a longer prefix (color → text → default).",
        "Leaf values become CSS custom property declarations.",
        "Joined with newlines, this is the body of a :root { } block a build step can write to a CSS file.",
      ],
    },
    {
      title: "Semantic tokens remapped per theme",
      language: "css",
      code: `:root {
  --gray-50: #f6f4ef;  --gray-900: #0d0f14;   /* primitives */
  --color-surface: var(--gray-50);             /* semantic */
  --color-text: var(--gray-900);
}
[data-theme="dark"] {
  --color-surface: var(--gray-900);
  --color-text: var(--gray-50);
}
.card { background: var(--color-surface); color: var(--color-text); }`,
      expectedOutput: "The .card is light with dark text by default, and dark with light text inside any element with data-theme=\"dark\", without .card changing.",
      steps: [
        "Primitives name raw colors once.",
        "Semantic tokens point at primitives by role.",
        "The dark theme only re-points the semantic tokens.",
        "The component reads roles, so it themes itself automatically.",
      ],
    },
  ],
  practicalApplication:
    "When reviewing UI code, search for raw hex values and pixel sizes in component files. Each one is a decision hiding outside the system. Replace it with an existing semantic token, or propose a new one if it represents a genuinely new role. Add an automated test that checks every text/surface token pair meets 4.5:1 in every theme.",
  commonMistakes: [
    { mistake: "Naming tokens after their value (`--blue`, `--padding-16`).", symptom: "The token named --blue becomes purple after a rebrand, and nobody trusts names anymore.", fix: "Name by role: --color-action-primary, --space-inset-md." },
    { mistake: "Components using primitive tokens directly.", symptom: "Dark mode needs per-component overrides.", fix: "Components consume semantic tokens only; themes remap semantic → primitive." },
    { mistake: "Checking contrast by eye.", symptom: "Muted grey text fails WCAG on one theme and nobody notices.", fix: "Compute contrast for every token pair in a test." },
  ],
  misconceptions: [
    { myth: "Design tokens are just CSS variables.", truth: "Tokens are platform-neutral design decisions. CSS custom properties are one output format; the same tokens can generate Swift, Kotlin or JSON." },
    { myth: "Dark mode means inverting colors.", truth: "Dark themes need their own tuned values: inverted colors often fail contrast, and saturated colors glow on dark backgrounds." },
    { myth: "More token layers are always better.", truth: "Each layer adds indirection. Add component tokens only when you need per-component tuning." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l4-s06", why: "Use CSS custom properties by hand in a real, rendered page." },
    { kind: "strike", strikeId: "l4-s17", why: "Build a small component on top of design tokens and patterns." },
    { kind: "lab", lab: "contrast", task: "Pick a text color and a surface color in the contrast lab.", goal: "Find a grey text colour that only just passes on the dark surface (between 4.5:1 and 5:1), then compare the same grey on the light surface." },
    {
      kind: "debug",
      question: {
        id: "ds-design-tokens-d1",
        prompt: "After adding dark mode, this button has unreadable text in dark theme only. Which line is the root cause?",
        code: `:root { --gray-900: #111; --white: #fff; --color-action-text: var(--white); }
[data-theme="dark"] { --color-action-bg: #f5f5f5; }  /* line 2 */
.button {
  background: var(--color-action-bg, #2f6fed);        /* line 4 */
  color: var(--white);                                /* line 5 */
}`,
        choices: ["Line 2", "Line 4", "Line 5"],
        answerIndex: 2,
        explanation: "The button text uses the primitive --white directly instead of the semantic --color-action-text, so when the theme lightens the background the text cannot follow. Line 2 is a reasonable theme change; the component just is not listening to the semantic token. (Defining --color-action-text for the dark theme then completes the fix.)",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    { id: "ds-design-tokens-k1", prompt: "Which name is a semantic token?", choices: ["--blue-500", "--color-text-danger", "--16px", "--hex-ff0000"], answerIndex: 1, explanation: "It names a role (danger text), not a value.", objective: 0 },
    { id: "ds-design-tokens-k2", prompt: "What minimum contrast does WCAG AA require for normal body text?", choices: ["2:1", "3:1", "4.5:1", "7:1"], answerIndex: 2, explanation: "4.5:1 for normal text at AA. 3:1 for large text and UI components. 7:1 is the AAA level for normal text.", objective: 2 },
  ],
  project: {
    title: "Mini design system with a token pipeline",
    summary: "Create a token source file, generate light and dark CSS from it, build three components that use only semantic tokens, and add automated contrast tests.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A tokens.json with primitive and semantic layers.",
      "A build script that outputs CSS custom properties for :root and [data-theme=dark].",
      "Button, Card and Input components that reference only semantic tokens.",
      "A documentation page showing every token, its value in each theme and where it is used.",
      "A CHANGELOG entry that deprecates one token with an alias to its replacement.",
    ],
    acceptanceCriteria: [
      "A test fails if any component CSS contains a raw hex color.",
      "A test computes contrast for every text-on-surface pair in both themes and fails below 4.5:1.",
      "Switching data-theme changes every component's colors with zero component code changes.",
      "The deprecated token still works and logs or documents its replacement.",
    ],
    technologies: ["CSS custom properties", "Node.js script", "TypeScript", "Vitest"],
    milestones: [
      { title: "Token source", done_when: "tokens.json has both layers and validates." },
      { title: "Pipeline", done_when: "npm run tokens writes the CSS file." },
      { title: "Components", done_when: "Three components render in both themes." },
      { title: "Guards", done_when: "Raw-color and contrast tests run in CI." },
    ],
    testIdeas: ["Contrast math matches known pairs (#000 on #fff = 21:1)", "Token names follow the naming rule", "No circular token references"],
    stretchGoals: ["Export the same tokens to a JSON format a design tool can import."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "ds-design-tokens-a1", prompt: "Why should components use semantic tokens instead of primitives?", choices: ["Semantic tokens are faster in CSS", "So themes and rebrands change one mapping instead of every component", "Primitives are deprecated in CSS", "Browsers require it"], answerIndex: 1, explanation: "Semantic tokens decouple components from raw values: change the mapping, not the components.", objective: 0 },
      { id: "ds-design-tokens-a2", prompt: "Best way to add a dark theme to a token-based system?", choices: ["Add `.dark` variants to every component", "Remap semantic tokens under a theme selector", "Use filter: invert(1)", "Duplicate the stylesheet"], answerIndex: 1, explanation: "A theme is a different semantic → primitive mapping.", objective: 1 },
      { id: "ds-design-tokens-a3", prompt: "A focus ring color has 2.4:1 contrast against its background. Under WCAG 2.x AA, is that OK for a UI component?", choices: ["Yes, UI parts need 2:1", "No, UI components need at least 3:1", "Yes, focus rings are exempt", "No, everything needs 7:1"], answerIndex: 1, explanation: "Non-text contrast (WCAG 1.4.11) requires 3:1 for UI components and graphical objects.", objective: 2 },
      { id: "ds-design-tokens-a4", prompt: "What is the contrast ratio of black text on a white background?", choices: ["1:1", "4.5:1", "10:1", "21:1"], answerIndex: 3, explanation: "(1.0 + 0.05) / (0 + 0.05) = 21: the maximum possible.", objective: 2 },
      { id: "ds-design-tokens-a5", prompt: "You must rename --color-warn to --color-text-warning. The safest release plan?", choices: ["Rename it in a patch release", "Add the new token, alias the old one to it and mark it deprecated, remove it in the next major version", "Delete the old token and announce it on chat", "Keep both forever with different values"], answerIndex: 1, explanation: "Treat tokens as a public API: deprecate with an alias, then remove in a major (breaking) release.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "ds-design-tokens-q01", tags: ["design-systems", "tokens"], difficulty: "foundation", kind: "concept", prompt: "What are design tokens and why do teams use them?", expectedElements: ["named design decisions", "single source of truth", "consistency", "theming", "multi-platform output"], modelAnswer: "Design tokens are named design decisions, such as colors, spacing, typography and radii, stored in one platform-neutral source. Components refer to them by name, so the system stays consistent, themes and rebrands become mapping changes, and the same decisions can generate CSS, iOS and Android values.", explanation: "Emphasise 'decision' and 'single source of truth'.", commonWrongAnswers: ["They are CSS variables."] },
    { id: "ds-design-tokens-q02", tags: ["tokens", "architecture"], difficulty: "core", kind: "design", prompt: "Explain primitive, semantic and component tokens, and when you would add the third layer.", expectedElements: ["primitive = raw values", "semantic = roles", "component = per-component knobs", "add component layer when components need independent tuning"], modelAnswer: "Primitive tokens hold raw values like blue-500. Semantic tokens name roles like color-action-primary and point at primitives. Component tokens such as button-bg point at semantic tokens and let one component be tuned without changing the role's meaning everywhere. I would add the component layer only when products need per-component theming or white-labelling, because each layer adds indirection.", explanation: "Good answers mention the cost of layers.", commonWrongAnswers: ["Always use three layers."] },
    { id: "ds-design-tokens-q03", tags: ["accessibility", "contrast"], difficulty: "core", kind: "concept", prompt: "How do you guarantee accessible contrast across themes in a design system?", expectedElements: ["define token pairs", "compute WCAG ratios automatically", "4.5:1 text / 3:1 large text and UI", "test in CI per theme"], modelAnswer: "I define which tokens are used together, such as text on surface or border on surface, and compute their WCAG contrast ratios automatically in a test for every theme: 4.5:1 for body text, 3:1 for large text and UI components. A failing pair blocks the change. That catches problems at the token level instead of page by page.", explanation: "Automating the check is the key insight.", commonWrongAnswers: ["Designers check it in Figma."] },
    { id: "ds-design-tokens-q04", tags: ["tokens", "governance"], difficulty: "advanced", kind: "scenario", prompt: "Ten product teams consume your token package. You need to change a token's meaning. How do you roll it out?", expectedElements: ["semver", "deprecate + alias", "changelog and migration guide", "codemod or lint rule", "measure adoption"], modelAnswer: "I treat it as an API change. I add the new token, alias the old one to it with a deprecation notice, and ship that in a minor version. I publish a migration guide, plus a lint rule or codemod that finds old usages, and track adoption across teams. Once usage drops to zero, or at a planned date, I remove the old token in a major version.", explanation: "Shows platform thinking.", commonWrongAnswers: ["Change it and tell everyone."] },
    { id: "ds-design-tokens-q05", tags: ["css", "theming"], difficulty: "core", kind: "implementation", prompt: "How would you implement a user-selectable theme that also respects the OS preference?", expectedElements: ["prefers-color-scheme media query", "data-theme attribute override", "persist choice", "avoid flash"], modelAnswer: "Define semantic tokens in :root, remap them for dark mode inside `@media (prefers-color-scheme: dark)` scoped to `:root:not([data-theme=light])`, and again under `[data-theme=dark]`. A toggle sets data-theme on <html> and saves the choice. A tiny inline script applies the saved choice before first paint to avoid a flash of the wrong theme.", explanation: "This app uses the same pattern.", commonWrongAnswers: ["Load a separate dark stylesheet on click."] },
    { id: "ds-design-tokens-q06", tags: ["misconception"], difficulty: "foundation", kind: "misconception", prompt: "'Dark mode is just inverting the light colors.' Agree or disagree?", expectedElements: ["disagree", "contrast changes", "saturated colors vibrate on dark", "elevation shown differently"], modelAnswer: "Disagree. Inverted palettes often break contrast and make saturated colors glow on dark surfaces. Elevation also works differently: in the dark, raised surfaces are usually lighter rather than relying on shadows. Dark themes need their own tuned semantic mappings.", explanation: "Practical design-engineering knowledge.", commonWrongAnswers: ["Agree."] },
    { id: "ds-design-tokens-q07", tags: ["code-review"], difficulty: "foundation", kind: "debugging", prompt: "In a pull request you see `color: #6b7280` in a component. What do you say?", expectedElements: ["raw value bypasses the system", "find the matching semantic token", "or propose a new token", "check contrast"], modelAnswer: "I would ask whether this grey is an existing role, like muted text, and suggest the semantic token instead, so it themes and stays consistent. If it is a genuinely new role, we should add a token deliberately and check its contrast in both themes. Raw values are how drift starts.", explanation: "Kind, specific review feedback.", commonWrongAnswers: ["Approve; it is just a color."] },
    { id: "ds-design-tokens-q08", tags: ["tokens", "multi-platform"], difficulty: "advanced", kind: "design", prompt: "How would you share tokens between web, iOS and Android?", expectedElements: ["platform-neutral source (JSON)", "build step transforms per platform", "naming conventions per platform", "versioned package"], modelAnswer: "Keep tokens in a platform-neutral source format such as JSON, and use a build step (for example Style Dictionary or a custom script) to transform them into CSS custom properties, Swift constants and Android resources, adapting names and units per platform. Publish each output as a versioned package so every app can upgrade deliberately.", explanation: "Mention a transformation step and versioning.", commonWrongAnswers: ["Copy the CSS values into each app."] },
  ],
  references: [
    { title: "W3C Design Tokens Community Group: Format specification", url: "https://www.designtokens.org/tr/drafts/format/", kind: "spec" },
    { title: "WCAG 2.2: Contrast (Minimum), Success Criterion 1.4.3", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html", kind: "spec" },
    { title: "WCAG 2.2: Non-text Contrast, Success Criterion 1.4.11", url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html", kind: "spec" },
    { title: "MDN: Using CSS custom properties", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Separating decisions (roles) from values, and checking contrast as a property of color pairs."],
  versionSpecific: ["The W3C design token format is still a community draft and may change.", "WCAG 3 is in development and proposes a different contrast method."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
