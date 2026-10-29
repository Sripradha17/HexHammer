// CACHE LAB: a real LRU cache (the same Map trick as the lesson) replaying access patterns.
// Hits, misses and evictions are counted for real. Patterns are generated from a fixed seed, so a
// given setting always gives the same result and you can compare fairly.
import { useMemo, useState } from "react";
import { LabFrame, seeded, useGoal, type LabProps } from "./shared";

type Pattern = "hot" | "scan" | "random";

// 300 product views over 60 products.
// hot    = a few best-sellers get most views (roughly Zipf-shaped, like real shops)
// scan   = a report reading every product in order, twice
// random = every product equally likely
export function makePattern(pattern: Pattern): number[] {
  const rand = seeded(42);
  const keys = 60;
  if (pattern === "scan") return Array.from({ length: 300 }, (_, i) => i % keys);
  if (pattern === "random") return Array.from({ length: 300 }, () => Math.floor(rand() * keys));
  const weights = Array.from({ length: keys }, (_, i) => 1 / (i + 1)); // product 0 is the best-seller
  const total = weights.reduce((a, b) => a + b, 0);
  return Array.from({ length: 300 }, () => {
    let r = rand() * total;
    for (let k = 0; k < keys; k++) {
      r -= weights[k];
      if (r <= 0) return k;
    }
    return keys - 1;
  });
}

export function replay(accesses: number[], capacity: number) {
  const cache = new Map<number, true>();
  let hits = 0;
  let evictions = 0;
  for (const key of accesses) {
    if (cache.has(key)) {
      hits++;
      cache.delete(key);
      cache.set(key, true); // most recently used goes to the end
      continue;
    }
    cache.set(key, true);
    if (cache.size > capacity) {
      cache.delete(cache.keys().next().value!); // evict the least recently used (the first key)
      evictions++;
    }
  }
  return { hits, misses: accesses.length - hits, evictions, hitRate: hits / accesses.length, contents: [...cache.keys()] };
}

export default function CacheLab({ onGoal }: LabProps) {
  const [pattern, setPattern] = useState<Pattern>("hot");
  const [capacity, setCapacity] = useState(4);
  const accesses = useMemo(() => makePattern(pattern), [pattern]);
  const r = useMemo(() => replay(accesses, capacity), [accesses, capacity]);
  const goal = useGoal(pattern === "hot" && r.hitRate >= 0.6, `Hot pattern: ${Math.round(r.hitRate * 100)}% hit rate with capacity ${capacity}.`, onGoal);

  return (
    <LabFrame title="LRU cache" note="A real LRU cache replays 300 product views (generated from a fixed seed). Change the pattern and the capacity; everything is recomputed." goalMet={goal}>
      <div className="lab__controls" role="group" aria-label="Access pattern">
        {(["hot", "scan", "random"] as Pattern[]).map((p) => (
          <button key={p} type="button" className="hh-chip" aria-pressed={p === pattern} onClick={() => setPattern(p)}>
            {p === "hot" ? "Hot products" : p === "scan" ? "Full scan" : "Uniform random"}
          </button>
        ))}
      </div>
      <label className="lab__field">
        Cache capacity: {capacity} of 60 products
        <input type="range" min={1} max={60} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
      </label>
      <div className="stat-row" aria-live="polite">
        <p><span className="stat-row__big">{Math.round(r.hitRate * 100)}%</span> hit rate</p>
        <p><span className="stat-row__big">{r.hits}</span> hits</p>
        <p><span className="stat-row__big">{r.misses}</span> misses (database reads)</p>
        <p><span className="stat-row__big">{r.evictions}</span> evictions</p>
      </div>
      <p className="muted">Cache after the run (least to most recently used): {r.contents.map((k) => `#${k}`).join(" ")}</p>
      <p className="muted">
        Try "Full scan" with capacity 59: a scan of 60 keys through a 59-slot LRU evicts each key just before it is needed again, giving a 0% hit rate. That is why
        databases protect their buffer caches from big scans.
      </p>
    </LabFrame>
  );
}
