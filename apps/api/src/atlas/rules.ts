// THE RULES of the Atlas game, as plain functions with no database, so they are easy to test
// and easy to read. Everything the learner sees about XP, levels, mastery and reviews comes from here.
import type { Domain, Topic } from "@hexhammer/content";

// ---------------------------------------------------------------- XP

// How much each real action is worth. Reading is worth the least, on purpose: reading is not mastery.
export const XP = {
  lessonRead: 10,
  exercise: 20,
  strikePassed: 20,
  assessmentPassed: 50,
  mastery: 100,
  reviewDone: 15,
  interviewAnswer: 5,
  milestone: 25,
  projectComplete: 150,
  proposalDecided: 10,
} as const;

// Level n needs 50 × (n−1)² XP in total: 0, 50, 200, 450, 800, ... Early levels come fast,
// later ones need real sustained work. Returns the level and progress towards the next one.
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
  const start = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return { level, xpIntoLevel: xp - start, xpForNextLevel: next - start };
}

// ---------------------------------------------------------------- Topic progress and mastery

// What we know about one topic from the database (all optional: a fresh topic has nothing yet).
export interface TopicEvidence {
  lessonRead: boolean;
  exercisesDone: string[]; // exercise keys (see exerciseKey below)
  bestAssessmentScore: number | null;
  reviewsPassed: number;
  projectComplete: boolean; // a project linked to this topic is marked complete
  reviewDue: boolean;
}

// Every exercise gets a stable key, so completing it twice is still one completion.
export function exerciseKey(ex: Topic["exercises"][number]): string {
  if (ex.kind === "strike") return `strike:${ex.strikeId}`;
  if (ex.kind === "lab") return `lab:${ex.lab}`;
  return `${ex.kind}:${ex.question.id}`;
}

export interface MasteryCheck {
  label: string; // shown to the learner word for word
  met: boolean;
  detail: string;
}

// The transparent mastery checklist for one topic. Mastered = every line met.
export function masteryChecklist(topic: Topic, ev: TopicEvidence): MasteryCheck[] {
  const m = topic.masteryCriteria;
  const validKeys = new Set(topic.exercises.map(exerciseKey));
  const done = ev.exercisesDone.filter((k) => validKeys.has(k)).length;
  const best = ev.bestAssessmentScore ?? 0;
  const checks: MasteryCheck[] = [
    { label: "Read every lesson section", met: ev.lessonRead, detail: ev.lessonRead ? "Done" : "Open each section of the lesson" },
    { label: `Complete ${m.exercisesRequired} exercise${m.exercisesRequired === 1 ? "" : "s"}`, met: done >= m.exercisesRequired, detail: `${done} of ${m.exercisesRequired} done` },
    { label: `Score at least ${Math.round(m.assessmentScore * 100)}% on the assessment`, met: best >= m.assessmentScore, detail: ev.bestAssessmentScore === null ? "Not attempted yet" : `Best so far: ${Math.round(best * 100)}%` },
    { label: `Pass ${m.reviewsRequired} spaced review${m.reviewsRequired === 1 ? "" : "s"} after the assessment`, met: ev.reviewsPassed >= m.reviewsRequired, detail: `${ev.reviewsPassed} of ${m.reviewsRequired} passed` },
  ];
  if (m.projectRequired) {
    checks.push({ label: "Complete the topic's project", met: ev.projectComplete, detail: ev.projectComplete ? "Done" : "Not complete yet" });
  }
  return checks;
}

// The single status shown on the map. Order matters: the highest stage reached wins.
export type TopicStatus = "locked" | "new" | "learning" | "practiced" | "assessed" | "mastered";

export function topicStatus(topic: Topic, ev: TopicEvidence | null, prerequisitesMet: boolean): TopicStatus {
  if (ev && masteryChecklist(topic, ev).every((c) => c.met)) return "mastered";
  if (ev && ev.bestAssessmentScore !== null && ev.bestAssessmentScore >= topic.masteryCriteria.assessmentScore) return "assessed";
  const started = ev && (ev.lessonRead || ev.exercisesDone.length > 0 || ev.bestAssessmentScore !== null);
  if (ev && ev.exercisesDone.length >= topic.masteryCriteria.exercisesRequired) return "practiced";
  if (started) return "learning";
  return prerequisitesMet ? "new" : "locked";
}

// A prerequisite counts as met once its assessment is passed (or, for an outline topic with no
// assessment yet, once any of its linked strikes is complete). Reading alone never unlocks.
export function prerequisiteMet(pre: Topic, ev: TopicEvidence | null, completedStrikes: Set<string>): boolean {
  if (ev?.bestAssessmentScore !== null && ev?.bestAssessmentScore !== undefined && ev.bestAssessmentScore >= pre.masteryCriteria.assessmentScore) {
    return true;
  }
  if (!pre.assessment) return pre.strikeIds.some((s) => completedStrikes.has(s)) || pre.strikeIds.length === 0;
  return false;
}

// A region (domain) is open when it has no unlockers, or when I have shown real progress in any
// unlocking region: one passed assessment, or three completed strikes linked to its topics.
export function domainUnlocked(
  domain: Domain,
  topics: Topic[],
  passedTopicIds: Set<string>,
  completedStrikes: Set<string>,
): boolean {
  if (domain.unlockedBy.length === 0) return true;
  return domain.unlockedBy.some((unlockerId) => {
    const own = topics.filter((t) => t.domainId === unlockerId);
    if (own.some((t) => passedTopicIds.has(t.id))) return true;
    const strikes = new Set(own.flatMap((t) => t.strikeIds));
    return [...strikes].filter((s) => completedStrikes.has(s)).length >= 3;
  });
}

// ---------------------------------------------------------------- Spaced repetition

// The review intensity setting stretches or shrinks every gap.
export const INTENSITY_FACTOR: Record<string, number> = { relaxed: 1.5, normal: 1, intense: 0.6 };

export type ReviewResult = "good" | "hard" | "missed";

// Given where an item is in its schedule and how the review went, decide the next step and date.
// good   -> move to the next (longer) gap
// hard   -> stay on the same gap (try again after the same wait)
// missed -> step back one gap, and come back TOMORROW. Never a reset to zero, never a penalty.
export function nextReview(
  step: number,
  result: ReviewResult,
  intervalsDays: number[],
  intensity: string,
  from: Date = new Date(),
) {
  let nextStep = step;
  if (result === "good") nextStep = Math.min(step + 1, intervalsDays.length - 1);
  if (result === "missed") nextStep = Math.max(step - 1, 0);
  const factor = INTENSITY_FACTOR[intensity] ?? 1;
  const days = result === "missed" ? 1 : Math.max(1, Math.round(intervalsDays[nextStep] * factor));
  const dueAt = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return { step: nextStep, dueAt, days };
}

// The first review after passing an assessment comes after the first gap.
export function firstReviewDate(intervalsDays: number[], intensity: string, from: Date = new Date()) {
  const factor = INTENSITY_FACTOR[intensity] ?? 1;
  const days = Math.max(1, Math.round(intervalsDays[0] * factor));
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
}

// A self-rated interview answer becomes a review result.
export function ratingToResult(rating: string): ReviewResult {
  if (rating === "nailed") return "good";
  if (rating === "partial") return "hard";
  return "missed";
}

// Default gaps for single interview questions (they have no topic rules of their own).
export const QUESTION_INTERVALS = [1, 3, 7, 21, 60];

// ---------------------------------------------------------------- Assessment scoring

// Scores an assessment from { questionId: chosenIndex }. Unanswered questions count as wrong.
export function scoreAssessment(topic: Topic, answers: Record<string, number>) {
  const questions = topic.assessment?.questions ?? [];
  const results = questions.map((q) => ({
    questionId: q.id,
    chosen: answers[q.id] ?? null,
    correct: answers[q.id] === q.answerIndex,
    answerIndex: q.answerIndex,
    explanation: q.explanation,
    objective: q.objective,
  }));
  const correct = results.filter((r) => r.correct).length;
  const score = questions.length === 0 ? 0 : correct / questions.length;
  const passingScore = topic.assessment?.passingScore ?? 1;
  // Which objectives had a wrong answer: these become the "practise next" list (not a punishment).
  const weakObjectives = [...new Set(results.filter((r) => !r.correct).map((r) => r.objective))];
  return { score, passed: score >= passingScore, correct, total: questions.length, results, weakObjectives };
}
