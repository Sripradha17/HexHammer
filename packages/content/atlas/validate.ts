// THE CURRICULUM AUDIT. Checks the whole Atlas and reports what is complete, what is not, and why.
//
// Two kinds of finding:
//   error   = something is broken or dishonest (a "complete" topic missing a part, a link to a
//             topic that does not exist, a prerequisite loop). Errors fail `npm run curriculum:check`.
//   warning = allowed, but worth fixing (an interview bank below the 15-question target).
//
// Run it: npm run curriculum:check   (writes docs/curriculum/coverage-report.md)
import type { ChoiceQuestion, Domain, GlossaryTerm, Topic } from "./types";

export interface Finding {
  level: "error" | "warning";
  where: string; // a topic id, domain id, glossary id or "atlas"
  message: string;
}

// The 18 parts every complete topic must have (Part 7 of the brief), as named checks.
// Each check returns null when fine, or a short sentence saying what is missing.
type PartCheck = { part: string; check: (t: Topic) => string | null };

const MIN_SECTION_CHARS = 80; // a section shorter than this is not "substantive"
export const INTERVIEW_MINIMUM = 8; // fewer than this and a topic cannot be "complete"
export const INTERVIEW_TARGET = 15; // the bank's goal per topic; below it is a warning

const PLACEHOLDER = /\b(TODO|TBD|lorem ipsum|placeholder|coming soon)\b/i;

export const TOPIC_PARTS: PartCheck[] = [
  { part: "1. Story", check: (t) => ((t.story ?? "").length >= 60 ? null : "story is missing or too short") },
  { part: "2. Learning objectives", check: (t) => (t.learningObjectives.length >= 2 ? null : "needs at least 2 objectives") },
  { part: "3. Prerequisites", check: (t) => (Array.isArray(t.prerequisites) ? null : "prerequisites list missing") },
  {
    part: "4. Mental model",
    check: (t) =>
      t.mentalModel?.plain && t.mentalModel.analogy && t.mentalModel.analogyLimit
        ? null
        : "mental model needs plain words, an analogy AND the analogy's limits",
  },
  {
    part: "5. Visual / interactive",
    check: (t) =>
      t.visualizationType !== "none" || t.exercises.some((e) => e.kind === "lab") || (t.visualNote ?? "").length >= 40
        ? null
        : "no visualisation or lab chosen, and no visualNote explaining why none fits",
  },
  { part: "6. Code examples", check: (t) => (t.codeExamples.length >= 1 ? null : "needs at least one worked example") },
  {
    part: "7. Expected output + steps",
    check: (t) =>
      t.codeExamples.length > 0 && t.codeExamples.every((c) => c.expectedOutput.trim() && c.steps.length >= 2)
        ? null
        : "every example needs expected output and at least 2 steps",
  },
  { part: "8. Practical application", check: (t) => ((t.practicalApplication ?? "").length >= 40 ? null : "practical application missing") },
  { part: "9. Common mistakes", check: (t) => (t.commonMistakes.length >= 2 ? null : "needs at least 2 common mistakes") },
  {
    part: "10. Exercises",
    check: (t) =>
      t.exercises.length >= 2 && t.exercises.some((e) => e.kind !== "predict")
        ? null
        : "needs at least 2 exercises, at least one hands-on (strike, debug or lab)",
  },
  { part: "11. Project", check: (t) => (t.project ? null : "no project") },
  {
    part: "12. Acceptance criteria",
    check: (t) => ((t.project?.acceptanceCriteria.length ?? 0) >= 3 ? null : "project needs at least 3 acceptance criteria"),
  },
  {
    part: "13. Knowledge checks",
    check: (t) => (t.knowledgeChecks.length >= 1 && (t.assessment?.questions.length ?? 0) >= 3 ? null : "needs knowledge checks and an assessment of 3+ questions"),
  },
  {
    part: "14. Interview questions",
    check: (t) =>
      t.interviewQuestions.length >= INTERVIEW_MINIMUM && t.interviewQuestions.every((q) => q.modelAnswer.length >= 40)
        ? null
        : `needs at least ${INTERVIEW_MINIMUM} interview questions, each with a real model answer`,
  },
  { part: "15. Misconceptions", check: (t) => (t.misconceptions.length >= 2 ? null : "needs at least 2 misconceptions") },
  {
    part: "16. Review plan",
    check: (t) => {
      const gaps = t.reviewRules.intervalsDays;
      const ascending = gaps.every((g, i) => i === 0 || g > gaps[i - 1]);
      return gaps.length >= 3 && ascending && t.reviewRules.questionsPerReview >= 1
        ? null
        : "review intervals must be 3+ growing gaps";
    },
  },
  {
    part: "17. Mastery requirements",
    check: (t) => {
      const m = t.masteryCriteria;
      return m.assessmentScore > 0 && m.assessmentScore <= 1 && m.exercisesRequired >= 1 && m.exercisesRequired <= t.exercises.length
        ? null
        : "mastery criteria must ask for real evidence the topic can provide";
    },
  },
  { part: "18. References", check: (t) => (t.references.length >= 2 ? null : "needs at least 2 references") },
];

// Every piece of learner-facing text in a topic, for the placeholder scan.
function allText(t: Topic): string[] {
  const questions = [...t.knowledgeChecks, ...(t.assessment?.questions ?? [])];
  return [
    t.story ?? "",
    t.practicalApplication ?? "",
    ...t.lessonSections.flatMap((s) => [s.heading, s.body]),
    ...questions.flatMap((q) => [q.prompt, q.explanation, ...q.choices]),
    ...t.interviewQuestions.flatMap((q) => [q.prompt, q.modelAnswer, q.explanation]),
    ...(t.project ? [t.project.summary, ...t.project.requirements, ...t.project.acceptanceCriteria] : []),
  ];
}

function checkChoiceQuestion(q: ChoiceQuestion, t: Topic, findings: Finding[]) {
  if (q.choices.length < 2 || q.choices.length > 5) {
    findings.push({ level: "error", where: t.id, message: `${q.id}: needs 2 to 5 choices` });
  }
  if (q.answerIndex < 0 || q.answerIndex >= q.choices.length) {
    findings.push({ level: "error", where: t.id, message: `${q.id}: answerIndex points outside the choices` });
  }
  if (q.objective < 0 || q.objective >= t.learningObjectives.length) {
    findings.push({ level: "error", where: t.id, message: `${q.id}: objective ${q.objective} does not exist` });
  }
  if (q.explanation.length < 30) {
    findings.push({ level: "error", where: t.id, message: `${q.id}: explanation too short to teach anything` });
  }
}

// Finds a prerequisite loop (A needs B, B needs A) with a depth-first walk. Returns the loop, or null.
function findCycle(topics: Map<string, Topic>): string[] | null {
  const state = new Map<string, "visiting" | "done">();
  const path: string[] = [];

  function visit(id: string): string[] | null {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "visiting") return [...path.slice(path.indexOf(id)), id];
    state.set(id, "visiting");
    path.push(id);
    for (const pre of topics.get(id)?.prerequisites ?? []) {
      if (topics.has(pre)) {
        const loop = visit(pre);
        if (loop) return loop;
      }
    }
    path.pop();
    state.set(id, "done");
    return null;
  }

  for (const id of topics.keys()) {
    const loop = visit(id);
    if (loop) return loop;
  }
  return null;
}

export interface AuditInput {
  domains: Domain[];
  topics: Topic[];
  glossary: GlossaryTerm[];
  strikeIds: string[]; // every strike that really exists
  requiredDomainCount: number; // 16
}

export function auditAtlas(input: AuditInput): Finding[] {
  const findings: Finding[] = [];
  const err = (where: string, message: string) => findings.push({ level: "error", where, message });
  const warn = (where: string, message: string) => findings.push({ level: "warning", where, message });

  // ---- Unique ids ----
  const seen = new Set<string>();
  function unique(kind: string, id: string) {
    const key = `${kind}:${id}`;
    if (seen.has(key)) err(id, `duplicate ${kind} id "${id}"`);
    seen.add(key);
  }
  input.domains.forEach((d) => unique("domain", d.id));
  input.topics.forEach((t) => unique("topic", t.id));
  input.glossary.forEach((g) => unique("glossary", g.id));
  for (const t of input.topics) {
    const questions = [...t.knowledgeChecks, ...(t.assessment?.questions ?? []), ...t.exercises.flatMap((e) => ("question" in e ? [e.question] : []))];
    questions.forEach((q) => unique("question", q.id));
    t.interviewQuestions.forEach((q) => unique("question", q.id));
  }

  // ---- Domains ----
  if (input.domains.length !== input.requiredDomainCount) {
    err("atlas", `expected ${input.requiredDomainCount} domains, found ${input.domains.length}`);
  }
  const topicById = new Map(input.topics.map((t) => [t.id, t]));
  const domainIds = new Set(input.domains.map((d) => d.id));
  for (const d of input.domains) {
    if (d.modules.length === 0) err(d.id, "domain has no modules");
    const count = d.modules.reduce((n, m) => n + m.topicIds.length, 0);
    if (count < 3) err(d.id, `domain has only ${count} topics (needs 3+)`);
    if (!input.topics.some((t) => t.domainId === d.id && t.stage === "complete")) {
      warn(d.id, "domain has no complete topic yet");
    }
    for (const u of d.unlockedBy) if (!domainIds.has(u)) err(d.id, `unlockedBy "${u}" is not a domain`);
    for (const m of d.modules) {
      if (m.topicIds.length === 0) err(m.id, "module has no topics");
      for (const id of m.topicIds) if (!topicById.has(id)) err(m.id, `module lists unknown topic "${id}"`);
    }
  }

  // ---- Topics ----
  const strikeIds = new Set(input.strikeIds);
  for (const t of input.topics) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) err(t.id, "topic id must be kebab-case");
    if (t.learningObjectives.length < 2) err(t.id, "needs at least 2 learning objectives");
    for (const pre of t.prerequisites) {
      if (!topicById.has(pre)) err(t.id, `prerequisite "${pre}" does not exist`);
      if (pre === t.id) err(t.id, "a topic cannot be its own prerequisite");
    }
    for (const s of t.strikeIds) if (!strikeIds.has(s)) err(t.id, `linked strike "${s}" does not exist`);
    for (const r of t.references) {
      if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(r.url)) err(t.id, `reference URL is not a valid https URL: ${r.url}`);
    }

    if (t.stage === "outline") continue; // the rest only applies once content is written

    for (const s of t.lessonSections) {
      if (s.body.length < MIN_SECTION_CHARS) err(t.id, `section "${s.heading}" is too short to be substantive`);
    }
    if (t.lessonSections.length < 3) err(t.id, "needs at least 3 lesson sections");

    for (const ex of t.exercises) {
      if (ex.kind === "strike" && !strikeIds.has(ex.strikeId)) err(t.id, `exercise links unknown strike "${ex.strikeId}"`);
      if ((ex.kind === "predict" || ex.kind === "debug")) checkChoiceQuestion(ex.question, t, findings);
    }
    t.knowledgeChecks.forEach((q) => checkChoiceQuestion(q, t, findings));
    t.assessment?.questions.forEach((q) => checkChoiceQuestion(q, t, findings));

    // Alignment: every objective must be assessed, and the project must prove at least one.
    if (t.assessment) {
      t.learningObjectives.forEach((_, i) => {
        if (!t.assessment!.questions.some((q) => q.objective === i)) {
          err(t.id, `objective ${i + 1} is never assessed`);
        }
      });
    }
    if (t.project) {
      if (t.project.objectivesCovered.length === 0) err(t.id, "project does not cover any objective");
      for (const i of t.project.objectivesCovered) {
        if (i < 0 || i >= t.learningObjectives.length) err(t.id, `project covers objective ${i + 1}, which does not exist`);
      }
    }

    for (const text of allText(t)) {
      if (PLACEHOLDER.test(text)) err(t.id, `placeholder text found: "${text.slice(0, 60)}"`);
    }

    // The 18 parts: a "complete" topic must pass every one.
    const missing = TOPIC_PARTS.map((p) => ({ part: p.part, problem: p.check(t) })).filter((p) => p.problem);
    if (t.stage === "complete") {
      for (const m of missing) err(t.id, `marked complete but ${m.part}: ${m.problem}`);
    }
    if (t.interviewQuestions.length < INTERVIEW_TARGET) {
      warn(t.id, `interview bank has ${t.interviewQuestions.length} of ${INTERVIEW_TARGET} target questions`);
    }
  }

  const loop = findCycle(topicById);
  if (loop) err("atlas", `prerequisite loop: ${loop.join(" -> ")}`);

  // ---- Glossary ----
  const glossaryIds = new Set(input.glossary.map((g) => g.id));
  for (const g of input.glossary) {
    for (const r of g.related) if (!glossaryIds.has(r)) err(g.id, `related term "${r}" does not exist`);
    for (const tid of g.topicIds) if (!topicById.has(tid)) err(g.id, `linked topic "${tid}" does not exist`);
    if (!g.meetingLine || !g.simple || !g.example) err(g.id, "glossary entry is missing a required field");
  }

  return findings;
}

// Per-topic completeness numbers, used by the coverage report and the World Map.
export function topicCompleteness(t: Topic) {
  if (t.stage === "outline") return { passed: 0, total: TOPIC_PARTS.length, missing: TOPIC_PARTS.map((p) => p.part) };
  const missing = TOPIC_PARTS.filter((p) => p.check(t)).map((p) => p.part);
  return { passed: TOPIC_PARTS.length - missing.length, total: TOPIC_PARTS.length, missing };
}
