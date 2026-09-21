// Shows the pass/fail list (with plain-English messages) and the console output panel.
import { Badge, Card } from "@hexhammer/design-system";
import type { RunResult } from "../runner/execute";
import { TIMEOUT_MS } from "../runner/runCode";

export function TestResults({ run }: { run: RunResult | null }) {
  if (!run) {
    return <p className="muted">Press “Run tests” to see how you did.</p>;
  }

  if (run.timedOut) {
    return (
      <p className="message message--bad">
        Your code ran for more than {TIMEOUT_MS / 1000} seconds, so I stopped it. Is there
        a loop that never ends?
      </p>
    );
  }

  const passedCount = run.results.filter((r) => r.passed).length;

  return (
    <div>
      {run.error && <p className="message message--bad">{run.error}</p>}
      {run.results.length > 0 && (
        <p>
          <Badge tone={passedCount === run.results.length ? "success" : "danger"}>
            {passedCount} of {run.results.length} tests passed
          </Badge>
        </p>
      )}
      <ul className="results">
        {run.results.map((result) => (
          <li
            key={result.name}
            className={result.passed ? "result result--pass" : "result result--fail"}
          >
            <Badge tone={result.passed ? "success" : "danger"}>
              {result.passed ? "Pass" : "Fail"}
            </Badge>{" "}
            <strong>{result.name}</strong>
            {!result.passed && <div className="result__message">{result.message}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConsolePanel({ lines }: { lines: string[] }) {
  return (
    <Card title="Console output" className="console">
      {lines.length === 0 ? (
        <p className="muted">Nothing printed yet. Use console.log(...) to print.</p>
      ) : (
        <pre className="console__lines">{lines.join("\n")}</pre>
      )}
    </Card>
  );
}
