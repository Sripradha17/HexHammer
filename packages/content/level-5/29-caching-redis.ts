import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s29",
  level: 5,
  order: 29,
  title: "Caching with Redis",
  runner: "server",

  look: `Redis is a real, separate, in-memory key-value store, commonly put in front of a slower database specifically to cache results: "have I already computed this? if so, hand back the saved answer instead of doing the slow work again."

This strike builds the same CONCEPT by hand with a plain in-memory Map, which behaves exactly like a tiny cache would (Redis itself is really a fancier, shared, network-reachable version of this same idea). Every cache entry needs a TTL (time to live): after that much time passes, the entry is treated as gone, even though it is technically still sitting in memory.

  function set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

A cache is only correct if EXPIRED entries are treated as missing. Serving a stale value past its TTL is a real bug, not just an inefficiency — the entire reason a TTL exists is that cached data eventually goes wrong.`,

  type: `Finish get(key):
1. If the key exists AND has not expired yet (Date.now() is still before its expiresAt), return its value.
2. Otherwise (missing, or expired), remove the entry from the store, and return undefined.`,

  break: `Break it on purpose: return the value even when it has expired — just skip the expiresAt check entirely. Now cached values never truly go away: your server would confidently keep serving the SAME stale answer forever, exactly the bug a TTL exists to prevent. Put the expiry check back.`,

  say: `In one sentence: why is serving an expired cache entry a real correctness bug, not just a missed optimization?`,

  starterCode: `import express from "express";

function createCache() {
  const store = new Map();

  function set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  function get(key) {
    // your code here
  }

  return { set, get };
}

export function buildApp() {
  const app = express();
  const cache = createCache();

  app.get("/expensive/:key", (req, res) => {
    const cached = cache.get(req.params.key);
    if (cached !== undefined) {
      res.json({ value: cached, fromCache: true });
      return;
    }
    const computed = req.params.key.toUpperCase(); // pretend this is slow
    cache.set(req.params.key, computed, 100); // cache for 100ms
    res.json({ value: computed, fromCache: false });
  });

  return app;
}
`,

  tests: `test("the first request computes fresh, not from cache", async () => {
  const res = await request(buildApp()).get("/expensive/hello");
  expect(res.body).toEqual({ value: "HELLO", fromCache: false });
});

test("a second request right after IS served from cache", async () => {
  const app = buildApp();
  await request(app).get("/expensive/hello");
  const res = await request(app).get("/expensive/hello");
  expect(res.body).toEqual({ value: "HELLO", fromCache: true });
});

test("after the TTL passes, the cache is empty again and recomputes", async () => {
  const app = buildApp();
  await request(app).get("/expensive/hello"); // cached for 100ms
  await new Promise((resolve) => setTimeout(resolve, 150)); // wait past the ttl
  const res = await request(app).get("/expensive/hello");
  expect(res.body).toEqual({ value: "HELLO", fromCache: false });
});
`,

  hints: [
    "const entry = store.get(key); if (!entry) return undefined;",
    "if (Date.now() >= entry.expiresAt) { store.delete(key); return undefined; }",
    "return entry.value; (only reached once you know the entry exists and has not expired)",
  ],

  solution: `=== CODE ===
import express from "express";

function createCache() {
  const store = new Map();

  function set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  function get(key) {
    const entry = store.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() >= entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  return { set, get };
}

export function buildApp() {
  const app = express();
  const cache = createCache();

  app.get("/expensive/:key", (req, res) => {
    const cached = cache.get(req.params.key);
    if (cached !== undefined) {
      res.json({ value: cached, fromCache: true });
      return;
    }
    const computed = req.params.key.toUpperCase();
    cache.set(req.params.key, computed, 100);
    res.json({ value: computed, fromCache: false });
  });

  return app;
}
=== LINE BY LINE ===
if (!entry) return undefined; handles a key that was never cached at all.
Date.now() >= entry.expiresAt catches a key that WAS cached, but too long ago. store.delete(key) actively removes it (rather than just ignoring it), so the Map does not quietly grow forever with dead entries.
Only after both checks pass do we trust entry.value enough to hand it back — this is the whole contract a cache has to honor: never answer with something you know is stale.`,
};
