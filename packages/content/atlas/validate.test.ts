// Tests for the curriculum audit. Two kinds:
// 1. The REAL atlas passes with zero errors (so a broken edit fails `npm test`).
// 2. The audit really catches each kind of problem (so a passing audit means something).
import { describe, expect, it } from "vitest";
import { allLessons } from "../index";
import { auditAtlas, domains, glossary, getTopic, topicCompleteness, topics } from "./index";
import type { Domain, Topic } from "./types";
import { outline } from "./outline";

const strikeIds = allLessons.map((l) => l.id);

function audit(over: { domains?: Domain[]; topics?: Topic[] } = {}) {
  return auditAtlas({
    domains: over.domains ?? domains,
    topics: over.topics ?? topics,
    glossary,
    strikeIds,
    requiredDomainCount: 16,
  });
}
const errorsOf = (f: ReturnType<typeof audit>) => f.filter((x) => x.level === "error").map((x) => x.message);

describe("the real atlas", () => {
  it("has all 16 required domains, each with modules and topics", () => {
    expect(domains).toHaveLength(16);
    for (const d of domains) {
      expect(d.modules.length).toBeGreaterThan(0);
      expect(topics.filter((t) => t.domainId === d.id).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("passes the audit with zero errors", () => {
    expect(errorsOf(audit())).toEqual([]);
  });

  it("every topic marked complete really passes all 18 parts", () => {
    for (const t of topics.filter((x) => x.stage === "complete")) {
      expect(topicCompleteness(t).missing, t.id).toEqual([]);
    }
  });

  it("gives every hex on the map its own grid cell", () => {
    const cells = domains.map((d) => `${d.col},${d.row}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it("never puts a solution field on an exercise (charter rule)", () => {
    for (const t of topics) {
      for (const ex of t.exercises) {
        expect(Object.keys(ex)).not.toContain("solution");
      }
    }
  });
});

describe("the audit catches problems", () => {
  it("catches a prerequisite loop", () => {
    const a = { ...outline({ id: "loop-a", title: "A", difficulty: "core", objectives: ["one", "two"], prerequisites: ["loop-b"] }), domainId: "cs" };
    const b = { ...outline({ id: "loop-b", title: "B", difficulty: "core", objectives: ["one", "two"], prerequisites: ["loop-a"] }), domainId: "cs" };
    expect(errorsOf(audit({ topics: [...topics, a, b] })).join("\n")).toMatch(/prerequisite loop/);
  });

  it("catches a link to a topic that does not exist", () => {
    const bad = { ...outline({ id: "orphan", title: "Orphan", difficulty: "core", objectives: ["one", "two"], prerequisites: ["no-such-topic"] }), domainId: "cs" };
    expect(errorsOf(audit({ topics: [...topics, bad] })).join("\n")).toMatch(/no-such-topic/);
  });

  it("catches a link to a strike that does not exist", () => {
    const bad = { ...outline({ id: "bad-strike", title: "X", difficulty: "core", objectives: ["one", "two"], strikeIds: ["l9-s99"] }), domainId: "cs" };
    expect(errorsOf(audit({ topics: [...topics, bad] })).join("\n")).toMatch(/l9-s99/);
  });

  it("catches a topic that claims to be complete but is missing parts", () => {
    const real = getTopic("cs-big-o")!;
    const broken: Topic = { ...real, id: "fake-complete", story: "", misconceptions: [], references: [], knowledgeChecks: [], interviewQuestions: [], assessment: undefined, exercises: [] };
    const messages = errorsOf(audit({ topics: [...topics, broken] })).filter((m) => m.includes("marked complete"));
    expect(messages.length).toBeGreaterThanOrEqual(5);
  });

  it("catches an objective that is never assessed", () => {
    const real = getTopic("cs-big-o")!;
    const skewed: Topic = {
      ...real,
      id: "skewed",
      knowledgeChecks: real.knowledgeChecks.map((q) => ({ ...q, id: `${q.id}-s` })),
      exercises: [],
      interviewQuestions: real.interviewQuestions.map((q) => ({ ...q, id: `${q.id}-s` })),
      stage: "draft",
      assessment: { passingScore: 0.8, questions: real.assessment!.questions.map((q) => ({ ...q, id: `${q.id}-s`, objective: 0 })) },
    };
    expect(errorsOf(audit({ topics: [...topics, skewed] })).join("\n")).toMatch(/objective 2 is never assessed/);
  });

  it("catches placeholder text in written content", () => {
    const real = getTopic("cs-big-o")!;
    const lazy: Topic = {
      ...real,
      id: "lazy",
      stage: "draft",
      story: "TODO write a story later, it will be a good one about scale",
      knowledgeChecks: [],
      exercises: [],
      interviewQuestions: [],
      assessment: undefined,
    };
    expect(errorsOf(audit({ topics: [...topics, lazy] })).join("\n")).toMatch(/placeholder/);
  });

  it("catches duplicate ids", () => {
    const dup = { ...topics[0] };
    expect(errorsOf(audit({ topics: [...topics, dup] })).join("\n")).toMatch(/duplicate topic id/);
  });
});
