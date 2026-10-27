// EVENT LOOP LAB: a tiny simulator of JavaScript's scheduling rules (call stack, microtask queue,
// task queue). The order below is COMPUTED by the rules in `simulate`, not typed in by hand, and the
// classic program's result matches what real Node and browsers print (A E G C D F B).
import { useMemo, useState } from "react";
import { Button } from "@hexhammer/design-system";
import { LabFrame, useGoal, type LabProps } from "./shared";

type Op =
  | { log: string }
  | { timeout: Op[] }
  | { then: Op[] }
  | { microtask: Op[] }
  | { asyncFn: Op[] }
  | { await: true };

interface Snapshot {
  action: string;
  stack: string[];
  micro: string[];
  tasks: string[];
  output: string[];
}

const PROGRAMS: { name: string; code: string; ops: Op[] }[] = [
  {
    name: "The classic puzzle",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
queueMicrotask(() => console.log("D"));
(async () => { console.log("E"); await null; console.log("F"); })();
console.log("G");`,
    ops: [{ log: "A" }, { timeout: [{ log: "B" }] }, { then: [{ log: "C" }] }, { microtask: [{ log: "D" }] }, { asyncFn: [{ log: "E" }, { await: true }, { log: "F" }] }, { log: "G" }],
  },
  {
    name: "Microtasks that queue microtasks",
    code: `setTimeout(() => console.log(1));
Promise.resolve().then(() => {
  console.log(2);
  setTimeout(() => console.log(3));
  Promise.resolve().then(() => console.log(4));
});
console.log(5);`,
    ops: [{ timeout: [{ log: "1" }] }, { then: [{ log: "2" }, { timeout: [{ log: "3" }] }, { then: [{ log: "4" }] }] }, { log: "5" }],
  },
];

// Runs a program by the rules and records a snapshot after every event.
export function simulate(program: Op[]): Snapshot[] {
  const micro: { label: string; ops: Op[] }[] = [];
  const tasks: { label: string; ops: Op[] }[] = [];
  const output: string[] = [];
  let stack: string[] = [];
  const snaps: Snapshot[] = [];
  const snap = (action: string) => snaps.push({ action, stack: [...stack], micro: micro.map((m) => m.label), tasks: tasks.map((t) => t.label), output: [...output] });

  function run(ops: Op[]) {
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if ("log" in op) {
        output.push(op.log);
        snap(`console.log("${op.log}") prints ${op.log}`);
      } else if ("timeout" in op) {
        tasks.push({ label: `timer → ${describe(op.timeout)}`, ops: op.timeout });
        snap("setTimeout hands a timer to the environment; its callback joins the TASK queue");
      } else if ("then" in op || "microtask" in op) {
        const inner = "then" in op ? op.then : op.microtask;
        micro.push({ label: `${"then" in op ? ".then" : "queueMicrotask"} → ${describe(inner)}`, ops: inner });
        snap(`${"then" in op ? ".then on a resolved promise" : "queueMicrotask"} adds a callback to the MICROTASK queue`);
      } else if ("asyncFn" in op) {
        stack.push("async function");
        snap("The async function starts running synchronously");
        const body = op.asyncFn;
        const awaitAt = body.findIndex((o) => "await" in o);
        run(awaitAt === -1 ? body : body.slice(0, awaitAt));
        if (awaitAt !== -1) {
          const rest = body.slice(awaitAt + 1);
          micro.push({ label: `after await → ${describe(rest)}`, ops: rest });
          snap("await pauses the function; the rest becomes a MICROTASK");
        }
        stack.pop();
      }
    }
  }

  stack = ["main script"];
  snap("The script starts on the call stack");
  run(program);
  stack = [];
  snap("The script finished: the call stack is empty");
  while (micro.length || tasks.length) {
    if (micro.length) {
      const job = micro.shift()!;
      stack = [job.label];
      snap("Loop: run the NEXT MICROTASK (all microtasks go before any task)");
      run(job.ops);
    } else {
      const job = tasks.shift()!;
      stack = [job.label];
      snap("Microtask queue empty: run ONE TASK");
      run(job.ops);
    }
    stack = [];
  }
  snap("Both queues are empty: the program is done");
  return snaps;
}

function describe(ops: Op[]): string {
  return ops.map((o) => ("log" in o ? `log ${o.log}` : "timeout" in o ? "setTimeout" : "then" in o ? "then" : "…")).join(", ");
}

export default function EventLoopLab({ onGoal }: LabProps) {
  const [programIndex, setProgramIndex] = useState(0);
  const program = PROGRAMS[programIndex];
  const snaps = useMemo(() => simulate(program.ops), [program]);
  const finalOutput = snaps[snaps.length - 1].output;
  const [step, setStep] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);

  const s = snaps[step];
  const choices = [...new Set(finalOutput)].sort();
  const nextExpected = finalOutput[guesses.length];
  const perfect = programIndex === 0 && guesses.length === finalOutput.length && mistakes === 0;
  const goal = useGoal(perfect, `Predicted all ${finalOutput.length} outputs of the classic puzzle in order with no mistakes.`, onGoal);

  function pick(program: number) {
    setProgramIndex(program);
    setStep(0);
    setGuesses([]);
    setMistakes(0);
  }

  function guess(value: string) {
    if (value === nextExpected) setGuesses([...guesses, value]);
    else setMistakes(mistakes + 1);
  }

  return (
    <LabFrame title="Event loop explorer" note="A simulator that applies the real scheduling rules step by step. It models only these features (log, setTimeout, promise.then, queueMicrotask, async/await)." goalMet={goal}>
      <div className="lab__controls">
        {PROGRAMS.map((p, i) => (
          <button key={p.name} type="button" className="hh-chip" aria-pressed={i === programIndex} onClick={() => pick(i)}>
            {p.name}
          </button>
        ))}
      </div>
      <pre className="lab__code">{program.code}</pre>

      <div className="predict" aria-live="polite">
        <p>
          <strong>Predict the output, one value at a time.</strong> So far: <code>{guesses.join(" ") || "—"}</code>
          {mistakes > 0 && <span className="muted"> · {mistakes} wrong guess{mistakes > 1 ? "es" : ""} (each one is a hint to step through below)</span>}
        </p>
        {guesses.length < finalOutput.length ? (
          <div className="predict__choices" role="group" aria-label="What prints next?">
            {choices.map((c) => (
              <Button key={c} variant="secondary" size="small" onClick={() => guess(c)}>
                {c}
              </Button>
            ))}
          </div>
        ) : (
          <p>{mistakes === 0 ? "✓ Perfect run." : "Done. Reset and try for zero mistakes."}</p>
        )}
        <Button variant="ghost" size="small" onClick={() => pick(programIndex)}>
          Reset prediction
        </Button>
      </div>

      <div className="loop">
        <div className="loop__col">
          <h4>Call stack</h4>
          <ul>{s.stack.length ? s.stack.map((f, i) => <li key={i}>{f}</li>) : <li className="muted">empty</li>}</ul>
        </div>
        <div className="loop__col loop__col--micro">
          <h4>Microtasks</h4>
          <ul>{s.micro.length ? s.micro.map((f, i) => <li key={i}>{f}</li>) : <li className="muted">empty</li>}</ul>
        </div>
        <div className="loop__col loop__col--task">
          <h4>Tasks</h4>
          <ul>{s.tasks.length ? s.tasks.map((f, i) => <li key={i}>{f}</li>) : <li className="muted">empty</li>}</ul>
        </div>
        <div className="loop__col">
          <h4>Console</h4>
          <pre className="loop__console">{s.output.join("\n") || " "}</pre>
        </div>
      </div>
      <p className="lab__readout" aria-live="polite">
        Step {step + 1}/{snaps.length}: {s.action}
      </p>
      <div className="lab__controls">
        <Button variant="secondary" size="small" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          ← Back
        </Button>
        <Button size="small" onClick={() => setStep(Math.min(snaps.length - 1, step + 1))} disabled={step === snaps.length - 1}>
          Step →
        </Button>
      </div>
    </LabFrame>
  );
}
