// Topic: Hashing and hash maps. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csHashing: Topic = {
  id: "cs-hashing",
  domainId: "",
  moduleId: "",
  title: "Hashing and hash maps",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain how a hash map gives average O(1) lookups, and what collisions and resizing cost.",
    "Use Map and Set to solve counting, grouping and de-duplication problems.",
    "Choose between Map and a plain object, and know what makes a good key.",
  ],
  prerequisites: ["cs-big-o"],
  subtopics: ["Hash functions", "Buckets and collisions", "Load factor and resizing", "Map vs object", "Set for membership", "Counting and grouping", "Two-sum style lookups"],
  strikeIds: ["l2-s15", "dsa-s03"],

  story:
    "An importer checks each new customer's email against the existing list with `includes`. With 500 customers it is instant; with 200,000 it takes eleven minutes, and the job times out every night. Swapping the array for a Set brings it under a second. Hash maps are the single most useful data structure in practical programming and in coding interviews, because they turn 'search everything' into 'go straight there'.",
  mentalModel: {
    plain:
      "A hash map stores key-value pairs in an array of buckets. A hash function turns each key into a number that says which bucket to use. To look a key up, hash it and go straight to that bucket instead of searching everything. Two keys landing in the same bucket is a collision; buckets can hold several entries, and the table grows when it gets too full.",
    analogy:
      "A cloakroom. You hand over your coat and get ticket 47; when you come back, the attendant walks straight to hook 47, no searching. The hash function is how the ticket number is chosen. If two coats get the same number, they share a hook and the attendant checks the two coats on it: a collision.",
    analogyLimit:
      "A real cloakroom gives each person a unique number on purpose. A hash function cannot promise that for all possible keys, so collisions are normal and must be handled.",
  },
  lessonSections: [
    {
      heading: "1. From key to bucket",
      body:
        "A hash function takes a key (a string, a number) and produces an integer. Taking that integer modulo the number of buckets picks a bucket.\n\nA good hash function is fast, always gives the same output for the same key, and spreads keys evenly. Equal keys must always hash to the same bucket, or lookups fail.",
    },
    {
      heading: "2. Collisions and load factor",
      body:
        "With more possible keys than buckets, collisions are unavoidable. Common fixes: each bucket holds a small list of entries (chaining), or the table probes for the next free slot (open addressing).\n\nThe load factor is entries ÷ buckets. When it gets high (often around 0.75), the table doubles its buckets and rehashes everything. That single step is O(n), but it is rare enough that inserts stay O(1) on average (amortised).",
    },
    {
      heading: "3. Average O(1), worst O(n)",
      body:
        "With a decent hash function and resizing, get, set, has and delete are O(1) on average. In the worst case (every key in one bucket, for example a broken hash or a deliberate attack), they degrade to O(n).\n\nHash maps do NOT keep keys sorted. If you need order by key or range queries, use a sorted structure or a tree instead.",
    },
    {
      heading: "4. Map, Set and plain objects",
      body:
        "`Map` is the real hash map: any value can be a key (objects too), it keeps insertion order, has `.size`, and does not mix your data with inherited properties.\n\n`Set` stores unique values: perfect for 'have I seen this?' and de-duplication (`[...new Set(list)]`).\n\nPlain objects work for fixed, string-keyed records, but every key becomes a string ({ 1: x } and { \"1\": x } are the same key), and names like `constructor` or `__proto__` can collide with inherited properties.",
    },
    {
      heading: "5. The patterns you will use every week",
      body:
        "Count: `counts.set(word, (counts.get(word) ?? 0) + 1)`.\nGroup: a Map from category to an array of items.\nIndex: build `byId = new Map(users.map(u => [u.id, u]))` once, then look up in O(1) instead of `find` inside a loop.\nComplement lookup (two-sum): for each number, check whether `target - number` was already seen.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example builds a tiny hash table by hand and prints which bucket each key lands in, collisions included, which shows the mechanism more honestly than an animation.",
  codeExamples: [
    {
      title: "A tiny hash table, then the everyday patterns",
      language: "js",
      code: `function hash(key, buckets) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % buckets;
  return h;
}
for (const name of ["ada", "bob", "cy", "dee"]) console.log(name, "-> bucket", hash(name, 4));

// Count words
const words = "the cat and the hat and the bat".split(" ");
const counts = new Map();
for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
console.log(counts.get("the"), counts.size);

// Two-sum: indexes of two numbers that add up to target, in one pass
function twoSum(nums, target) {
  const seen = new Map();             // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return null;
}
console.log(twoSum([8, 3, 11, 5], 16), [...new Set([3, 1, 3, 2, 1])]);`,
      expectedOutput: `ada -> bucket 2
bob -> bucket 1
cy -> bucket 2
dee -> bucket 0
3 5
[ 2, 3 ] [ 3, 1, 2 ]`,
      steps: [
        "The hash function mixes each character into a number and keeps it within 4 buckets. 'ada' and 'cy' both land in bucket 2: a collision, which a real table handles by keeping both entries in that bucket.",
        "Counting: each word's count is read (or 0 if new) and increased by one. 'the' appears 3 times, and there are 5 different words.",
        "Two-sum with target 16: at 8 we need 8 (not seen yet), at 3 we need 13, at 11 we need 5. At 5 we need 11, which was seen at index 2, so the answer is [2, 3], found in a single pass.",
        "new Set keeps the first copy of each value, in insertion order, so [3, 1, 3, 2, 1] becomes [3, 1, 2].",
      ],
    },
  ],
  practicalApplication:
    "Any time you see `find`, `includes` or `indexOf` inside a loop over large data, build a Map or Set first. Index records by id once per request. Count and group with Map. De-duplicate with Set. Caches are hash maps with an eviction policy. Database indexes and hash joins are the same idea at scale. In interviews, 'can you do it in one pass with a hash map?' is the most common optimisation follow-up.",
  commonMistakes: [
    {
      mistake: "Calling includes or find inside a loop over big arrays.",
      symptom: "Code that is instant in tests takes minutes on real data (O(n²)).",
      fix: "Build a Set or Map once (O(n)), then look up in O(1).",
    },
    {
      mistake: "Using objects as keys in a plain object.",
      symptom: "Every object key becomes the string \"[object Object]\", so all entries overwrite each other.",
      fix: "Use a Map, which keeps object keys by identity.",
    },
    {
      mistake: "Expecting a Map lookup to match a different object with the same contents.",
      symptom: "map.get({ id: 1 }) returns undefined even though you set({ id: 1 }, ...).",
      fix: "Object keys compare by identity. Use a primitive key such as the id or a string.",
    },
  ],
  misconceptions: [
    { myth: "Hash map lookups are always O(1).", truth: "They are O(1) on average; heavy collisions make them O(n) in the worst case." },
    { myth: "A Map keeps keys sorted.", truth: "Map keeps INSERTION order, not sorted order. Sort the keys yourself when you need them sorted." },
    { myth: "Objects and Maps are interchangeable.", truth: "Objects stringify keys and inherit properties; Map takes any key, has size, and is designed for frequent adds and deletes." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s15", why: "Use Map and Set by hand for counting and de-duplication." },
    { kind: "strike", strikeId: "dsa-s03", why: "Solve interview-style problems in one pass with a hash map." },
    {
      kind: "predict",
      question: {
        id: "cs-hashing-p1",
        prompt: "What does this print?",
        code: `const obj = {};
const a = { id: 1 }, b = { id: 2 };
obj[a] = "first";
obj[b] = "second";
const map = new Map([[a, "first"], [b, "second"]]);
console.log(obj[a], map.get(a));`,
        choices: ["first first", "second first", "first second", "undefined first"],
        answerIndex: 1,
        explanation: "Plain objects turn keys into strings: both a and b become \"[object Object]\", so the second assignment overwrites the first. Map keys are kept as the objects themselves.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-hashing-k1",
      prompt: "What is a hash collision?",
      choices: ["Two keys with the same value", "Two different keys mapping to the same bucket", "A key that cannot be hashed", "A crash during lookup"],
      answerIndex: 1,
      explanation: "Collisions are normal; the table stores both entries in that bucket (or probes elsewhere).",
      objective: 0,
    },
    {
      id: "cs-hashing-k2",
      prompt: "Fastest way to remove duplicates from an array of 100,000 strings?",
      choices: ["filter with indexOf", "Nested loops", "[...new Set(arr)]", "Sort then compare neighbours"],
      answerIndex: 2,
      explanation: "A Set keeps one copy of each value in O(n) total. filter with indexOf is O(n²).",
      objective: 1,
    },
  ],
  project: {
    title: "Build Your Own HashMap",
    summary: "Implement a hash map from scratch with chaining, resizing and iteration, then prove its behaviour against JavaScript's Map with randomised tests and measure how collisions affect speed.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "A class with set, get, has, delete and size, using an array of buckets and chaining.",
      "Resize (double buckets and rehash) when the load factor passes 0.75.",
      "Iterate entries in insertion order, like Map.",
      "A deliberately bad hash function option to show collisions degrading performance.",
    ],
    acceptanceCriteria: [
      "A randomised test performs 10,000 mixed operations on both your map and Map and checks they always agree.",
      "A test shows the bucket count doubles when the load factor passes 0.75.",
      "A benchmark shows lookups slow down dramatically with the bad hash function.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Basic map", done_when: "set/get/has/delete work with a fixed number of buckets." },
      { title: "Resize", done_when: "Rehashing on high load factor is tested." },
      { title: "Agreement", done_when: "Randomised comparison with Map passes." },
      { title: "Collisions", done_when: "The bad-hash benchmark and an explanation are in the README." },
    ],
    testIdeas: ["Overwrite an existing key", "Delete a missing key", "Keys that collide"],
    stretchGoals: ["Open addressing instead of chaining", "Use it to solve two-sum and group-anagrams"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-hashing-a1",
        prompt: "Why is a hash map lookup fast on average?",
        choices: [
          "It keeps keys sorted for binary search",
          "The hash of the key points straight to a bucket, so it does not search everything",
          "It caches the last key",
          "It uses multiple threads",
        ],
        answerIndex: 1,
        explanation: "Hashing turns the key into a bucket position directly, so only that bucket's few entries are checked.",
        objective: 0,
      },
      {
        id: "cs-hashing-a2",
        prompt: "What happens when a hash table's load factor gets too high?",
        choices: ["It refuses new keys", "It resizes to more buckets and rehashes the entries", "It deletes old keys", "It switches to linear search"],
        answerIndex: 1,
        explanation: "Resizing keeps buckets short. The occasional O(n) resize averages out to O(1) per insert.",
        objective: 0,
      },
      {
        id: "cs-hashing-a3",
        prompt: "Which finds whether any two numbers in a list add up to a target in O(n)?",
        choices: [
          "Check every pair with two loops",
          "For each number, check a Set of numbers seen so far for (target - number)",
          "Sort, then check every pair",
          "Use includes inside a loop",
        ],
        answerIndex: 1,
        explanation: "One pass with O(1) Set lookups. Pairs or includes-in-a-loop are O(n²).",
        objective: 1,
      },
      {
        id: "cs-hashing-a4",
        prompt: "You need a dictionary keyed by DOM elements. What do you use?",
        choices: ["A plain object", "A Map (or WeakMap)", "An array", "A JSON string"],
        answerIndex: 1,
        explanation: "Map keeps object keys by identity. A plain object would turn every element into the same string key.",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-hashing-q01", tags: ["hash-map"], difficulty: "core", kind: "concept",
      prompt: "How does a hash map work internally?",
      expectedElements: ["array of buckets", "hash function maps key to index", "collision handling: chaining/open addressing", "load factor and resizing", "average O(1), worst O(n)"],
      modelAnswer: "It is an array of buckets. A hash function turns each key into an integer, and that modulo the array size picks the bucket. Different keys can collide in one bucket, handled by chaining a small list per bucket or by probing for another slot. When entries divided by buckets, the load factor, passes a threshold, the table doubles and rehashes everything. So operations are O(1) on average and O(n) in the worst case.",
      explanation: "Five elements, all present, is a top answer.",
      commonWrongAnswers: ["It sorts the keys and binary searches."],
    },
    {
      id: "cs-hashing-q02", tags: ["two-sum"], difficulty: "foundation", kind: "implementation",
      prompt: "Solve two-sum: return indexes of two numbers that add to a target. Explain the complexity.",
      expectedElements: ["map value to index", "check complement before inserting", "O(n) time, O(n) space", "vs O(n²) brute force"],
      modelAnswer: "I walk the array once with a Map from value to index. For each number I compute target minus it; if that complement is already in the map, I return its index and the current one. Otherwise I store the current number. Checking before inserting stops a number pairing with itself. It is O(n) time and O(n) space, compared with O(n²) for checking every pair.",
      explanation: "The most famous interview question.",
      commonWrongAnswers: ["Two nested loops (without mentioning the optimisation)."],
    },
    {
      id: "cs-hashing-q03", tags: ["map", "object"], difficulty: "foundation", kind: "concept",
      prompt: "Map or plain object: when do you use each?",
      expectedElements: ["Map: any key type, size, frequent add/delete, no prototype keys", "object: fixed record shape, JSON-friendly", "key coercion to string"],
      modelAnswer: "I use a Map for dynamic dictionaries: keys of any type including objects, frequent adds and deletes, an easy size, guaranteed insertion-order iteration and no risk of colliding with inherited keys. I use a plain object for records with a known shape, like a user with name and email, especially since it serialises to JSON directly. Objects convert keys to strings, which is a common source of bugs.",
      explanation: "Dictionary versus record is the clean distinction.",
      commonWrongAnswers: ["They are the same."],
    },
    {
      id: "cs-hashing-q04", tags: ["hashing", "patterns"], difficulty: "core", kind: "implementation",
      prompt: "How would you group a list of words into anagrams?",
      expectedElements: ["canonical key: sorted letters or letter counts", "Map from key to list", "O(n · k log k)", "return values"],
      modelAnswer: "For each word I compute a canonical key that is the same for all its anagrams, such as its letters sorted ('eat' and 'tea' both become 'aet'), or a 26-letter count signature. I use a Map from that key to an array and push each word into its group, then return the map's values. With sorting it is O(n · k log k) for n words of length k; the count signature makes it O(n · k).",
      explanation: "Choosing a canonical key is the transferable idea.",
      commonWrongAnswers: ["Compare every pair of words."],
    },
    {
      id: "cs-hashing-q05", tags: ["hashing", "security"], difficulty: "advanced", kind: "concept",
      prompt: "What is a hash flooding attack?",
      expectedElements: ["attacker crafts keys that collide", "lookups degrade to O(n)", "server DoS", "randomised/seeded hash functions"],
      modelAnswer: "If an attacker can predict the hash function, they can send many keys that all land in the same bucket, for example as JSON fields or query parameters. Every insert and lookup then becomes O(n), so parsing one request can take seconds and tie up the server. Modern runtimes defend with hash functions seeded randomly per process, so collisions cannot be predicted.",
      explanation: "Shows awareness of worst-case behaviour in practice.",
      commonWrongAnswers: ["Hash maps cannot be attacked."],
    },
    {
      id: "cs-hashing-q06", tags: ["performance"], difficulty: "foundation", kind: "debugging",
      prompt: "This merge of users and orders is slow for large data. Improve it.",
      code: `const result = orders.map((o) => ({ ...o, user: users.find((u) => u.id === o.userId) }));`,
      expectedElements: ["find inside map is O(n × m)", "build Map by id once", "O(n + m)"],
      modelAnswer: "find scans the whole users array for every order, so it is O(orders × users). Build an index once, const byId = new Map(users.map((u) => [u.id, u])), then use byId.get(o.userId) inside the map. That is O(users + orders).",
      explanation: "The single most common real-world hash map refactor.",
      commonWrongAnswers: ["Use a for loop instead of map."],
    },
    {
      id: "cs-hashing-q07", tags: ["set"], difficulty: "foundation", kind: "concept",
      prompt: "When would you use a Set?",
      expectedElements: ["unique values", "fast membership checks", "de-duplication", "visited tracking in graphs"],
      modelAnswer: "Whenever I care about whether something is present, not how many times: de-duplicating a list, checking membership in O(1) such as allowed roles or blocked ids, and tracking visited nodes in graph traversal or seen items while streaming data.",
      explanation: "Three or four concrete uses.",
      commonWrongAnswers: ["To sort values."],
    },
    {
      id: "cs-hashing-q08", tags: ["hash-functions"], difficulty: "core", kind: "concept",
      prompt: "What makes a good hash function for a hash table, and how is that different from a cryptographic hash?",
      expectedElements: ["fast, deterministic, uniform spread", "equal keys equal hashes", "crypto: collision/preimage resistance, slower", "SHA-256 vs table hash"],
      modelAnswer: "For a hash table, the function must be deterministic, very fast, spread keys evenly over buckets, and give equal keys equal hashes. A cryptographic hash like SHA-256 additionally makes it practically impossible to find two inputs with the same hash or to reverse it, which costs speed. Tables want speed and spread; security uses want resistance. Password storage needs yet another kind: deliberately slow hashes like bcrypt or Argon2.",
      explanation: "Distinguishing the three families is impressive.",
      commonWrongAnswers: ["Use SHA-256 for hash maps."],
    },
  ],
  references: [
    { title: "MDN: Map", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", kind: "official-docs" },
    { title: "MDN: Set", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set", kind: "official-docs" },
    { title: "Introduction to Algorithms (CLRS), ch. 11: Hash Tables", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Hash tables, collisions and amortised resizing are the same in every language."],
  versionSpecific: ["Map/Set ordering guarantees and object key coercion are JavaScript-specific."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
