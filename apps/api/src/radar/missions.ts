// LEARNING MISSIONS from approved technology changes.
//
// Honesty rule: the radar only KNOWS what the source said (title, summary, link, dates). So a new
// draft fills in only those facts, plus links to what the Atlas already teaches, and leaves the
// rest for me to write after reading the source. Approval is refused until the required parts are
// written, and every field is checked before it can enter the curriculum.
import type { TechUpdate } from "@prisma/client";
import { getTopic, type Topic } from "@hexhammer/content";

export interface MissionQuestion {
  prompt: string;
  modelAnswer: string;
}

// The 12 parts of a mission, in the order the learner sees them.
export interface MissionContent {
  whatChanged: string; // 1
  whyChanged: string; // 2
  before: string; // 3
  now: string; // 4
  foundations: string[]; // 5: topic ids I should know first
  example: string; // 6
  demo: string; // 7: which lab or visual helps (optional)
  exercise: string; // 8: a debugging or migration exercise (no solution: the charter applies)
  interviewQuestions: MissionQuestion[]; // 9
  projectEnhancement: string; // 10
  assessment: MissionQuestion[]; // 11 (short self-check questions)
  references: { title: string; url: string }[]; // 12
}

export const MISSION_KINDS = ["learning-mission", "lesson-update", "migration-exercise", "interview-questions", "project-enhancement"];

// A first draft from facts only. Empty strings mean "you write this after reading the source".
export function draftMission(update: Pick<TechUpdate, "title" | "summary" | "canonicalUrl" | "classificationReason">, topic: Topic): MissionContent {
  return {
    whatChanged: `${update.title}. Source summary: ${update.summary}`.slice(0, 1500),
    whyChanged: "",
    before: "",
    now: "",
    foundations: [...topic.prerequisites, topic.id].filter((id) => getTopic(id)),
    example: "",
    demo: topic.visualizationType !== "none" ? `The "${topic.visualizationType}" lab in ${topic.title}.` : "",
    exercise: "",
    interviewQuestions: [],
    projectEnhancement: topic.project ? `Extend "${topic.project.title}" to cover this change.` : "",
    assessment: [],
    references: [{ title: update.title, url: update.canonicalUrl.replace(/#hexhammer-change-.*/, "") }],
  };
}

// Strip anything that looks like markup: mission text is shown as plain text, never as HTML.
function clean(text: unknown, max: number): string {
  return String(text ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
}

// Validate and normalise mission content coming from the editor. Returns problems that block approval.
export function validateMission(raw: unknown, forApproval: boolean): { content: MissionContent; problems: string[] } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const questions = (v: unknown): MissionQuestion[] =>
    Array.isArray(v)
      ? v.slice(0, 15).map((q) => ({ prompt: clean((q as MissionQuestion)?.prompt, 500), modelAnswer: clean((q as MissionQuestion)?.modelAnswer, 2000) })).filter((q) => q.prompt)
      : [];
  const content: MissionContent = {
    whatChanged: clean(r.whatChanged, 1500),
    whyChanged: clean(r.whyChanged, 1500),
    before: clean(r.before, 1500),
    now: clean(r.now, 1500),
    foundations: Array.isArray(r.foundations) ? r.foundations.map(String).filter((id) => getTopic(id)).slice(0, 10) : [],
    example: clean(r.example, 4000),
    demo: clean(r.demo, 500),
    exercise: clean(r.exercise, 3000),
    interviewQuestions: questions(r.interviewQuestions),
    projectEnhancement: clean(r.projectEnhancement, 1500),
    assessment: questions(r.assessment),
    references: Array.isArray(r.references)
      ? r.references.slice(0, 10).map((x) => ({ title: clean((x as { title?: string })?.title, 200), url: String((x as { url?: string })?.url ?? "").trim() }))
      : [],
  };

  const problems: string[] = [];
  for (const ref of content.references) {
    if (!/^https:\/\/[^\s]+$/.test(ref.url)) problems.push(`Reference "${ref.title || ref.url}" must be an https:// link.`);
  }
  if (forApproval) {
    const required: [keyof MissionContent, string][] = [
      ["whatChanged", "What changed"],
      ["whyChanged", "Why it changed"],
      ["before", "What was true before"],
      ["now", "What is true now"],
      ["exercise", "A debugging or migration exercise"],
    ];
    for (const [key, label] of required) if (!(content[key] as string)) problems.push(`"${label}" must be written before approval.`);
    if (content.references.length === 0) problems.push("At least one authoritative reference is required.");
    if (content.interviewQuestions.some((q) => !q.modelAnswer)) problems.push("Every interview question needs a model answer.");
  }
  return { content, problems };
}
