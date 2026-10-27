// Small helpers that build Topic objects, so each domain file stays short and readable.
import type { Difficulty, Domain, MasteryCriteria, ReviewRules, Topic } from "./types";

// A module as it is written in a domain file: its topics sit right inside it.
export interface ModuleInput {
  id: string;
  title: string;
  summary: string;
  topics: Topic[];
}

// Everything about a domain except its modules (which are built from ModuleInput below).
export type DomainMeta = Omit<Domain, "modules">;

// Turns a domain file's readable shape into the Domain + flat list of Topics the app uses.
// It also stamps each topic with its domainId and moduleId, so a domain file cannot get them wrong.
export function defineDomain(meta: DomainMeta, modules: ModuleInput[]) {
  const topics: Topic[] = [];
  const domain: Domain = {
    ...meta,
    modules: modules.map((m) => {
      for (const topic of m.topics) {
        topics.push({ ...topic, domainId: meta.id, moduleId: m.id });
      }
      return {
        id: m.id,
        domainId: meta.id,
        title: m.title,
        summary: m.summary,
        topicIds: m.topics.map((t) => t.id),
      };
    }),
  };
  return { domain, topics };
}

// The default rules, shown to the learner word for word in the Learning Studio.
export const DEFAULT_MASTERY: MasteryCriteria = {
  lessonRead: true,
  exercisesRequired: 2,
  assessmentScore: 0.8,
  projectRequired: false,
  reviewsRequired: 2,
};

// Gaps (in days) between spaced reviews: tomorrow, then 3 days, a week, 3 weeks, 2 months.
export const DEFAULT_REVIEW: ReviewRules = {
  intervalsDays: [1, 3, 7, 21, 60],
  questionsPerReview: 3,
};

// The date this first version of the Atlas was written and checked.
export const ATLAS_V1_DATE = "2026-10-26";

export interface OutlineInput {
  id: string;
  title: string;
  difficulty: Difficulty;
  objectives: string[];
  prerequisites?: string[];
  subtopics?: string[];
  strikeIds?: string[];
  capstone?: boolean;
}

// An OUTLINE topic: it is on the map and has goals, but its lesson is not written yet.
// The coverage report lists every outline topic in the backlog, so nothing pretends to be done.
// domainId and moduleId are filled in by defineDomain, from where the topic sits in the file.
export function outline(input: OutlineInput): Topic {
  return {
    id: input.id,
    domainId: "",
    moduleId: "",
    title: input.title,
    stage: "outline",
    difficulty: input.difficulty,
    learningObjectives: input.objectives,
    prerequisites: input.prerequisites ?? [],
    subtopics: input.subtopics ?? [],
    strikeIds: input.strikeIds ?? [],
    capstone: input.capstone,
    lessonSections: [],
    visualizationType: "none",
    codeExamples: [],
    commonMistakes: [],
    misconceptions: [],
    exercises: [],
    knowledgeChecks: [],
    interviewQuestions: [],
    references: [],
    masteryCriteria: DEFAULT_MASTERY,
    reviewRules: DEFAULT_REVIEW,
    timeless: [],
    versionSpecific: [],
    contentVersion: 1,
    lastReviewedAt: ATLAS_V1_DATE,
    reviewStatus: "reviewed",
  };
}
