// Topic: Caching strategies, eviction and invalidation. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const archCaching: Topic = {
  id: "arch-caching",
  domainId: "",
  moduleId: "",
  title: "Caching: where, what, how long, and how to stop serving stale data",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain the layers where caching happens (browser, CDN, application, database) and what each one saves.",
    "Compare cache-aside, read-through, write-through and write-behind strategies.",
    "Explain eviction (LRU, TTL) and trace an LRU cache's hits and misses by hand.",
    "Choose an invalidation approach and protect against stampedes and stale reads.",
  ],
  prerequisites: ["web-caching-cookies", "cs-hashing"],
  subtopics: ["Cache layers", "Hit rate", "Cache-aside", "Write-through / write-behind", "TTL", "LRU eviction", "Invalidation", "Stampede protection"],
  strikeIds: ["l5-s29", "l5-s11"],

  story:
    "The product page went from 900 ms to 40 ms after adding a cache, and everyone celebrated. A week later, support tickets arrive: customers see old prices for up to an hour, and when the cache restarts at peak time, the database falls over. Caching made reads fast; nobody designed what happens when data changes or the cache is empty.",
  mentalModel: {
    plain:
      "A cache is a small, fast copy of data that is slow or expensive to get. Reads check the copy first (a hit) and only go to the slow source when it is missing (a miss). The hard parts are deciding what to keep when space runs out, and making sure the copy does not lie for too long after the source changes.",
    analogy:
      "A desk drawer next to a big library. You keep the books you use most in the drawer. When the drawer is full, you put back the one you have not touched for longest (LRU). If the library publishes a new edition, the copy in your drawer is out of date until you swap it (invalidation).",
    analogyLimit:
      "A drawer is used by one person. A shared cache is used by many servers at once, so a single miss can trigger hundreds of simultaneous trips to the library (a stampede), and two servers can write different versions of the same book at the same time.",
  },
  lessonSections: [
    {
      heading: "1. Caches everywhere",
      body:
        "Browser cache (Cache-Control headers) saves the whole network trip. A CDN caches near users and saves trips to your servers. An application cache (in-memory or Redis) saves database queries and expensive computations. The database has its own buffer cache. The closer to the user, the bigger the saving and the harder the invalidation.",
    },
    {
      heading: "2. Hit rate is the number that matters",
      body:
        "Hit rate = hits / (hits + misses). A cache with a 20% hit rate still sends 80% of traffic to the slow source and adds a lookup to every request. Caching only pays off for data that is read far more often than it changes, and read by many requests.",
    },
    {
      heading: "3. Strategies for reading and writing",
      body:
        "Cache-aside (the most common): the app checks the cache, and on a miss loads from the database and stores it. Read-through: the cache itself loads on a miss. Write-through: writes go to the cache and the database together, so the cache stays fresh. Write-behind: writes go to the cache and are flushed to the database later; it is fast but can lose data on a crash.",
    },
    {
      heading: "4. Eviction: TTL and LRU",
      body:
        "A TTL (time to live) expires entries after a fixed time: simple, and it bounds staleness. LRU (least recently used) evicts the entry untouched for longest when the cache is full. JavaScript's Map keeps insertion order, so moving a key to the end on each access gives a tiny LRU (see the example).",
    },
    {
      heading: "5. Invalidation: the hard part",
      body:
        "Options: rely on a short TTL (accept bounded staleness); delete the key when the data changes (on write, in the same code path); or publish change events that caches subscribe to. Deleting is usually safer than updating the cached value, because two concurrent updates can leave the cache with the older value.",
    },
    {
      heading: "6. Stampedes and cold starts",
      body:
        "When a hot key expires, every request misses at once and they all hit the database: a cache stampede. Protections: let only one request rebuild the key (a lock or request coalescing), serve slightly stale data while refreshing in the background, and add random jitter to TTLs so many keys do not expire together. Plan for a cold cache after a restart; the database must survive it.",
    },
  ],
  visualizationType: "cache",
  codeExamples: [
    {
      title: "A tiny LRU cache with hit and miss counters",
      language: "js",
      code: `class LruCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.hits = 0;
    this.misses = 0;
  }
  get(key, load) {
    if (this.map.has(key)) {
      const value = this.map.get(key);
      this.map.delete(key);
      this.map.set(key, value); // move to "most recently used"
      this.hits++;
      return value;
    }
    this.misses++;
    const value = load(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value; // Map keeps insertion order
      this.map.delete(oldest);
    }
    return value;
  }
}

const cache = new LruCache(2);
const load = (id) => \`user-\${id}\`;
for (const id of [1, 2, 1, 3, 2, 1]) cache.get(id, load);
console.log({ hits: cache.hits, misses: cache.misses, keys: [...cache.map.keys()] });`,
      expectedOutput: `{ hits: 1, misses: 5, keys: [ 2, 1 ] }`,
      steps: [
        "get 1: miss, cache [1]. get 2: miss, cache [1, 2].",
        "get 1: HIT, and 1 moves to the end: [2, 1].",
        "get 3: miss, cache [2, 1, 3] is over capacity, so evict the oldest (2): [1, 3].",
        "get 2: miss (it was evicted), [1, 3, 2], evict 1: [3, 2].",
        "get 1: miss, [3, 2, 1], evict 3: [2, 1].",
        "Total: 1 hit, 5 misses. A capacity of 2 is too small for this access pattern; with capacity 3 there would be 3 hits.",
        "This output was verified by running the code with Node 22 while writing this lesson.",
      ],
    },
  ],
  practicalApplication:
    "Before adding a cache, write down: which reads are slow, how often the data changes, how stale it may be (ask product, not just engineering), the expected hit rate, and what happens when the cache is empty or down. Then add metrics for hit rate and backend load, so you can prove the cache helps.",
  commonMistakes: [
    { mistake: "Caching without an invalidation plan.", symptom: "Users see old prices, permissions or profile data.", fix: "Decide on TTL and/or delete-on-write before shipping; document the maximum staleness." },
    { mistake: "Caching per-user or rarely-read data in a shared cache.", symptom: "Low hit rate, high memory use, and sometimes data leaking between users if keys are wrong.", fix: "Cache shared, hot data. Include every varying input (user, locale, permissions) in the key." },
    { mistake: "Same TTL for every key, set at the same time.", symptom: "Periodic spikes of database load when many keys expire together.", fix: "Add random jitter to TTLs and protect hot keys from stampedes." },
  ],
  misconceptions: [
    { myth: "Adding a cache always makes things faster.", truth: "Low-hit-rate caches add latency and complexity. Measure the hit rate." },
    { myth: "Updating the cache on write is the same as deleting it.", truth: "Concurrent writers can leave an older value in the cache if they update it out of order; deleting and letting the next read reload is usually safer." },
    { myth: "A cache can replace a database.", truth: "Most caches can evict or lose data at any time. The source of truth must live elsewhere unless the store is explicitly configured for durability." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s29", why: "Add cache-aside caching to a real Express route and prove the second request skips the slow work." },
    { kind: "strike", strikeId: "l5-s11", why: "Use HTTP caching headers so the browser does the caching." },
    { kind: "lab", lab: "cache", task: "Run access patterns through the LRU cache simulator, changing capacity and TTL.", goal: "Reach at least a 60% hit rate on the 'hot products' pattern with the smallest capacity you can." },
    {
      kind: "predict",
      question: {
        id: "arch-caching-p1",
        prompt: "An LRU cache with capacity 2 receives: A, B, C, A. How many hits?",
        choices: ["0", "1", "2", "3"],
        answerIndex: 0,
        explanation: "A miss [A], B miss [A,B], C miss and evicts A [B,C], A miss again (it was evicted). Zero hits.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "arch-caching-k1", prompt: "In cache-aside, who loads data into the cache on a miss?", choices: ["The database", "The application code", "The CDN", "Nobody"], answerIndex: 1, explanation: "The app checks the cache, loads from the source on a miss, and writes the result into the cache.", objective: 1 },
    { id: "arch-caching-k2", prompt: "What is a cache stampede?", choices: ["A cache that is too large", "Many requests missing the same expired key at once and all hitting the source", "A cache with LRU eviction", "Writing to the cache first"], answerIndex: 1, explanation: "A hot key expiring can send a burst of identical expensive queries to the database.", objective: 3 },
  ],
  project: {
    title: "Product catalogue with a measured cache",
    summary: "Put a cache in front of a deliberately slow product API, measure the difference, and make it correct under updates, expiry and restarts.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A product API backed by a database with an artificial 200 ms delay on reads.",
      "Cache-aside caching (in-memory LRU first, then Redis in Docker) with TTL plus jitter.",
      "Delete-on-write invalidation when a product's price changes.",
      "Stampede protection: concurrent misses for the same key trigger only one database read.",
      "A /metrics endpoint exposing hits, misses, hit rate and database reads.",
    ],
    acceptanceCriteria: [
      "A test proves 100 concurrent requests for an uncached product cause exactly 1 database read.",
      "A test proves a price update is visible on the next read (no stale price after the write completes).",
      "A load script shows p95 latency and database reads before and after caching, recorded in the README.",
      "The README states the maximum staleness of each cached field and why it is acceptable.",
    ],
    technologies: ["Node.js", "Express", "Redis (Docker)", "PostgreSQL", "Vitest", "autocannon or k6"],
    milestones: [
      { title: "Slow baseline", done_when: "Latency and database reads are measured without a cache." },
      { title: "Cache-aside", done_when: "Hits and misses are counted and tested." },
      { title: "Correctness", done_when: "Invalidation and stampede tests pass." },
      { title: "Evidence", done_when: "Before/after numbers are documented." },
    ],
    testIdeas: ["Eviction order", "TTL expiry with fake timers", "Concurrent misses", "Cache down: the app still works (slower)"],
    stretchGoals: ["Add stale-while-revalidate: serve the old value while one request refreshes it."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "arch-caching-a1", prompt: "Which cache layer can avoid a network request entirely?", choices: ["Database buffer cache", "Redis application cache", "Browser HTTP cache", "Query plan cache"], answerIndex: 2, explanation: "A fresh browser-cached response needs no request at all.", objective: 0 },
      { id: "arch-caching-a2", prompt: "Which strategy risks losing recent writes if the cache crashes?", choices: ["Cache-aside", "Write-through", "Write-behind", "Read-through"], answerIndex: 2, explanation: "Write-behind acknowledges writes before they reach the database.", objective: 1 },
      { id: "arch-caching-a3", prompt: "LRU, capacity 2, sequence A B A C B. Final contents (oldest first)?", choices: ["[A, B]", "[C, B]", "[A, C]", "[B, C]"], answerIndex: 1, explanation: "A [A], B [A,B], A hit [B,A], C evicts B [A,C], B evicts A [C,B].", objective: 2 },
      { id: "arch-caching-a4", prompt: "Hit rate is 15%. What is the most likely conclusion?", choices: ["The cache is working well", "Most requests still go to the source; the cache may cost more than it saves", "The TTL is too long", "The cache must be made larger, always"], answerIndex: 1, explanation: "Investigate the key design and access pattern before growing the cache; it may be the wrong thing to cache.", objective: 0 },
      { id: "arch-caching-a5", prompt: "Best default for invalidating a cached product after its price changes?", choices: ["Do nothing; wait for the TTL", "Delete the cache key in the same code path as the update", "Restart the cache", "Increase the TTL"], answerIndex: 1, explanation: "Deleting on write makes the next read fetch fresh data; the TTL remains a safety net.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "arch-caching-q01", tags: ["caching", "system-design"], difficulty: "core", kind: "concept", prompt: "What are the main caching strategies, and when would you use each?", expectedElements: ["cache-aside", "read-through", "write-through", "write-behind", "trade-offs: staleness, durability, complexity"], modelAnswer: "Cache-aside: the app reads the cache, falls back to the database and populates the cache. It is simple, the most common, and tolerant of cache failure. Read-through moves that loading logic into the cache layer. Write-through writes to the cache and the database together, keeping the cache fresh at the cost of write latency. Write-behind writes to the cache and flushes to the database asynchronously, which is fast but risks data loss. I default to cache-aside with TTL plus delete-on-write.", explanation: "Give a default and justify it.", commonWrongAnswers: ["There is only one way to cache."] },
    { id: "arch-caching-q02", tags: ["caching", "invalidation"], difficulty: "core", kind: "design", prompt: "How do you keep a cache consistent with the database?", expectedElements: ["TTL bounds staleness", "delete on write", "events/CDC for other caches", "race conditions", "accept some staleness"], modelAnswer: "First agree how much staleness is acceptable. Then combine a TTL, which bounds staleness, with deleting keys whenever the underlying data changes, in the same code path or via change events or CDC for caches owned by other services. Prefer delete over update to avoid races where an older value overwrites a newer one. For data that must never be stale, like balances, read from the source or use versioned keys.", explanation: "Mentioning races and business-defined staleness is strong.", commonWrongAnswers: ["Caches are always consistent."] },
    { id: "arch-caching-q03", tags: ["caching", "incident"], difficulty: "advanced", kind: "scenario", prompt: "Every hour at :00 the database CPU spikes and latency jumps. What do you suspect?", expectedElements: ["synchronized TTL expiry", "stampede", "jitter", "request coalescing", "background refresh"], modelAnswer: "Many cache keys being set with the same TTL at the same time, perhaps by a warm-up job or a deploy, so they all expire together and cause a stampede of misses. Fix it with random jitter on TTLs, request coalescing or locks for hot keys, and background refresh or stale-while-revalidate for the hottest data.", explanation: "Periodic spikes are a classic sign.", commonWrongAnswers: ["Hourly cron job (possible, but check expiry first)."] },
    { id: "arch-caching-q04", tags: ["caching", "data-structures"], difficulty: "core", kind: "implementation", prompt: "How would you implement an LRU cache with O(1) get and put?", expectedElements: ["hash map for lookup", "doubly linked list for recency order", "move to front on access", "evict tail", "JS Map insertion order shortcut"], modelAnswer: "Combine a hash map from key to node with a doubly linked list ordered by recency. get finds the node in O(1) and moves it to the front. put inserts at the front and, when over capacity, removes the tail node and deletes its key from the map. In JavaScript a Map's insertion order lets you approximate this by deleting and re-inserting a key on access and evicting `map.keys().next().value`.", explanation: "A very common coding interview question.", commonWrongAnswers: ["Sort by timestamp on every access (O(n log n))."] },
    { id: "arch-caching-q05", tags: ["caching", "security"], difficulty: "core", kind: "debugging", prompt: "After adding caching, a user briefly sees another user's dashboard. What went wrong?", expectedElements: ["cache key missing user/tenant id", "shared cache of personalised data", "CDN caching private responses", "Cache-Control: private/no-store"], modelAnswer: "The cache key does not include everything that varies the response: user id, tenant, permissions or locale. Or a shared cache such as a CDN cached a personalised response because Cache-Control was not set to private or no-store. Personalised data must include the user in the key, or not be cached in shared layers at all.", explanation: "A real and serious class of incident.", commonWrongAnswers: ["Browser bug."] },
    { id: "arch-caching-q06", tags: ["caching", "trade-offs"], difficulty: "foundation", kind: "concept", prompt: "When should you NOT add a cache?", expectedElements: ["low read/write ratio", "data must be strongly consistent", "low hit rate", "the real problem is a missing index or bad query", "added complexity"], modelAnswer: "When the data changes about as often as it is read, so the hit rate would be low; when it must always be exactly current, such as balances or permissions; when the slowness comes from a fixable cause like a missing index or an N+1 query; and when the added operational complexity and failure modes outweigh the gain.", explanation: "Shows judgement rather than reflex.", commonWrongAnswers: ["Always cache everything."] },
    { id: "arch-caching-q07", tags: ["caching", "cdn"], difficulty: "core", kind: "concept", prompt: "How does a CDN decide whether it can serve a cached response?", expectedElements: ["Cache-Control (public/private, max-age, s-maxage)", "cache key (URL, Vary headers)", "revalidation with ETag", "purge"], modelAnswer: "It follows HTTP caching rules. Cache-Control decides whether the response may be stored in a shared cache (public or private) and for how long (s-maxage or max-age). The cache key is usually the URL plus any headers named in Vary. When an entry is stale, the CDN revalidates with the origin using ETag or Last-Modified. You can also purge explicitly after a deploy or content change.", explanation: "Links HTTP knowledge to architecture.", commonWrongAnswers: ["CDNs cache everything for 24 hours."] },
    { id: "arch-caching-q08", tags: ["caching", "misconception"], difficulty: "foundation", kind: "misconception", prompt: "'Our Redis cache is our database now, so we can drop the Postgres table.' What's wrong with that?", expectedElements: ["eviction", "persistence settings", "source of truth", "recovery"], modelAnswer: "A cache may evict data under memory pressure, and depending on configuration it may lose data on restart. Unless Redis is deliberately configured and operated as a durable primary store, with persistence, replication and backups, removing the source of truth risks permanent data loss.", explanation: "Separate the role (cache) from the technology.", commonWrongAnswers: ["Redis never loses data."] },
  ],
  references: [
    { title: "MDN: HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", kind: "official-docs" },
    { title: "RFC 9111: HTTP Caching", url: "https://www.rfc-editor.org/rfc/rfc9111", kind: "spec" },
    { title: "AWS: Caching best practices", url: "https://aws.amazon.com/caching/best-practices/", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Hit rates, eviction, staleness and invalidation trade-offs."],
  versionSpecific: ["Specific cache products' eviction policies and configuration names."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
