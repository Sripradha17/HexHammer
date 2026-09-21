// Tests for the API routes and the two middleware. We pass in a FAKE database (a plain object),
// so these tests need no Docker and no real database.
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { calculateStreak, toDateString } from "./streak";
import { isDueToday, nextBox, nextReviewDate } from "./spacedRepetition";

// Builds an app whose "database" is whatever fake we hand in.
function appWith(fake: object) {
  return createApp(fake as unknown as PrismaClient);
}

describe("validation middleware", () => {
  it("rejects PUT /strikes/:id/code when code is missing (400)", async () => {
    const db = { strike: { findUnique: vi.fn() } };
    const res = await request(appWith(db)).put("/strikes/l1-s01/code").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: '"code" must be a string' });
    expect(db.strike.findUnique).not.toHaveBeenCalled(); // the route never ran
  });

  it("rejects a review whose id is not a number (400)", async () => {
    const res = await request(appWith({})).post("/cards/abc/review").send({ knew: true });
    expect(res.status).toBe(400);
  });

  it("rejects a review where knew is not a boolean (400)", async () => {
    const res = await request(appWith({})).post("/cards/1/review").send({ knew: "yes" });
    expect(res.status).toBe(400);
  });
});

describe("error-handling middleware", () => {
  it("turns a missing strike into a 404 JSON error", async () => {
    const db = { strike: { findUnique: vi.fn().mockResolvedValue(null) } };
    const res = await request(appWith(db)).get("/strikes/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toContain("nope");
  });

  it("turns a surprise crash into a 500 without leaking details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const db = {
      progress: { findMany: vi.fn().mockRejectedValue(new Error("secret db detail")) },
    };
    const res = await request(appWith(db)).get("/progress");
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret db detail");
  });
});

describe("routes", () => {
  it("GET /levels reports % complete and the tracks", async () => {
    const db = {
      strike: { findMany: vi.fn().mockResolvedValue([]) },
      level: {
        findMany: vi.fn().mockResolvedValue([
          {
            number: 1,
            name: "Red",
            color: "red",
            title: "Words and boxes",
            description: "d",
            runner: "browser",
            isOpen: true,
            plannedStrikes: [],
            strikes: [
              { id: "a", order: 1, title: "A", progress: { status: "complete" } },
              { id: "b", order: 2, title: "B", progress: null },
            ],
          },
        ]),
      },
    };
    const res = await request(appWith(db)).get("/levels");
    expect(res.status).toBe(200);
    expect(res.body.levels[0].percentComplete).toBe(50);
    expect(res.body.tracks).toHaveLength(3);
  });

  it("GET /strikes/:id/solution is locked until 2 failed runs (403)", async () => {
    const db = {
      strike: {
        findUnique: vi.fn().mockResolvedValue({
          solution: "secret",
          progress: { status: "in_progress", attempts: 1 },
        }),
      },
    };
    const res = await request(appWith(db)).get("/strikes/l1-s01/solution");
    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain("secret");
  });

  it("GET /strikes/:id/solution unlocks after 2 failed runs", async () => {
    const db = {
      strike: {
        findUnique: vi.fn().mockResolvedValue({
          solution: "secret",
          progress: { status: "in_progress", attempts: 2 },
        }),
      },
    };
    const res = await request(appWith(db)).get("/strikes/l1-s01/solution");
    expect(res.status).toBe(200);
    expect(res.body.solution).toBe("secret");
  });

  it("POST /strikes/:id/attempt counts a failed run", async () => {
    const db = {
      strike: { findUnique: vi.fn().mockResolvedValue({ id: "l1-s01" }) },
      progress: {
        findUnique: vi.fn().mockResolvedValue({ status: "in_progress", attempts: 1 }),
        upsert: vi.fn().mockResolvedValue({ status: "in_progress", attempts: 2 }),
      },
    };
    const res = await request(appWith(db))
      .post("/strikes/l1-s01/attempt")
      .send({ passed: false, code: "x" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "in_progress", attempts: 2, canReveal: true });
    expect(db.progress.upsert.mock.calls[0][0].update.attempts).toBe(2);
  });

  it("GET /streak counts consecutive days", async () => {
    const today = toDateString();
    const db = { streakDay: { findMany: vi.fn().mockResolvedValue([{ date: today }]) } };
    const res = await request(appWith(db)).get("/streak");
    expect(res.body).toEqual({ current: 1, doneToday: true, totalDays: 1 });
  });

  it("POST /cards/:id/review moves a card up a box when I knew it", async () => {
    const db = {
      interviewCard: {
        findUnique: vi.fn().mockResolvedValue({ id: 3, box: 1 }),
        update: vi.fn().mockResolvedValue({ id: 3, box: 2, nextReviewAt: new Date() }),
      },
      streakDay: { upsert: vi.fn().mockResolvedValue({}) },
    };
    const res = await request(appWith(db)).post("/cards/3/review").send({ knew: true });
    expect(res.status).toBe(200);
    expect(db.interviewCard.update.mock.calls[0][0].data.box).toBe(2);
  });
});

describe("streak and spaced repetition helpers", () => {
  it("calculateStreak counts back from today, or from yesterday", () => {
    expect(
      calculateStreak(["2026-03-01", "2026-02-28", "2026-02-27"], "2026-03-01"),
    ).toBe(3);
    expect(calculateStreak(["2026-02-28", "2026-02-27"], "2026-03-01")).toBe(2); // not yet today
    expect(calculateStreak(["2026-02-20"], "2026-03-01")).toBe(0); // streak broken
  });

  it("nextBox goes up on a hit and resets on a miss", () => {
    expect(nextBox(1, true)).toBe(2);
    expect(nextBox(3, true)).toBe(3);
    expect(nextBox(3, false)).toBe(1);
  });

  it("boxes are scheduled 1, 3 and 7 days out", () => {
    const from = new Date(2026, 0, 10, 15, 30);
    expect(nextReviewDate(1, from)).toEqual(new Date(2026, 0, 11));
    expect(nextReviewDate(2, from)).toEqual(new Date(2026, 0, 13));
    expect(nextReviewDate(3, from)).toEqual(new Date(2026, 0, 17));
    expect(isDueToday(new Date(2026, 0, 10, 9), from)).toBe(true);
    expect(isDueToday(new Date(2026, 0, 11), from)).toBe(false);
  });
});
