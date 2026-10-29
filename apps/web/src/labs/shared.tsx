// Pieces shared by every lab.
import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@hexhammer/design-system";

export interface LabProps {
  // Called ONCE when the lab itself measures that its goal is met. The detail says what happened.
  onGoal?: (detail: string) => void;
}

// A frame with a title, an honest note about what is real and what is simulated, and the goal state.
export function LabFrame({ title, note, goalMet, children }: { title: string; note: string; goalMet?: boolean; children: ReactNode }) {
  return (
    <section className="lab" aria-label={`${title} lab`}>
      <header className="lab__head">
        <h3 className="lab__title">{title}</h3>
        {goalMet && <Badge tone="success">Goal reached</Badge>}
      </header>
      <p className="lab__note">{note}</p>
      {children}
    </section>
  );
}

// Fires onGoal once, the first time `met` becomes true. It runs in an effect, never during render,
// so React's double rendering in development can never report a goal twice.
export function useGoal(met: boolean, detail: string, onGoal?: (detail: string) => void) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (met && !done) {
      setDone(true);
      onGoal?.(detail);
    }
  }, [met, done, detail, onGoal]);
  return done || met;
}

// A small, seeded random number generator (mulberry32), so a lab run is repeatable:
// the same seed always gives the same "random" numbers.
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Move an item one place up or down in a list (keyboard-friendly reordering, no dragging needed).
export function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
