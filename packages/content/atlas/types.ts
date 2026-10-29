// THE ATLAS: the shape of Hexhammer's whole curriculum.
//
// Picture a map:
//   Domain  = a big region on the map (e.g. "Backend Engineering"). There are 16.
//   Module  = a neighbourhood inside a region (e.g. "Middleware").
//   Topic   = one place you visit and master (e.g. "Middleware order and short-circuits").
//   Strike  = the tiny hands-on lessons that already existed before the Atlas (Level 1-6, DSA, Pro).
//             A topic LINKS to strikes for its hand-typed exercises. It never copies them.
//
// A topic can be at one of three stages, and the validator (validate.ts) checks each honestly:
//   "outline"  = title, objectives and prerequisites only. Shown on the map, marked "coming".
//   "draft"    = has real content, but at least one required part is still missing.
//   "complete" = every one of the 18 required parts is present and passes the checks.
//
// CHARTER RULE (CLAUDE.md): exercises never contain solutions. A coding exercise is a link to a
// strike (starter code + tests + 3 hints + gated reveal). Knowledge checks and interview questions
// DO have answers, but the app only shows them AFTER you have answered yourself.

export type Difficulty = "foundation" | "core" | "advanced";

export type TopicStage = "outline" | "draft" | "complete";

// What kind of picture or interactive lab explains this topic best.
// Each value matches one lab component in apps/web/src/labs/.
export type VisualizationType =
  | "none"
  | "binary" // bits and bytes, live
  | "event-loop" // call stack + task queues, stepped
  | "sorting" // a real sort, stepped
  | "http-journey" // a request travelling browser -> DNS -> server -> middleware -> DB
  | "middleware-pipeline" // build a pipeline and send a request through it
  | "cache" // a real LRU cache, hits and misses
  | "queue" // producers, a queue, consumers, retries
  | "sql-join" // two tables and the rows a join keeps
  | "decision-boundary" // real logistic regression trained by gradient descent
  | "embeddings" // cosine similarity between small vectors
  | "rag" // retrieve chunks, then answer only from them
  | "prompt-injection" // untrusted text trying to override instructions
  | "ci-pipeline" // stages that pass/fail and block a deploy
  | "contrast" // WCAG contrast ratio between two real colors
  | "log-trace" // structured logs and a trace waterfall for one request
  | "injection" // the same input glued into SQL vs sent as a parameter
  | "big-o" // operation counts growing with n
  | "references"; // names pointing at boxes in memory: sharing vs copying

// A source you can trust. `kind` says how authoritative it is.
export interface Reference {
  title: string;
  url: string; // must be https://
  kind: "spec" | "official-docs" | "book" | "article" | "course";
}

// One short chunk of the lesson. Progressive disclosure: the studio shows them one at a time.
export interface LessonSection {
  heading: string;
  body: string; // plain text. Blank lines separate paragraphs. `code` in backticks is shown as code.
}

// A worked example. This is an ILLUSTRATION to read, never the answer to an exercise.
export interface CodeExample {
  title: string;
  language: "js" | "ts" | "sql" | "bash" | "http" | "json" | "yaml" | "text" | "html" | "css";
  code: string;
  expectedOutput: string; // what you will see when it runs
  steps: string[]; // step-by-step execution, in plain words
}

export interface Mistake {
  mistake: string; // what people do
  symptom: string; // what you see when it happens
  fix: string; // how to get out of it
}

export interface Misconception {
  myth: string;
  truth: string;
}

// A multiple-choice question. Used for knowledge checks, predictions, debugging spot-the-bug,
// and the end-of-topic assessment. The answer and explanation are shown only AFTER you choose.
export interface ChoiceQuestion {
  id: string; // unique across the whole atlas, e.g. "web-http-a1"
  prompt: string;
  code?: string; // optional code to read
  choices: string[]; // 2 to 5 options
  answerIndex: number; // which choice is right (0-based)
  explanation: string; // why, including why the tempting wrong answers are wrong
  objective: number; // which learning objective (0-based index) this checks
}

// The kinds of exercise a topic can offer. Notice: none of them carries a solution.
export type Exercise =
  // Hand-typed code with tests, in the existing strike runner (the 5-beat loop).
  | { kind: "strike"; strikeId: string; why: string }
  // Read code, predict the output, then see what really happens.
  | { kind: "predict"; question: ChoiceQuestion }
  // Read buggy code and find the bug. You fix it yourself afterwards, in your own words.
  | { kind: "debug"; question: ChoiceQuestion }
  // Do something inside an interactive lab until a measurable goal is reached.
  | { kind: "lab"; lab: VisualizationType; task: string; goal: string };

// A milestone inside a project: a small, checkable step.
export interface ProjectMilestone {
  title: string;
  done_when: string; // how YOU can tell it is finished
}

// The project template a topic suggests. When you start it, the app copies it into YOUR
// project record (database), which you can edit freely.
export interface ProjectTemplate {
  title: string;
  summary: string;
  type: "exercise" | "debugging-lab" | "implementation" | "architecture" | "application";
  objectivesCovered: number[]; // which learning objectives this project proves (0-based)
  requirements: string[];
  acceptanceCriteria: string[]; // each one testable, ideally by an automated test
  technologies: string[];
  milestones: ProjectMilestone[];
  testIdeas: string[]; // tests you should write
  stretchGoals: string[];
}

export interface Assessment {
  passingScore: number; // 0..1, e.g. 0.8 = 80%
  questions: ChoiceQuestion[];
}

export type InterviewKind =
  | "concept"
  | "code-reading"
  | "debugging"
  | "scenario"
  | "design"
  | "misconception"
  | "implementation"
  | "behavioral";

// An interview question. You write your answer FIRST; then the model answer is revealed.
export interface InterviewQuestion {
  id: string; // unique across the atlas, e.g. "web-http-q03"
  tags: string[];
  difficulty: Difficulty;
  kind: InterviewKind;
  prompt: string;
  code?: string;
  expectedElements: string[]; // the points a strong answer should hit (used for self-grading)
  modelAnswer: string;
  explanation: string; // the deeper "why", for when the model answer is not enough
  commonWrongAnswers: string[];
  followUps?: string[]; // what an interviewer might ask next
}

// Transparent rules for "mastered". Every number is shown to the learner in the studio.
export interface MasteryCriteria {
  lessonRead: true; // reading is required but NEVER enough on its own
  exercisesRequired: number; // how many exercises must be completed
  assessmentScore: number; // best assessment score needed (0..1)
  projectRequired: boolean; // must a linked project be marked complete?
  reviewsRequired: number; // how many successful spaced reviews after first passing
}

export interface ReviewRules {
  intervalsDays: number[]; // e.g. [1, 3, 7, 21, 60]: next gap after each successful review
  questionsPerReview: number; // how many assessment/interview questions a review mission asks
}

// The full topic. Fields marked "complete-only" may be empty for outline topics.
export interface Topic {
  id: string; // unique, kebab-case, e.g. "web-http-lifecycle"
  domainId: string;
  moduleId: string;
  title: string;
  stage: TopicStage;
  difficulty: Difficulty;
  learningObjectives: string[]; // "You will be able to ..."
  prerequisites: string[]; // topic ids
  subtopics: string[];
  strikeIds: string[]; // existing hands-on strikes that practice this topic
  capstone?: boolean; // a "boss battle": a topic that pulls a whole domain together

  // ---- complete-only ----
  story?: string; // a short real-world problem that motivates the topic
  mentalModel?: { plain: string; analogy: string; analogyLimit: string };
  lessonSections: LessonSection[];
  visualizationType: VisualizationType;
  // When no lab or picture would genuinely help (e.g. a writing skill), say why instead of
  // inventing a decorative one. The validator accepts this as the honest answer to part 5.
  visualNote?: string;
  // The "picture book" version for complete beginners, read before the lesson (atlas/beginner.ts).
  beginner?: import("./beginner").BeginnerCard[];
  codeExamples: CodeExample[];
  practicalApplication?: string;
  commonMistakes: Mistake[];
  misconceptions: Misconception[];
  exercises: Exercise[];
  knowledgeChecks: ChoiceQuestion[]; // quick checks between sections
  project?: ProjectTemplate;
  assessment?: Assessment;
  interviewQuestions: InterviewQuestion[];
  references: Reference[];
  masteryCriteria: MasteryCriteria;
  reviewRules: ReviewRules;
  // Durable ideas vs details that change with versions. The Tech Radar only ever touches the second.
  timeless: string[];
  versionSpecific: string[];

  // ---- versioning ----
  contentVersion: number; // starts at 1. Approved radar proposals add versions in the DATABASE.
  lastReviewedAt: string; // "YYYY-MM-DD": when a human last checked this content for accuracy
  reviewStatus: "reviewed" | "needs-review" | "outdated";
}

export interface Module {
  id: string;
  domainId: string;
  title: string;
  summary: string;
  topicIds: string[];
}

export interface Domain {
  id: string;
  number: number; // 1..16, the order on the map
  title: string;
  short: string; // a 1-2 word name for the hex tile
  tagline: string; // one sentence: what this region is about
  story: string; // why it matters, in plain words
  hue: number; // 0..360, the region's color on the map
  // Where the hex sits on the map: a column and a row. Odd rows are pushed right by half a hex,
  // which is what makes hexagons fit together like a honeycomb (see apps/web/src/map/hexGeometry.ts).
  col: number;
  row: number;
  unlockedBy: string[]; // domain ids that unlock this region (any one of them is enough)
  modules: Module[];
}

export interface GlossaryTerm {
  id: string; // kebab-case
  term: string;
  aka?: string[]; // other names and the expansion of an acronym
  simple: string; // plain-English definition
  whyItMatters: string;
  example: string; // a concrete, practical example
  whereInApp: string; // where you meet it in a real application
  related: string[]; // other glossary ids
  meetingLine: string; // one sentence you could say in a meeting
  topicIds: string[]; // topics that teach it
  category: "acronym" | "architecture" | "workplace" | "ai" | "web" | "data" | "ops" | "security" | "language";
}
