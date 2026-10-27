# Curriculum guide: the Atlas

The Atlas is the 16-domain curriculum in `packages/content/atlas/`. It sits **on top of** the classic strikes (Levels 1–6, DSA, Professional). A topic links to strikes for its hand-typed exercises; it never copies them.

```
atlas/
  types.ts          the schema (Domain, Module, Topic, questions, projects, glossary)
  outline.ts        helpers: outline() for unwritten topics, defineDomain()
  domains/d01-…ts   one file per domain: modules and their topics
  topics/*.ts       fully written topics (one file each)
  glossary.ts       the developer glossary
  validate.ts       the audit (18 required parts, links, cycles, alignment, placeholders)
  validate.test.ts  proves the audit catches each kind of problem
```

## Current status

Run `npm run curriculum:check` to regenerate [`docs/curriculum/coverage-report.md`](curriculum/coverage-report.md). At the time of writing:

- **16 of 16 domains** with **59 modules** and **270 topics**.
- **17 topics complete.** Every part is written, validated and visible in the app. At least one is complete in 15 of the 16 domains; Domain 16 (Advanced Paths) is outline only.
- **253 outline topics.** Each has a title, learning objectives, prerequisites and linked strikes, but no lesson yet. The app labels them "Outline: lesson not written yet".
- **143 interview questions** with model answers. The target is 15 per topic, so every complete topic is still *below* target (8–10 each). The report lists them.
- **90 glossary terms**, each linked to the topics that teach it.
- **129 of 130 classic strikes** are linked from Atlas topics.

**This curriculum is not complete.** The backlog in the coverage report is the honest to-do list.

## The topic schema (Part 7 of the brief)

Each complete topic must pass all 18 parts, checked by `TOPIC_PARTS` in `validate.ts`:

1. story;
2. ≥ 2 learning objectives;
3. prerequisites;
4. mental model with an analogy *and* its limits;
5. a lab or visual (or an honest `visualNote` explaining why none fits);
6. worked examples;
7. expected output and ≥ 2 execution steps each;
8. practical application;
9. ≥ 2 common mistakes;
10. ≥ 2 exercises, at least one hands-on;
11. a project;
12. ≥ 3 acceptance criteria;
13. knowledge checks plus an assessment of ≥ 3 questions;
14. ≥ 8 interview questions with model answers;
15. ≥ 2 misconceptions;
16. a review plan with growing gaps;
17. mastery criteria the topic can actually satisfy;
18. ≥ 2 https references.

On top of those parts, the audit also checks:
- unique ids across topics and questions;
- every prerequisite, strike and glossary link exists;
- no prerequisite loops;
- every objective is assessed by at least one question;
- the project covers real objectives;
- answer indexes are valid;
- no placeholder text (TODO, TBD, "coming soon", lorem ipsum).

## The charter rules in content

- **No exercise carries a solution.** Coding exercises are links to strikes, which keep their starter code, tests, three hints and gated reveal. A test fails if an exercise object has a `solution` field.
- Worked examples **illustrate**; they are deliberately not the answer to any linked strike. For example, the middleware lesson traces an existing pipeline rather than writing the auth middleware that strike `l5-s06` asks for. The SQL lesson uses authors/books, not the strikes' customers/orders.
- Every worked example's "expected output" was **produced by running it** while writing (Node 22 or pg-mem). The lesson says so where it matters.
- Model answers exist for interview questions, but the app reveals them only after you have committed your own answer.

## How to write a new complete topic

1. Copy an existing `topics/*.ts` file. `cs-binary-encoding.ts` is a compact model.
2. Replace the matching `outline({...})` call in its domain file with an import of your topic.
3. Run the examples for real and paste the real output.
4. Run `npm run curriculum:check` and fix every error. A topic marked `stage: "complete"` that misses any part **fails the audit**.
5. Set `lastReviewedAt` to today. The quarterly curriculum audit job flags topics not reviewed for 91 days.

## Choosing the next topics to write (suggested order)

1. Raise the 17 complete topics to 15 interview questions each (the cheapest wins).
2. Outline topics that already have strikes. The hands-on part exists, so they are closest to complete. For example: `cs-functions-scope`, `fe-react-components-state`, `be-authn-authz`, `db-transactions`, `cs-git`.
3. One complete topic in Domain 16.
4. Then work through the domains in map order.
