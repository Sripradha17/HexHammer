import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s34",
  level: 5,
  order: 34,
  title: "NoSQL modeling concepts",
  runner: "worker",

  look: `Everything you have modeled this level has been RELATIONAL: separate tables, joined together, each fact stored exactly once (normalization, a few strikes back). A document database (like MongoDB) often makes the OPPOSITE trade on purpose: EMBED related data directly inside one document, duplicating it, to avoid needing a join at read time at all.

  // Relational: normalized, no duplication, needs a JOIN to read together
  customers(id, name)
  orders(id, customer_id, item)

  // Document: embedded, some duplication, ONE read gets everything
  { orderId: 100, customerName: "Alice", item: "Widget" }

Embedding is a good trade when the embedded data is almost always read TOGETHER and rarely changes on its own (an order's shipping address at the time it was placed, say). It is a BAD trade when the embedded data changes independently and needs to stay in sync everywhere it was copied — exactly the risk normalization exists to avoid.`,

  type: `Fill in the answers object:
  embeddingGoodFor   pick a, b or c: embedding data directly in a document is a good trade when...
  embeddingRisk      pick a, b or c: what risk does embedding reintroduce, that normalization was built to avoid?
  bothApproaches     write one word: is it true that EVERY real app must pick either "relational" or "document" and use only that one? (yes or no)`,

  break: `Try it for real, for free: pick any app you use daily (a shopping site, a chat app) and think about one piece of data it shows you that was probably embedded at write time (a comment's author name shown next to it) versus one that was probably looked up fresh (your current account balance). Which would you rather have instantly duplicated everywhere, and which would you never want to risk going stale?`,

  say: `In one sentence: what is the actual trade a document database makes when it embeds related data, instead of referencing it?`,

  starterCode: `// Strike 34: NoSQL modeling concepts.

// embeddingGoodFor: embedding data directly in a document is a good trade when...
//   a) the embedded data changes constantly and independently
//   b) the embedded data is almost always read TOGETHER with its parent, and rarely changes on its own
//   c) you want to guarantee every copy always matches exactly

// embeddingRisk: what risk does embedding reintroduce, that normalization was built to avoid?
//   a) slower reads
//   b) the same fact, copied in multiple places, going out of sync with itself
//   c) needing a JOIN

const answers = {
  embeddingGoodFor: "",
  embeddingRisk: "",
  bothApproaches: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("embeddingGoodFor", () => {
  if (said(answers.embeddingGoodFor) !== "b") {
    throw new Error("Embedding data directly in a document is a good trade when...? (a, b or c)");
  }
});

test("embeddingRisk", () => {
  if (said(answers.embeddingRisk) !== "b") {
    throw new Error("What risk does embedding reintroduce? (a, b or c)");
  }
});

test("bothApproaches", () => {
  if (said(answers.bothApproaches) !== "no") {
    throw new Error('Write one word: yes or no. Must every real app pick only ONE of relational or document, forever?');
  }
});
`,

  hints: [
    "embeddingGoodFor: think about data that is basically a snapshot, taken once, rarely revisited on its own.",
    "embeddingRisk: this is the exact opposite trade from normalization, so it reintroduces the exact opposite risk.",
    'bothApproaches: write the single word: no — plenty of real systems genuinely use both, for different pieces of data.',
  ],

  solution: `=== CODE ===
const answers = {
  embeddingGoodFor: "b",
  embeddingRisk: "b",
  bothApproaches: "no",
};
=== LINE BY LINE ===
embeddingGoodFor is b: embedding pays off exactly when the data is read TOGETHER constantly and rarely needs to change independently — the cost of occasional duplication is smaller than the cost of a join on every single read.
embeddingRisk is b: the SAME fact living in more than one place can drift out of sync — the identical risk normalization was designed to eliminate, just reintroduced on purpose, in exchange for faster reads.
bothApproaches is "no": relational and document modeling are tools for different jobs, and plenty of real systems genuinely use both, for different pieces of data, rather than forcing everything into one model.`,
};
