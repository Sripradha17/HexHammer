// Public door of THE ATLAS (the 16-domain curriculum).
import type { Domain, Topic } from "./types";
import { d01 } from "./domains/d01-cs-fundamentals";
import { d02 } from "./domains/d02-web-fundamentals";
import { d03 } from "./domains/d03-frontend";
import { d04 } from "./domains/d04-design-systems";
import { d05 } from "./domains/d05-backend";
import { d06 } from "./domains/d06-databases";
import { d07 } from "./domains/d07-distributed";
import { d08 } from "./domains/d08-architecture";
import { d09 } from "./domains/d09-testing";
import { d10 } from "./domains/d10-devops";
import { d11 } from "./domains/d11-security";
import { d12 } from "./domains/d12-observability";
import { d13 } from "./domains/d13-machine-learning";
import { d14 } from "./domains/d14-ai-engineering";
import { d15 } from "./domains/d15-product-team";
import { d16 } from "./domains/d16-advanced";
import { beginnerCards } from "./beginner";

export type * from "./types";
export { glossary } from "./glossary";
export { funBuilds, getFunBuild } from "./funBuilds";
export { beginnerCards, getBeginnerCards } from "./beginner";
export type { BeginnerCard } from "./beginner";
export type { FunBuild, BuildKind } from "./funBuilds";
export { auditAtlas, topicCompleteness, TOPIC_PARTS, INTERVIEW_MINIMUM, INTERVIEW_TARGET } from "./validate";
export type { Finding } from "./validate";

const all = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16];

// The 16 domains in map order, and every topic in one flat list.
export const domains: Domain[] = all.map((d) => d.domain);
// Each topic carries its beginner cards (written separately in beginner.ts, so lessons stay short).
export const topics: Topic[] = all.flatMap((d) => d.topics).map((t) => (beginnerCards[t.id] ? { ...t, beginner: beginnerCards[t.id] } : t));

// Quick lookups by id. They return undefined for unknown ids, so callers must handle "not found".
const topicIndex = new Map(topics.map((t) => [t.id, t]));
const domainIndex = new Map(domains.map((d) => [d.id, d]));

export function getTopic(id: string): Topic | undefined {
  return topicIndex.get(id);
}

export function getDomain(id: string): Domain | undefined {
  return domainIndex.get(id);
}

// Every question that can appear in reviews and the Interview Arena, tagged with its topic.
export function allInterviewQuestions() {
  return topics.flatMap((t) => t.interviewQuestions.map((q) => ({ ...q, topicId: t.id, domainId: t.domainId })));
}

// Every choice question (checks, predictions, debugging, assessment) by id.
export function allChoiceQuestions() {
  return topics.flatMap((t) => [
    ...t.knowledgeChecks,
    ...(t.assessment?.questions ?? []),
    ...t.exercises.flatMap((e) => ("question" in e ? [e.question] : [])),
  ].map((q) => ({ ...q, topicId: t.id })));
}
