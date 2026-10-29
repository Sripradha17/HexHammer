// THE WORKBENCH: a real place to build inside a project. Two files, code.js and tests.js, a Run
// button, a terminal with everything console.log printed, and the test results.
//
// SAFETY (CLAUDE.md): the code runs in a browser Web Worker with a 3-second timeout, exactly like
// the strike runner. Nothing ever runs on the server.
//
// The two files are a scratch bench, saved in THIS browser only (localStorage, per project). The
// project's real code lives in my own repository; this is where I try ideas and write tests.
// Tests use the same tiny helpers as strikes:  test("name", () => { expect(a).toBe(b); });
import { useEffect, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { TestResults } from "./TestResults";
import { createWorker } from "../runner/createWorker";
import { runCode } from "../runner/runCode";
import type { RunResult } from "../runner/execute";

const STARTER_CODE = `// Build a small piece of your project here, by hand.
// Example shape (replace it with your own):
function describe(text) {
  // ...
}

console.log(describe("é"));
`;
const STARTER_TESTS = `// One test per acceptance criterion you can check in code.
test("my first check", () => {
  // expect(describe("A")).toBe(...);
});
`;

function load(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function Workbench({ projectId, onRun, initialTab = "code" }: { projectId: number; onRun?: (r: RunResult) => void; initialTab?: "code" | "tests" }) {
  const key = (file: string) => `hexhammer-bench-${projectId}-${file}`;
  const [tab, setTab] = useState<"code" | "tests">(initialTab);
  const [code, setCode] = useState(() => load(key("code"), STARTER_CODE));
  const [tests, setTests] = useState(() => load(key("tests"), STARTER_TESTS));
  const [run, setRun] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  // Save each file a moment after I stop typing.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key("code"), code);
        localStorage.setItem(key("tests"), tests);
      } catch {
        // storage blocked: the bench still works for this visit
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, tests]);

  async function go() {
    setRunning(true);
    const result = await runCode(code, tests, createWorker);
    setRun(result);
    setRunning(false);
    onRun?.(result);
  }

  const passed = run?.results.filter((r) => r.passed).length ?? 0;
  return (
    <div className="bench">
      <div className="bench__bar">
        <div className="tabs" role="tablist" aria-label="Files">
          {(["code", "tests"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className="tabs__tab" onClick={() => setTab(t)}>
{t}.js
            </button>
          ))}
        </div>
        <button type="button" className="cta cta--small" onClick={go} disabled={running}>
{running ? "Running…" : "Run"}
        </button>
      </div>
      <div className="bench__editor">
        {tab === "code" ? <CodeEditor value={code} onChange={setCode} height="320px" /> : <CodeEditor value={tests} onChange={setTests} height="320px" />}
      </div>
      <div className="bench__out">
        <div className="bench__terminal">
          <p className="bench__label">
Terminal
          </p>
          <pre className="bench__lines">
            {!run
              ? "Press Run. Output appears here."
              : run.timedOut
                ? "Stopped after 3 seconds (an endless loop?). Press Run again."
                : [...run.consoleLines, ...(run.error ? [run.error] : [])].join("\n") || "(nothing printed)"}
          </pre>
        </div>
        <div className="bench__tests">
          <p className="bench__label">
Tests {run && run.results.length > 0 && `· ${passed}/${run.results.length} passing`}
          </p>
          <TestResults run={run} />
        </div>
      </div>
    </div>
  );
}
