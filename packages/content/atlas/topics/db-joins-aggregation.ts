// Topic: Joins, grouping and aggregation. A COMPLETE topic.
// NOTE (charter): the worked example uses authors/books, NOT the customers/orders tables of the
// Level 5 SQL strikes, so it never gives away a strike's answer.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const dbJoinsAggregation: Topic = {
  id: "db-joins-aggregation",
  domainId: "",
  moduleId: "",
  title: "Joins, GROUP BY and the rows you did not expect",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain INNER JOIN and LEFT JOIN by describing exactly which rows each one keeps.",
    "Write GROUP BY queries with aggregates, and explain the difference between WHERE and HAVING.",
    "Spot the two classic join bugs: COUNT(*) after a LEFT JOIN, and row multiplication (fan-out) from joining two one-to-many tables.",
    "Explain why join columns (foreign keys) usually need an index.",
  ],
  prerequisites: ["db-relational-basics"],
  subtopics: ["INNER, LEFT, RIGHT, FULL joins", "Join conditions", "GROUP BY and aggregates", "WHERE vs HAVING", "NULLs in aggregates", "Fan-out", "Indexes on foreign keys"],
  strikeIds: ["l5-s22", "l5-s23", "l5-s27"],

  story:
    "The weekly report says 'every author published at least one book'. That is false: three authors published nothing. The query used COUNT(*) after a LEFT JOIN, so authors with no books were counted as 1. Nobody noticed for months, because the SQL ran without any error.",
  mentalModel: {
    plain:
      "A join builds new rows by pairing rows from two tables wherever the ON condition is true. INNER JOIN keeps only the pairs that matched. LEFT JOIN keeps every row from the left table, and fills the right side with NULLs when nothing matched. GROUP BY then folds rows that share a value into one row per group, and aggregates (COUNT, SUM, AVG) summarise each group.",
    analogy:
      "Two stacks of cards, authors and books. A join walks through them and staples together every author card with every book card that has that author's id. INNER JOIN throws away authors with nothing stapled. LEFT JOIN keeps them, stapled to a blank card.",
    analogyLimit:
      "Real databases do not physically compare every pair. The query planner picks a strategy (nested loop, hash join, merge join) and uses indexes, so the stapling picture explains the RESULT, not how fast it is computed.",
  },
  lessonSections: [
    {
      heading: "1. INNER JOIN keeps only matches",
      body:
        "`SELECT a.name, b.title FROM authors a JOIN books b ON b.author_id = a.id` returns one row per matching (author, book) pair. An author with no books does not appear at all; neither does a book whose author_id matches no author.",
    },
    {
      heading: "2. LEFT JOIN keeps every left row",
      body:
        "`FROM authors a LEFT JOIN books b ON b.author_id = a.id` keeps every author. When an author has no books, the `b.*` columns are NULL in that row. This is how you answer 'show everyone, including people with nothing'.\n\nCareful: a condition on `b` in the WHERE clause (`WHERE b.year > 2000`) removes those NULL rows again, silently turning it back into an inner join. Put such conditions in the ON clause instead.",
    },
    {
      heading: "3. GROUP BY folds rows into groups",
      body:
        "`GROUP BY a.name` makes one output row per author. Every selected column must either be in the GROUP BY or be inside an aggregate: Postgres refuses `SELECT a.name, b.title ... GROUP BY a.name` because there are many titles per name and it cannot pick one.",
    },
    {
      heading: "4. COUNT(*) vs COUNT(column)",
      body:
        "`COUNT(*)` counts rows. `COUNT(b.id)` counts rows where b.id is NOT NULL. After a LEFT JOIN, an author with no books still has one row (with NULLs), so COUNT(*) says 1 while COUNT(b.id) correctly says 0.",
    },
    {
      heading: "5. WHERE filters rows, HAVING filters groups",
      body:
        "WHERE runs before grouping, on individual rows. HAVING runs after grouping, on the groups, so it can use aggregates: `HAVING COUNT(b.id) >= 2` keeps authors with at least two books. You cannot write `WHERE COUNT(...)`.",
    },
    {
      heading: "6. Fan-out: when joins multiply rows",
      body:
        "Join authors to books (one-to-many) AND to awards (one-to-many) in one query, and an author with 3 books and 2 awards produces 3 × 2 = 6 rows. Now SUM(book.pages) is doubled. Fix: aggregate each child table separately (subqueries or CTEs) and then join the summaries.",
    },
    {
      heading: "7. Joins and indexes",
      body:
        "Postgres automatically indexes primary keys but NOT foreign key columns. Joining or filtering on an unindexed `books.author_id` can force a full scan of books. Adding an index on foreign keys you join on is one of the most common and effective performance fixes.",
    },
  ],
  visualizationType: "sql-join",
  codeExamples: [
    {
      title: "Counting books per author, including authors with none",
      language: "sql",
      code: `CREATE TABLE authors (id int PRIMARY KEY, name text);
CREATE TABLE books (id int PRIMARY KEY, author_id int REFERENCES authors(id), title text);
INSERT INTO authors VALUES (1,'Ada'), (2,'Grace'), (3,'Linus');
INSERT INTO books VALUES (10,1,'Notes'), (11,1,'Engines'), (12,2,'Compilers');

SELECT a.name, COUNT(b.id) AS book_count
FROM authors a
LEFT JOIN books b ON b.author_id = a.id
GROUP BY a.name
ORDER BY a.name;`,
      expectedOutput: ` name  | book_count
-------+-----------
 Ada   |          2
 Grace |          1
 Linus |          0`,
      steps: [
        "The LEFT JOIN produces 4 rows: Ada+Notes, Ada+Engines, Grace+Compilers, and Linus+NULL (no books).",
        "GROUP BY a.name folds them into 3 groups: Ada (2 rows), Grace (1 row), Linus (1 row).",
        "COUNT(b.id) ignores NULLs, so Linus's group counts 0.",
        "With COUNT(*) instead, Linus would show 1: the bug from the story.",
        "These results were checked by running the query against pg-mem (an in-memory Postgres emulator) while writing this lesson.",
      ],
    },
  ],
  practicalApplication:
    "Before trusting any report query, test it with an 'edge row': a parent with zero children, and a parent with many children in two related tables. If the counts or sums change unexpectedly, you have a COUNT(*) or fan-out bug. Then run EXPLAIN on the real database to check that the join columns use an index.",
  commonMistakes: [
    { mistake: "COUNT(*) after a LEFT JOIN.", symptom: "Parents with no children are counted as 1.", fix: "Count a column from the right table, e.g. COUNT(b.id)." },
    { mistake: "Filtering the right table in WHERE after a LEFT JOIN.", symptom: "Rows with no match disappear; the LEFT JOIN behaves like an INNER JOIN.", fix: "Move the condition into the ON clause." },
    { mistake: "Joining two one-to-many tables and summing.", symptom: "Totals are multiplied (doubled, tripled) for some rows.", fix: "Aggregate each child table separately, then join the results." },
  ],
  misconceptions: [
    { myth: "A join without errors returns the right rows.", truth: "A wrong ON condition usually returns zero rows or too many rows, silently. Always check row counts against expectations." },
    { myth: "Foreign keys are indexed automatically.", truth: "In Postgres only primary keys and unique constraints get indexes automatically. Foreign key columns need an explicit index." },
    { myth: "HAVING is just another way to write WHERE.", truth: "WHERE filters rows before grouping; HAVING filters groups after aggregation. They run at different stages." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s22", why: "Write a real JOIN, run against a throwaway in-memory database and checked by tests." },
    { kind: "strike", strikeId: "l5-s23", why: "Write a real GROUP BY with SUM, checked by tests." },
    { kind: "lab", lab: "sql-join", task: "Switch between INNER and LEFT joins and COUNT(*) vs COUNT(column) in the join explorer.", goal: "Produce a result where every author appears exactly once with a correct book count, including authors with zero books." },
    {
      kind: "debug",
      question: {
        id: "db-joins-aggregation-d1",
        prompt: "This query should list every customer with their 2026 order total (0 if none), but customers without 2026 orders vanish. Which line is the bug?",
        code: `SELECT c.name, COALESCE(SUM(o.amount), 0) AS total   -- line 1
FROM customers c                                      -- line 2
LEFT JOIN orders o ON o.customer_id = c.id            -- line 3
WHERE o.year = 2026                                   -- line 4
GROUP BY c.name;                                      -- line 5`,
        choices: ["Line 1", "Line 3", "Line 4", "Line 5"],
        answerIndex: 2,
        explanation: "For customers with no 2026 orders, o.year is NULL, and `NULL = 2026` is not true, so WHERE removes those rows. Moving `AND o.year = 2026` into the ON clause on line 3 keeps every customer.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "db-joins-aggregation-k1", prompt: "authors has 3 rows; only 2 authors have books. How many distinct authors appear in an INNER JOIN with books?", choices: ["0", "2", "3", "Depends on GROUP BY"], answerIndex: 1, explanation: "INNER JOIN keeps only authors with at least one matching book.", objective: 0 },
    { id: "db-joins-aggregation-k2", prompt: "Which clause can filter on COUNT(...)?", choices: ["WHERE", "ON", "HAVING", "ORDER BY only"], answerIndex: 2, explanation: "HAVING runs after grouping, so it can see aggregate values.", objective: 1 },
  ],
  project: {
    title: "Bookshop reporting schema and query pack",
    summary: "Design a small relational schema (authors, books, sales, reviews), seed it with deliberate edge cases, and write a tested pack of reporting queries that avoid the classic join bugs and use indexes.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A migration creating authors, books, sales and reviews with primary keys, foreign keys and NOT NULL constraints where appropriate.",
      "Seed data including an author with no books, a book with no sales, and a book with many sales AND many reviews.",
      "Queries: books per author (including zero), revenue per author, average rating per book, authors with 2+ books.",
      "Indexes on every foreign key used in joins, with EXPLAIN output saved before and after.",
    ],
    acceptanceCriteria: [
      "An integration test against a real (Docker) Postgres proves the author with no books appears with count 0.",
      "A test proves revenue is not multiplied by the number of reviews (the fan-out case).",
      "A test proves the 'authors with 2+ books' query uses HAVING and returns the expected names.",
      "The README shows EXPLAIN before/after adding indexes and explains the difference in your own words.",
    ],
    technologies: ["PostgreSQL", "SQL", "Node.js", "Vitest", "Docker"],
    milestones: [
      { title: "Schema", done_when: "Migration runs and constraints reject bad data." },
      { title: "Seeds", done_when: "Edge-case rows exist and are documented." },
      { title: "Queries", done_when: "Four reporting queries pass their tests." },
      { title: "Indexes", done_when: "EXPLAIN shows index use on joins, documented in the README." },
    ],
    testIdeas: ["Zero-children parent", "Fan-out with two child tables", "NULL handling in AVG", "Ties in ORDER BY"],
    stretchGoals: ["Rewrite one report with a CTE and a window function (rank authors by revenue)."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "db-joins-aggregation-a1", prompt: "Which join keeps every row of the left table even when there is no match?", choices: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SEMI JOIN"], answerIndex: 1, explanation: "LEFT JOIN keeps all left rows and fills unmatched right columns with NULL.", objective: 0 },
      { id: "db-joins-aggregation-a2", prompt: "Why does Postgres reject `SELECT a.name, b.title FROM ... GROUP BY a.name`?", choices: ["title is a reserved word", "title is neither grouped nor aggregated, so there are many possible values per group", "GROUP BY needs ORDER BY", "JOINs cannot be grouped"], answerIndex: 1, explanation: "Each output row is one group; a non-aggregated column with many values per group is ambiguous.", objective: 1 },
      { id: "db-joins-aggregation-a3", prompt: "WHERE vs HAVING: which is true?", choices: ["They are interchangeable", "WHERE filters rows before grouping; HAVING filters groups after", "HAVING runs before WHERE", "WHERE can use aggregates"], answerIndex: 1, explanation: "Different stages of the query: rows first, then groups.", objective: 1 },
      { id: "db-joins-aggregation-a4", prompt: "After `authors LEFT JOIN books`, an author with no books has COUNT(*) = ?", choices: ["0", "1", "NULL", "Error"], answerIndex: 1, explanation: "The LEFT JOIN still produces one row for that author (with NULL book columns), and COUNT(*) counts rows.", objective: 2 },
      { id: "db-joins-aggregation-a5", prompt: "An order has 3 line items and 2 shipments. Joining orders to both and SUM(line_items.price) gives what?", choices: ["The correct total", "Double the correct total", "Triple the correct total", "An error"], answerIndex: 1, explanation: "3 × 2 = 6 rows: each line item appears twice (once per shipment), so the sum doubles.", objective: 2 },
      { id: "db-joins-aggregation-a6", prompt: "Which index most likely speeds up `JOIN books b ON b.author_id = a.id`?", choices: ["An index on books.title", "An index on books.author_id", "An index on authors.name", "No index can help joins"], answerIndex: 1, explanation: "The planner needs to find books by author_id quickly; Postgres does not create that index automatically.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "db-joins-aggregation-q01", tags: ["sql", "joins"], difficulty: "foundation", kind: "concept", prompt: "Explain the difference between INNER JOIN and LEFT JOIN.", expectedElements: ["inner keeps matches only", "left keeps all left rows", "NULLs for unmatched", "example"], modelAnswer: "An INNER JOIN returns only row pairs where the join condition matches. A LEFT JOIN returns every row from the left table, plus the matching right rows, with NULLs in the right-side columns when there is no match. For example, listing all customers including those who never ordered needs a LEFT JOIN.", explanation: "Always give a concrete example.", commonWrongAnswers: ["LEFT JOIN returns the left table only."] },
    { id: "db-joins-aggregation-q02", tags: ["sql", "aggregation"], difficulty: "foundation", kind: "concept", prompt: "What is the difference between WHERE and HAVING?", expectedElements: ["WHERE before grouping on rows", "HAVING after grouping on groups", "HAVING can use aggregates"], modelAnswer: "WHERE filters individual rows before grouping and cannot use aggregates. HAVING filters the groups after GROUP BY and can reference aggregates, like HAVING COUNT(*) > 5.", explanation: "Mention the execution order.", commonWrongAnswers: ["HAVING is for joins."] },
    { id: "db-joins-aggregation-q03", tags: ["sql", "debugging"], difficulty: "core", kind: "debugging", prompt: "A dashboard says every user has at least one order, but you know some do not. The query uses LEFT JOIN and COUNT(*). What's wrong?", expectedElements: ["COUNT(*) counts the NULL-filled row", "use COUNT(orders.id)"], modelAnswer: "After a LEFT JOIN, users without orders still produce one row with NULL order columns, and COUNT(*) counts that row as 1. COUNT(orders.id) counts only non-NULL ids, so those users correctly show 0.", explanation: "One of the most common silent SQL bugs.", commonWrongAnswers: ["Use INNER JOIN instead (which removes those users entirely)."] },
    { id: "db-joins-aggregation-q04", tags: ["sql", "fan-out"], difficulty: "advanced", kind: "debugging", prompt: "Revenue per customer is inflated for some customers after adding a join to a support_tickets table. Why, and how do you fix it?", expectedElements: ["one-to-many joins multiply rows", "sum counted per ticket", "aggregate separately then join", "or use subquery/CTE"], modelAnswer: "Both orders and support_tickets are one-to-many from customers, so joining both creates orders × tickets rows per customer, and SUM(order.amount) counts each order once per ticket. Fix it by aggregating orders and tickets separately, in subqueries or CTEs grouped by customer_id, and then joining those one-row-per-customer summaries.", explanation: "Fan-out (also called join explosion) is a senior-level signal.", commonWrongAnswers: ["Use DISTINCT on the sum (can hide real duplicate amounts)."] },
    { id: "db-joins-aggregation-q05", tags: ["sql", "performance"], difficulty: "core", kind: "concept", prompt: "Why might a join be slow, and what is the first thing you check?", expectedElements: ["missing index on join/foreign key column", "EXPLAIN / EXPLAIN ANALYZE", "row estimates", "sequential scan"], modelAnswer: "The most common cause is a missing index on the join or filter column, often a foreign key, which forces a sequential scan of a large table. I run EXPLAIN ANALYZE to see the chosen plan, look for sequential scans and bad row estimates, then add the index or rewrite the query, and measure again.", explanation: "Evidence first: EXPLAIN before guessing.", commonWrongAnswers: ["Joins are always slow; denormalise everything."] },
    { id: "db-joins-aggregation-q06", tags: ["sql", "joins"], difficulty: "core", kind: "code-reading", prompt: "What does this return for a customer with no 2026 orders?", code: `SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.year = 2026;`, expectedElements: ["one row with NULL o.id", "condition in ON keeps the customer"], modelAnswer: "One row with the customer's name and NULL for o.id. Because the year filter is in the ON clause, it only decides which orders match, and the LEFT JOIN still keeps every customer.", explanation: "Contrast with putting the filter in WHERE.", commonWrongAnswers: ["No row at all."] },
    { id: "db-joins-aggregation-q07", tags: ["sql", "nulls"], difficulty: "core", kind: "misconception", prompt: "True or false: AVG(rating) treats missing ratings as 0.", expectedElements: ["false", "aggregates ignore NULL", "COALESCE if you want zeros"], modelAnswer: "False. Aggregate functions other than COUNT(*) ignore NULLs, so AVG averages only the non-NULL ratings. If missing ratings should count as zero, you must COALESCE(rating, 0) explicitly, which is usually not what you want.", explanation: "NULL handling is a frequent interview trap.", commonWrongAnswers: ["True."] },
    { id: "db-joins-aggregation-q08", tags: ["sql", "design"], difficulty: "core", kind: "scenario", prompt: "Product asks for 'top 3 products per category by revenue'. How would you approach it in SQL?", expectedElements: ["aggregate revenue per product", "window function ROW_NUMBER/RANK partitioned by category", "filter rank <= 3", "tie handling"], modelAnswer: "First aggregate revenue per product with a GROUP BY. Then apply a window function, ROW_NUMBER() or RANK() OVER (PARTITION BY category ORDER BY revenue DESC), in a CTE, and keep rows with rank ≤ 3. I would ask product how to handle ties, because RANK and ROW_NUMBER behave differently.", explanation: "Leads naturally into window functions.", commonWrongAnswers: ["ORDER BY revenue LIMIT 3 (gives top 3 overall)."] },
  ],
  references: [
    { title: "PostgreSQL docs: Joins Between Tables", url: "https://www.postgresql.org/docs/current/tutorial-join.html", kind: "official-docs" },
    { title: "PostgreSQL docs: Aggregate Functions (tutorial)", url: "https://www.postgresql.org/docs/current/tutorial-agg.html", kind: "official-docs" },
    { title: "PostgreSQL docs: Constraints (foreign keys and indexes)", url: "https://www.postgresql.org/docs/current/ddl-constraints.html", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Relational joins, grouping semantics and NULL behaviour in aggregates are part of the SQL standard."],
  versionSpecific: ["Planner join strategies and some syntax extensions differ between PostgreSQL versions and other databases."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
