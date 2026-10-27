// Tests for the Atlas game rules. No database needed: these are plain functions.
import { describe, expect, it } from "vitest";
import { domains, getTopic, topics } from "@hexhammer/content";
import {
  domainUnlocked,
  exerciseKey,
  levelFromXp,
  masteryChecklist,
  nextReview,
  scoreAssessment,
  topicStatus,
  type TopicEvidence,
} from "./rules";

const bigO = getTopic("cs-big-o")!;
const fresh: TopicEvidence = { lessonRead: false, exercisesDone: [], bestAssessmentScore: null, reviewsPassed: 0, projectComplete: false, reviewDue: false };

describe("levels", () => {
  it("starts at level 1 with 0 XP and needs 50 XP for level 2", () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 50 });
    expect(levelFromXp(49).level).toBe(1);
    expect(levelFromXp(50).level).toBe(2);
    expect(levelFromXp(200).level).toBe(3);
  });
});

describe("mastery is evidence-based", () => {
  it("reading alone is never mastery", () => {
    const status = topicStatus(bigO, { ...fresh, lessonRead: true }, true);
    expect(status).toBe("learning");
  });

  it("a passed assessment without reviews is 'assessed', not 'mastered'", () => {
    const ev = { ...fresh, lessonRead: true, exercisesDone: bigO.exercises.map(exerciseKey), bestAssessmentScore: 1 };
    expect(topicStatus(bigO, ev, true)).toBe("assessed");
  });

  it("every checklist line met is 'mastered'", () => {
    const ev = { ...fresh, lessonRead: true, exercisesDone: bigO.exercises.map(exerciseKey), bestAssessmentScore: 0.8, reviewsPassed: 2 };
    expect(masteryChecklist(bigO, ev).every((c) => c.met)).toBe(true);
    expect(topicStatus(bigO, ev, true)).toBe("mastered");
  });

  it("ignores exercise keys that do not belong to the topic", () => {
    const ev = { ...fresh, exercisesDone: ["lab:not-a-lab", "strike:l1-s01", "strike:l1-s01"] };
    const line = masteryChecklist(bigO, ev).find((c) => c.label.startsWith("Complete"))!;
    expect(line.detail).toBe(`0 of ${bigO.masteryCriteria.exercisesRequired} done`);
  });

  it("shows a locked topic only when nothing was started and prerequisites are unmet", () => {
    expect(topicStatus(bigO, null, false)).toBe("locked");
    expect(topicStatus(bigO, null, true)).toBe("new");
  });
});

describe("assessments", () => {
  it("scores answers, passes at the threshold and lists weak objectives", () => {
    const qs = bigO.assessment!.questions;
    const allRight = Object.fromEntries(qs.map((q) => [q.id, q.answerIndex]));
    expect(scoreAssessment(bigO, allRight)).toMatchObject({ score: 1, passed: true, weakObjectives: [] });

    const oneWrong = { ...allRight, [qs[0].id]: (qs[0].answerIndex + 1) % qs[0].choices.length };
    const r = scoreAssessment(bigO, oneWrong);
    expect(r.score).toBeCloseTo(4 / 5);
    expect(r.passed).toBe(true); // 80% passes an 80% threshold
    expect(r.weakObjectives).toEqual([qs[0].objective]);
  });

  it("treats unanswered questions as wrong", () => {
    expect(scoreAssessment(bigO, {}).score).toBe(0);
  });
});

describe("spaced repetition", () => {
  const gaps = [1, 3, 7, 21, 60];
  const monday = new Date(2026, 9, 26); // 26 Oct 2026

  it("good moves to a longer gap", () => {
    const r = nextReview(1, "good", gaps, "normal", monday);
    expect(r.step).toBe(2);
    expect(r.days).toBe(7);
  });

  it("missed steps back one gap and returns tomorrow, never resetting to zero from far along", () => {
    const r = nextReview(4, "missed", gaps, "normal", monday);
    expect(r.step).toBe(3);
    expect(r.days).toBe(1);
    expect(r.dueAt).toEqual(new Date(2026, 9, 27));
  });

  it("relaxed intensity stretches gaps", () => {
    expect(nextReview(0, "good", gaps, "relaxed", monday).days).toBe(Math.round(3 * 1.5));
  });
});

describe("regions", () => {
  it("opens starting regions and keeps dependent ones locked until real progress", () => {
    const cs = domains.find((d) => d.id === "cs")!;
    const fe = domains.find((d) => d.id === "fe")!; // unlocked by 'web'
    expect(domainUnlocked(cs, topics, new Set(), new Set())).toBe(true);
    expect(domainUnlocked(fe, topics, new Set(), new Set())).toBe(false);
    expect(domainUnlocked(fe, topics, new Set(["web-http-lifecycle"]), new Set())).toBe(true);
    expect(domainUnlocked(fe, topics, new Set(), new Set(["l4-s01", "l4-s02", "l4-s03"]))).toBe(true);
  });
});
