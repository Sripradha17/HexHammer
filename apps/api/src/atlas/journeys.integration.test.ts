// INTEGRATION TESTS against a REAL PostgreSQL database, in a separate, throwaway schema
// ("hexhammer_test"), so my real progress is never touched. They prove the critical journeys end
// to end through real HTTP requests: persistence, no double XP, achievements, reviews, the
// interview reveal rule, projects, and the radar's discover -> dedupe -> propose -> approve flow.
//
// Needs Docker's Postgres running (docker compose up -d). If it is not reachable, these tests are
// SKIPPED (and say so), never faked.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { getTopic } from "@hexhammer/content";
import { createApp } from "../app";
import type { FetchLike } from "../radar/connectors";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

// Point at the same server but a different schema. Refuse to run against anything else.
const baseUrl = process.env.DATABASE_URL ?? "";
const testUrl = baseUrl.replace(/schema=[^&]+/, "schema=hexhammer_test");
const safe = testUrl.includes("schema=hexhammer_test");

async function reachable() {
  if (!safe) return false;
  const probe = new PrismaClient({ datasourceUrl: testUrl });
  try {
    await probe.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await probe.$disconnect();
  }
}
const dbUp = await reachable();
if (!dbUp) console.warn("SKIPPING integration tests: PostgreSQL is not reachable (run: docker compose up -d).");

// The radar never goes online in tests.
const offline: FetchLike = async () => {
  throw new Error("network disabled in tests");
};

describe.skipIf(!dbUp)("critical journeys (real database)", () => {
  let db: PrismaClient;
  let app: ReturnType<typeof createApp>;
  const env = { ...process.env, DATABASE_URL: testUrl };

  beforeAll(async () => {
    db = new PrismaClient({ datasourceUrl: testUrl });
    await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS hexhammer_test CASCADE");
    execSync("npx prisma migrate deploy", { env, stdio: "ignore", cwd: fileURLToPath(new URL("../../../../", import.meta.url)) });
    execSync("npx tsx prisma/seed.ts", { env, stdio: "ignore", cwd: fileURLToPath(new URL("../../", import.meta.url)) });
    app = createApp(db, offline);
  }, 180_000);

  afterAll(async () => {
    await db?.$executeRawUnsafe("DROP SCHEMA IF EXISTS hexhammer_test CASCADE");
    await db?.$disconnect();
  });

  const topic = getTopic("cs-big-o")!;

  it("1-2. opens the map with 16 regions and real statuses", async () => {
    const res = await request(app).get("/atlas/map");
    expect(res.status).toBe(200);
    expect(res.body.regions).toHaveLength(16);
    const cs = res.body.regions.find((r: { id: string }) => r.id === "cs");
    expect(cs.unlocked).toBe(true);
    expect(res.body.regions.find((r: { id: string }) => r.id === "fe").unlocked).toBe(false);
  });

  it("3. the lesson arrives WITHOUT answers, then reading pays XP exactly once", async () => {
    const lesson = await request(app).get(`/atlas/topics/${topic.id}`);
    expect(lesson.status).toBe(200);
    const json = JSON.stringify(lesson.body.topic);
    expect(json).not.toContain('"answerIndex"');
    expect(json).not.toContain('"modelAnswer"');
    // Its prerequisites have linked strikes I have not passed yet, so it shows as locked: a SOFT
    // lock (the lesson still loads), unless strict unlocking is switched on in Settings.
    expect(lesson.body.status).toBe("locked");
    expect(lesson.body.prerequisites.every((p: { met: boolean }) => p.met === false)).toBe(true);

    // Mission Control still recommends something genuinely open (no unmet prerequisites).
    const mc = await request(app).get("/atlas/mission-control");
    expect(mc.body.nextMission).toBeTruthy();
    expect(mc.body.nextMission.status).not.toBe("locked");

    const first = await request(app).post(`/atlas/topics/${topic.id}/read`);
    const again = await request(app).post(`/atlas/topics/${topic.id}/read`);
    expect(first.body.xpAwarded).toBe(10);
    expect(again.body.xpAwarded).toBe(0); // no duplicate reward
    expect(first.body.achievements.map((a: { id: string }) => a.id)).toContain("first-steps");
  });

  it("4. a wrong prediction explains without penalty; a right one completes the exercise", async () => {
    const ex = topic.exercises.find((e) => e.kind === "predict")!;
    const q = ex.kind === "predict" ? ex.question : null!;
    const wrong = await request(app).post(`/atlas/questions/${q.id}/check`).send({ choice: (q.answerIndex + 1) % q.choices.length });
    expect(wrong.body).toMatchObject({ correct: false, answerIndex: q.answerIndex, xpAwarded: 0 });
    expect(wrong.body.explanation.length).toBeGreaterThan(20);
    const right = await request(app).post(`/atlas/questions/${q.id}/check`).send({ choice: q.answerIndex });
    expect(right.body).toMatchObject({ correct: true, xpAwarded: 20 });
  });

  it("5-7. an assessment is scored, explained, persisted, and starts spaced reviews", async () => {
    const answers = Object.fromEntries(topic.assessment!.questions.map((q) => [q.id, q.answerIndex]));
    const res = await request(app).post(`/atlas/topics/${topic.id}/assessment`).send({ answers });
    expect(res.body).toMatchObject({ score: 1, passed: true, firstPass: true, xpAwarded: 50 });
    expect(res.body.results[0].explanation.length).toBeGreaterThan(20);

    // "Reload": read it back from the database through a fresh request.
    const after = await request(app).get(`/atlas/topics/${topic.id}`);
    expect(after.body.status).toBe("assessed"); // passed, but NOT mastered (reviews still needed)
    expect(after.body.progress.bestAssessmentScore).toBe(1);
    expect(after.body.review.dueAt).toBeTruthy();
    expect(after.body.mastery.find((m: { label: string }) => m.label.includes("spaced review")).met).toBe(false);
  });

  it("8-11. creates and edits a project with a GitHub URL; a milestone pays once and unlocks achievements", async () => {
    const bad = await request(app).post("/projects").send({ title: "x", description: "y", repoUrl: "https://gitlab.com/a/b" });
    expect(bad.status).toBe(400);
    expect(bad.body.fields.repoUrl).toBeTruthy();

    const template = await request(app).get(`/projects/templates/${topic.id}`);
    const created = await request(app).post("/projects").send({ ...template.body, repoUrl: "https://github.com/learner/growth-lab" });
    expect(created.status).toBe(201);
    expect(created.body.achievements.map((a: { id: string }) => a.id)).toContain("builder");
    const id = created.body.project.id;
    expect(created.body.project.milestones.length).toBeGreaterThan(0);

    const edited = await request(app).put(`/projects/${id}`).send({ status: "in_progress", demoUrl: "https://learner.example.com/growth" });
    expect(edited.body.project.demoUrl).toBe("https://learner.example.com/growth");

    const listed = await request(app).get("/projects");
    expect(listed.body.projects.some((p: { id: number }) => p.id === id)).toBe(true);

    const m = created.body.project.milestones[0];
    const done = await request(app).put(`/projects/${id}/milestones/${m.id}`).send({ done: true });
    expect(done.body.xpAwarded).toBe(25);
    await request(app).put(`/projects/${id}/milestones/${m.id}`).send({ done: false });
    const redone = await request(app).put(`/projects/${id}/milestones/${m.id}`).send({ done: true });
    expect(redone.body.xpAwarded).toBe(0); // un-tick + re-tick never pays twice

    const noEvidence = await request(app).put(`/projects/${id}`).send({ status: "complete" });
    expect(noEvidence.status).toBe(400);
  });

  it("12. a due review mission can be completed and moves the schedule", async () => {
    await db.reviewItem.updateMany({ where: { refId: topic.id }, data: { dueAt: new Date(Date.now() - 1000) } });
    const due = await request(app).get("/atlas/reviews/due");
    const mission = due.body.missions.find((m: { topicId: string }) => m.topicId === topic.id);
    expect(mission.questions.length).toBeGreaterThan(0);
    expect(JSON.stringify(mission)).not.toContain("answerIndex");

    const pool = [...topic.knowledgeChecks, ...topic.assessment!.questions];
    const answers = Object.fromEntries(mission.questions.map((q: { id: string }) => [q.id, pool.find((p) => p.id === q.id)!.answerIndex]));
    const res = await request(app).post(`/atlas/reviews/${mission.id}`).send({ answers, confidence: 4 });
    expect(res.body.result).toBe("good");
    expect(new Date(res.body.nextDueAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("13. interview: the model answer is only revealed after I answer in my own words", async () => {
    const q = topic.interviewQuestions[0];
    const list = await request(app).get("/atlas/interview/questions");
    expect(JSON.stringify(list.body)).not.toContain(q.modelAnswer.slice(0, 40));

    const tooShort = await request(app).post(`/atlas/interview/questions/${q.id}/answer`).send({ answerText: "idk" });
    expect(tooShort.status).toBe(400);
    const answered = await request(app)
      .post(`/atlas/interview/questions/${q.id}/answer`)
      .send({ answerText: "Big O describes how work grows as the input grows, not seconds.", confidence: 4 });
    expect(answered.body.modelAnswer).toBe(q.modelAnswer);
    const rated = await request(app).post(`/atlas/interview/attempts/${answered.body.attemptId}/rate`).send({ selfRating: "partial" });
    expect(rated.body.days).toBeGreaterThan(0);
  });

  it("14-18. radar: discover from a fixture, deduplicate, propose, approve -> new version, progress intact", async () => {
    const sources = await db.techSource.findMany({ where: { kind: "fixture" } });
    const releases = sources.find((s) => s.url.includes("releases"))!;
    const blog = sources.find((s) => s.url.includes("blog"))!;

    const run1 = await request(app).post(`/radar/sources/${releases.id}/check`);
    expect(run1.body.run).toMatchObject({ status: "ok", itemsFound: 3, itemsNew: 3, itemsDuplicate: 0 });
    const run2 = await request(app).post(`/radar/sources/${releases.id}/check`);
    expect(run2.body.run).toMatchObject({ itemsNew: 0, itemsDuplicate: 3 }); // same URLs again
    const run3 = await request(app).post(`/radar/sources/${blog.id}/check`);
    expect(run3.body.run).toMatchObject({ itemsNew: 1, itemsDuplicate: 1 }); // same news, other source

    const updates = await request(app).get("/radar/updates");
    const major = updates.body.updates.find((u: { title: string }) => u.title === "Fixture Framework v3.0.0");
    expect(major.classification).toBe("breaking");
    expect(major.seenCount).toBe(3);
    expect(major.summary).not.toMatch(/script|alert/);
    expect(major.publishedAt).toBe("2026-10-20T09:00:00.000Z");
    expect(new Date(major.discoveredAt).getTime()).toBeGreaterThan(new Date(major.publishedAt).getTime());

    const before = await db.topicProgress.findUnique({ where: { topicId: "fe-event-loop" } });
    await db.topicProgress.upsert({ where: { topicId: "fe-event-loop" }, update: { bestAssessmentScore: 0.6 }, create: { topicId: "fe-event-loop", bestAssessmentScore: 0.6 } });

    const proposal = await request(app).post(`/radar/updates/${major.id}/proposals`).send({ topicId: "fe-event-loop", kind: "learning-mission" });
    expect(proposal.status).toBe(201);
    const notReady = await request(app).post(`/radar/proposals/${proposal.body.id}/decide`).send({ decision: "approve" });
    expect(notReady.status).toBe(400); // human-written parts missing: no silent rewrite

    await request(app).put(`/radar/proposals/${proposal.body.id}`).send({
      content: { ...proposal.body.content, whyChanged: "Simpler async API.", before: "onNext() hooks.", now: "Async pipeline only.", exercise: "Migrate one handler from onNext() to the pipeline API." },
      migrationNotes: "Existing progress is kept.",
    });
    const approved = await request(app).post(`/radar/proposals/${proposal.body.id}/decide`).send({ decision: "approve", note: "Checked against the release notes." });
    expect(approved.status).toBe(200);
    expect(approved.body.version).toMatchObject({ topicId: "fe-event-loop", version: 2, previousVersion: 1 });

    const lesson = await request(app).get("/atlas/topics/fe-event-loop");
    expect(lesson.body.contentVersion).toBe(2);
    expect(lesson.body.versions[0].addendum.whyChanged).toBe("Simpler async API.");
    expect(lesson.body.progress.bestAssessmentScore).toBe(0.6); // progress intact after the new version
    expect(before?.bestAssessmentScore ?? null).toBeNull();

    const auditTrail = await request(app).get("/radar/audit");
    const actions = auditTrail.body.entries.map((e: { action: string }) => e.action);
    expect(actions).toEqual(expect.arrayContaining(["ingest", "propose", "approve", "publish"]));
  });

  it("export contains my real data", async () => {
    const res = await request(app).get("/atlas/export");
    expect(res.body.format).toBe("hexhammer-backup");
    expect(res.body.data.topicProgress.length).toBeGreaterThan(0);
    expect(res.body.data.projects.length).toBe(1);
  });
});
