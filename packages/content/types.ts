// The shape of one lesson ("strike"). Every file in level-1/ exports one of these.
// NOTE: `solution` is the ONLY place a solution may live. It stays hidden until "reveal".
export interface Lesson {
  id: string; // e.g. "l1-s01", or "dsa-s01" for a track
  level: number; // 1..8. Use 0 for a lesson that belongs to a track instead
  track?: string; // set for track lessons, like "dsa"
  order: number; // position inside the level, starting at 1
  title: string;
  // "worker" (default): plain JavaScript, run in a Web Worker. starterCode/tests are JS.
  // "iframe": a real web page, run in a sandboxed iframe. starterCode is an HTML fragment
  //   (goes inside <body>, may include its own <style>/<script>). tests is still plain JS
  //   using test()/expect(), but it can also read the real, rendered `document`.
  // "server": a real Node/Express module, executed for real (see apps/api/src/serverRunner) in a
  //   throwaway local child process — ONLY ever reachable from this same machine, in
  //   development, never when this app is deployed publicly (see the charter's security rule).
  //   starterCode must `export function buildApp() { ... return app; }`. tests use the same
  //   test()/expect() shape as every other runner, plus `request(buildApp())` (supertest) to
  //   make real HTTP calls, and `buildApp` is already imported for you.
  // "sql": a real SQL query, run for real against a throwaway IN-MEMORY database (pg-mem, see
  //   apps/api/src/serverRunner/runSqlCode.ts) — never the app's real Postgres. starterCode is a
  //   raw SQL string (not JS). Requires sqlSeed (below). tests use the same test()/expect()
  //   shape, plus two things already imported for you: `code` (the learner's raw SQL text) and
  //   `query(sql)` (runs any SQL against the seeded database and returns the resulting rows) —
  //   a test typically does `const rows = await query(code); expect(rows).toEqual([...]);`.
  // "react": a real React component, run for real in the sandboxed iframe (Level 6), with
  //   React/ReactDOM/Babel standalone loaded from a local, pre-built vendor script (see
  //   apps/web/scripts/build-react-env.mjs — React 19 dropped UMD builds, so this app builds its
  //   own small one instead of using a CDN). starterCode is real JSX: define a component and
  //   call ReactDOM.createRoot(document.getElementById("root")).render(<Component />) yourself,
  //   the same way a real app's entry file does. tests use the same test()/expect() shape, plus
  //   one thing every test body MUST await first: `await settle();` — a short, fixed wait for
  //   React's render to actually commit before reading the DOM (there is no better signal
  //   available in this sandboxed, build-step-free setup; see reactIframeHarness.ts).
  runner?: "worker" | "iframe" | "server" | "sql" | "react";
  // Only for runner: "sql". Raw SQL (CREATE TABLE + INSERT) that always runs first, before the
  // learner's own query, identically for both the starter-code run and the solution run. Never
  // shown as something to edit; shown as a schema example in `look` instead.
  sqlSeed?: string;
  look: string; // Beat 1: read a tiny example
  type: string; // Beat 2: what to type by hand
  break: string; // Beat 3: make it fail, then fix it
  say: string; // Beat 4: the prompt for your one-sentence explanation
  starterCode: string; // shown in the editor. Must make the tests FAIL.
  tests: string; // uses the shared helper: test(), expect().toBe(), expect().toEqual()
  hints: [string, string, string]; // revealed one at a time
  solution: string; // "=== CODE ===" then code, "=== LINE BY LINE ===" then explanation
}

// A Say-It flashcard (front = question, back = model answer).
export interface SayItCard {
  question: string;
  answer: string;
  isPreview?: boolean; // preview cards teach a later level's idea
}

// Interview Pack for one level. Note: the Solve-It problem has tests but NO solution.
export interface InterviewPack {
  level: number;
  sayIt: SayItCard[];
  solveIt: {
    title: string;
    minutes: number;
    prompt: string;
    starterCode: string;
    tests: string;
  };
  star: { prompt: string; tips: string[] };
}
