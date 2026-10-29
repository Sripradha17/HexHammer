// REFERENCES LAB: two names (a and b) and the boxes in memory they point to. Press real statements
// and watch: `b = a` makes both names point at the SAME box, so changing it through b changes a too.
// `b = [...a]` makes a NEW box. The goal: see a shared change once, then change b without
// touching a.
//
// It is a tiny model of JavaScript memory, honest about being a model: real engines keep arrays
// in the heap exactly like this (a name holds a reference, the array lives in one place).
import { useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

interface Memory {
  boxes: Record<number, number[]>; // box number -> the array stored there
  a: number; // which box `a` points to
  b: number | null; // which box `b` points to (null = b not declared yet)
  next: number; // the number the next new box gets
}

const START: Memory = { boxes: { 1: [1, 2, 3] }, a: 1, b: null, next: 2 };

// Every statement the lab can run, as plain code text and what it does to memory.
const STATEMENTS: { code: string; needsB?: boolean; run: (m: Memory) => Memory }[] = [
  { code: "let b = a;", run: (m) => ({ ...m, b: m.a }) },
  { code: "let b = [...a];", run: (m) => ({ ...m, boxes: { ...m.boxes, [m.next]: [...m.boxes[m.a]] }, b: m.next, next: m.next + 1 }) },
  { code: "b.push(4);", needsB: true, run: (m) => ({ ...m, boxes: { ...m.boxes, [m.b!]: [...m.boxes[m.b!], 4] } }) },
  { code: "b[0] = 99;", needsB: true, run: (m) => ({ ...m, boxes: { ...m.boxes, [m.b!]: [99, ...m.boxes[m.b!].slice(1)] } }) },
  { code: "b = [7, 8];", needsB: true, run: (m) => ({ ...m, boxes: { ...m.boxes, [m.next]: [7, 8] }, b: m.next, next: m.next + 1 }) },
];

const show = (arr: number[]) => `[${arr.join(", ")}]`;

export default function ReferencesLab({ onGoal }: LabProps) {
  const [mem, setMem] = useState<Memory>(START);
  const [log, setLog] = useState<string[]>(["const a = [1, 2, 3];"]);
  const [seen, setSeen] = useState({ sharedChange: false, safeChange: false });

  function run(i: number) {
    const s = STATEMENTS[i];
    const before = mem;
    const after = s.run(mem);
    // A change made through b that ALSO changed what a sees: the "surprise" of sharing.
    const aChanged = show(before.boxes[before.a]) !== show(after.boxes[after.a]);
    const bChanged = before.b !== null && after.b === before.b && show(before.boxes[before.b]) !== show(after.boxes[after.b]);
    setSeen({
      sharedChange: seen.sharedChange || (bChanged && aChanged),
      safeChange: seen.safeChange || (bChanged && !aChanged),
    });
    setMem(after);
    setLog([...log, s.code]);
  }

  function reset() {
    setMem(START);
    setLog(["const a = [1, 2, 3];"]);
  }

  const done = useGoal(seen.sharedChange && seen.safeChange, "Saw b.push change a through a shared reference, then copied with [...a] and changed b alone.", onGoal);
  // Only boxes something still points to (the others would be garbage-collected).
  const live = Object.keys(mem.boxes)
    .map(Number)
    .filter((id) => id === mem.a || id === mem.b);

  return (
    <LabFrame title="Names and boxes" note="A model of JavaScript memory: each name holds an arrow (a reference) to a box. Press a statement and watch which box changes." goalMet={done}>
      <div className="refs">
        <div className="refs__code" role="group" aria-label="Statements to run">
          {STATEMENTS.map((s, i) => (
            <button key={s.code} type="button" className="btn btn--ghost refs__stmt" disabled={(s.needsB && mem.b === null) || (!s.needsB && mem.b !== null)} onClick={() => run(i)}>
              <code>{s.code}</code>
            </button>
          ))}
          <button type="button" className="btn btn--ghost refs__stmt" onClick={reset}>
            Start again
          </button>
        </div>

        <div className="refs__memory" aria-live="polite">
          <div className="refs__names">
            <span className="refs__name">
              <code>a</code> → box {mem.a}
            </span>
            {mem.b !== null && (
              <span className={`refs__name ${mem.b === mem.a ? "is-shared" : ""}`}>
                <code>b</code> → box {mem.b}
              </span>
            )}
          </div>
          <div className="refs__boxes">
            {live.map((id) => {
              const names = [id === mem.a && "a", id === mem.b && "b"].filter(Boolean);
              return (
                <div key={id} className={`refs__box ${names.length > 1 ? "is-shared" : ""}`}>
                  <span className="refs__boxid">box {id}</span>
                  <code className="refs__value" key={show(mem.boxes[id])}>
                    {show(mem.boxes[id])}
                  </code>
                  <span className="refs__who">{names.length > 1 ? "a AND b point here" : `only ${names[0]} points here`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <pre className="refs__log" aria-label="What you ran">
        {log.join("\n")}
        {"\n"}
        {`console.log(a); // ${show(mem.boxes[mem.a])}`}
      </pre>
      <p className="muted">
        {seen.sharedChange ? "✓ You changed a without touching it: b and a shared one box." : "Try: let b = a; then b.push(4); and look at a."}{" "}
        {seen.safeChange ? "✓ You changed b alone." : seen.sharedChange ? "Now start again and make b its own box first." : ""}
      </p>
    </LabFrame>
  );
}
