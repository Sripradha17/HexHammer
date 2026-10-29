// CI PIPELINE LAB: choose and order stages, then push six buggy changes through. Each bug can only be
// caught by certain kinds of check; the pipeline runs stages in order and stops at the first failure.
// Durations are example numbers (minutes); the catching rules mirror what each kind of check sees.
import { useState } from "react";
import { LabFrame, move, useGoal, type LabProps } from "./shared";

interface StageDef {
  id: string;
  label: string;
  minutes: number;
}
const STAGES: StageDef[] = [
  { id: "lint", label: "Lint + format", minutes: 0.5 },
  { id: "types", label: "Type check", minutes: 1 },
  { id: "unit", label: "Unit tests", minutes: 2 },
  { id: "build", label: "Build", minutes: 2 },
  { id: "security", label: "Dependency audit", minutes: 1 },
  { id: "integration", label: "Integration tests (real DB)", minutes: 5 },
  { id: "e2e", label: "End-to-end tests (browser)", minutes: 12 },
];

// Which stages can catch which bug.
const BUGS = [
  { name: "Unused variable and wrong quotes", caughtBy: ["lint"] },
  { name: "Passing a string where a number is expected", caughtBy: ["types"] },
  { name: "Discount uses > instead of >=", caughtBy: ["unit"] },
  { name: "Import of a file that was renamed", caughtBy: ["types", "build"] },
  { name: "Dependency with a known critical advisory", caughtBy: ["security"] },
  { name: "SQL query joins on the wrong column", caughtBy: ["integration", "e2e"] },
];

export function runPipeline(order: string[]) {
  return BUGS.map((bug) => {
    let minutes = 0;
    for (const id of order) {
      const stage = STAGES.find((s) => s.id === id)!;
      minutes += stage.minutes;
      if (bug.caughtBy.includes(id)) return { bug: bug.name, caughtAt: stage.label, minutes };
    }
    return { bug: bug.name, caughtAt: null, minutes };
  });
}

export default function CiPipelineLab({ onGoal }: LabProps) {
  const [order, setOrder] = useState<string[]>(["e2e", "build", "unit"]);
  const results = runPipeline(order);
  const escaped = results.filter((r) => !r.caughtAt);
  const average = results.reduce((n, r) => n + r.minutes, 0) / results.length;
  const goal = useGoal(escaped.length === 0 && average < 5, `All ${results.length} bugs blocked; average time-to-first-failure ${average.toFixed(1)} min. Order: ${order.join(" → ")}.`, onGoal);

  const unused = STAGES.filter((s) => !order.includes(s.id));
  return (
    <LabFrame title="CI pipeline" note="Example durations in minutes. Each bug can only be caught by the kinds of check listed in this lab's source, mirroring what those tools really inspect." goalMet={goal}>
      <div className="lab__grid">
        <div>
          <h4>Your pipeline (runs top to bottom)</h4>
          <ol className="pipeline">
            {order.map((id, i) => {
              const s = STAGES.find((x) => x.id === id)!;
              return (
                <li key={id} className="pipeline__stage">
                  <span className="pipeline__num">{i + 1}</span>
                  <span className="pipeline__label">{s.label}</span>
                  <span className="pipeline__ran">{s.minutes} min</span>
                  <span className="pipeline__moves">
                    <button type="button" className="icon-btn" aria-label={`Move ${s.label} up`} disabled={i === 0} onClick={() => setOrder(move(order, i, -1))}>Up</button>
                    <button type="button" className="icon-btn" aria-label={`Move ${s.label} down`} disabled={i === order.length - 1} onClick={() => setOrder(move(order, i, 1))}>Down</button>
                    <button type="button" className="icon-btn" aria-label={`Remove ${s.label}`} onClick={() => setOrder(order.filter((x) => x !== id))}>Remove</button>
                  </span>
                </li>
              );
            })}
          </ol>
          {unused.length > 0 && (
            <p>
              Add:{" "}
              {unused.map((s) => (
                <button key={s.id} type="button" className="hh-chip" aria-pressed={false} onClick={() => setOrder([...order, s.id])}>
                  + {s.label}
                </button>
              ))}
            </p>
          )}
        </div>
        <div>
          <h4>Six buggy changes</h4>
          <ul className="bug-results" aria-live="polite">
            {results.map((r) => (
              <li key={r.bug} className={r.caughtAt ? "is-caught" : "is-escaped"}>
                <strong>{r.caughtAt ? "Blocked" : "Shipped to production"}</strong> {r.bug}
                <span className="muted"> · {r.caughtAt ? `${r.caughtAt}, after ${r.minutes} min` : `ran ${r.minutes} min, nothing caught it`}</span>
              </li>
            ))}
          </ul>
          <p className="lab__readout">
            Average time-to-first-failure: <strong>{average.toFixed(1)} min</strong> · escaped: <strong>{escaped.length}</strong>
          </p>
        </div>
      </div>
    </LabFrame>
  );
}
