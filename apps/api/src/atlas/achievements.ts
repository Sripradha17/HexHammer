// ACHIEVEMENTS: each one is a plain rule over real data, checked after every meaningful action.
// An achievement unlocks once and is never taken away (no punishment for breaks).
import type { PrismaClient } from "@prisma/client";
import { getTopic, topics } from "@hexhammer/content";

export interface AchievementRule {
  id: string;
  title: string;
  description: string; // how to earn it, shown even before it is unlocked (transparent)
  icon: string; // a short glyph shown in the UI
  check: (s: Snapshot) => boolean;
}

// Counts gathered once, so every rule is a simple comparison.
export interface Snapshot {
  lessonsRead: number;
  assessmentsPassed: number;
  mastered: string[];
  projects: number;
  projectsWithRepo: number;
  projectsComplete: number;
  milestonesDone: number;
  reviewsDone: number;
  interviewAnswers: number;
  domainsTouched: number;
  proposalsApproved: number;
  strikesPassed: number;
}

export const ACHIEVEMENTS: AchievementRule[] = [
  { id: "first-steps", title: "First steps", description: "Read every section of one topic.", icon: "◔", check: (s) => s.lessonsRead >= 1 },
  { id: "first-strike", title: "First strike", description: "Pass the tests of one hand-typed strike.", icon: "⚒", check: (s) => s.strikesPassed >= 1 },
  { id: "proved-it", title: "Proved it", description: "Pass your first end-of-topic assessment.", icon: "✓", check: (s) => s.assessmentsPassed >= 1 },
  { id: "five-proofs", title: "Five proofs", description: "Pass assessments in five different topics.", icon: "✓✓", check: (s) => s.assessmentsPassed >= 5 },
  { id: "first-mastery", title: "Mastery", description: "Master a topic: lesson, exercises, assessment and spaced reviews.", icon: "⬢", check: (s) => s.mastered.length >= 1 },
  { id: "boss-battle", title: "Boss battle", description: "Master a capstone topic (marked with a crown on the map).", icon: "♛", check: (s) => s.mastered.some((id) => getTopic(id)?.capstone) },
  { id: "builder", title: "Builder", description: "Create a project and link its GitHub repository.", icon: "⌂", check: (s) => s.projectsWithRepo >= 1 },
  { id: "milestone-maker", title: "Milestone maker", description: "Complete five project milestones.", icon: "⚑", check: (s) => s.milestonesDone >= 5 },
  { id: "shipped", title: "Shipped", description: "Mark a project complete with evidence.", icon: "🚀", check: (s) => s.projectsComplete >= 1 },
  { id: "portfolio-three", title: "Portfolio of three", description: "Complete three projects.", icon: "▦", check: (s) => s.projectsComplete >= 3 },
  { id: "reviewer", title: "Steady memory", description: "Finish ten spaced reviews.", icon: "↻", check: (s) => s.reviewsDone >= 10 },
  { id: "interview-ready", title: "Interview ready", description: "Answer twenty-five interview questions in your own words.", icon: "✎", check: (s) => s.interviewAnswers >= 25 },
  { id: "explorer", title: "Explorer", description: "Do real work in five different regions of the map.", icon: "✦", check: (s) => s.domainsTouched >= 5 },
  { id: "curator", title: "Curator", description: "Approve your first curriculum change from the Tech Radar.", icon: "◎", check: (s) => s.proposalsApproved >= 1 },
];

export async function takeSnapshot(db: PrismaClient): Promise<Snapshot> {
  const [progress, projects, milestonesDone, reviewsDone, interviewAnswers, proposalsApproved, strikesPassed, activity] = await Promise.all([
    db.topicProgress.findMany(),
    db.project.findMany({ select: { repoUrl: true, status: true } }),
    db.projectMilestone.count({ where: { doneAt: { not: null } } }),
    db.reviewLog.count(),
    db.questionAttempt.count(),
    db.curriculumProposal.count({ where: { status: "approved" } }),
    db.progress.count({ where: { status: "complete" } }),
    db.activityLog.findMany({ where: { topicId: { not: null } }, select: { topicId: true }, distinct: ["topicId"] }),
  ]);
  const domainOf = new Map(topics.map((t) => [t.id, t.domainId]));
  const touched = new Set(activity.map((a) => domainOf.get(a.topicId!)).filter(Boolean));
  return {
    lessonsRead: progress.filter((p) => p.lessonReadAt).length,
    assessmentsPassed: progress.filter((p) => p.assessmentPassedAt).length,
    mastered: progress.filter((p) => p.masteredAt).map((p) => p.topicId),
    projects: projects.length,
    projectsWithRepo: projects.filter((p) => p.repoUrl).length,
    projectsComplete: projects.filter((p) => p.status === "complete").length,
    milestonesDone,
    reviewsDone,
    interviewAnswers,
    domainsTouched: touched.size,
    proposalsApproved,
    strikesPassed,
  };
}

// Unlock every achievement whose rule now passes. Returns only the NEW ones (for a celebration).
export async function checkAchievements(db: PrismaClient) {
  const snapshot = await takeSnapshot(db);
  const already = new Set((await db.achievement.findMany({ select: { id: true } })).map((a) => a.id));
  const fresh = ACHIEVEMENTS.filter((a) => !already.has(a.id) && a.check(snapshot));
  for (const a of fresh) {
    await db.achievement.create({ data: { id: a.id, detail: a.description } }).catch(() => undefined);
  }
  return fresh.map(({ id, title, description, icon }) => ({ id, title, description, icon }));
}
