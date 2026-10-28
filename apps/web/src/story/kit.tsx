// THE STORY KIT: the pieces every quest is built from, drawn as a panel over the 3D stage.
//
//   <Dialogue>       Bram speaks one short line at a time. His 3D figure changes mood and gestures
//                    while he talks. The words float in one by one.
//   <Term>           a word card: the real tech word, then what it means in plain words
//   <LanternPuzzle>  light lanterns (bits) until the rune shows a target number. The lanterns are
//                    both in 3D (click them) and here as buttons (keyboard and screen readers).
import { useEffect, useState, type ReactNode } from "react";
import type { Mood } from "../world3d/parts";
import { LANTERN_VALUES, runeValue, useStage, type Shot } from "./stage";

export interface Line {
  mood: Mood;
  text: string;
  terms?: TermDef[]; // word cards that appear with this line
  shot?: Shot; // where the camera should look during this line
}
export interface TermDef {
  word: string;
  plain: string;
}

export function Term({ word, plain }: TermDef) {
  return (
    <span className="term">
      <span className="term__word">{word}</span>
      <span className="term__plain">{plain}</span>
    </span>
  );
}

// Words that float in one after another (each line replays it).
function Spoken({ text }: { text: string }) {
  return (
    <span className="spoken" aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true" style={{ animationDelay: `${i * 0.045}s` }}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

export function Dialogue({ lines, children }: { lines: Line[]; children?: ReactNode }) {
  const { set } = useStage();
  const [at, setAt] = useState(0);
  const line = lines[Math.min(at, lines.length - 1)];
  const last = at >= lines.length - 1;

  // Each new line: Bram takes its mood, gestures for a moment, and the camera moves if asked.
  useEffect(() => {
    set({ mood: line.mood, talking: true, ...(line.shot ? { shot: line.shot } : {}) });
    const t = setTimeout(() => set({ talking: false }), 1800);
    return () => clearTimeout(t);
    // Depend on the line's TEXT, not the object: a parent re-render makes a new object each time.
  }, [at, line.text, line.mood, line.shot, set]);

  return (
    <div className="talk">
      <p className="talk__who">
        <span className="talk__badge" aria-hidden="true">
          ⚒
        </span>{" "}
        Bram
      </p>
      <p className="talk__text" key={at} aria-live="polite">
        <Spoken text={line.text} />
      </p>
      {line.terms && (
        <div className="talk__terms" key={`t${at}`}>
          {line.terms.map((t) => (
            <Term key={t.word} {...t} />
          ))}
        </div>
      )}
      <div className="talk__actions">
        {at > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setAt(at - 1)}>
            Back
          </button>
        )}
        {!last ? (
          <button type="button" className="btn btn--go" onClick={() => setAt(at + 1)}>
            Next <span aria-hidden="true">→</span>
          </button>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

const hex = (n: number) => n.toString(16).toUpperCase();

export function LanternPuzzle({ target, ask, hint, showHex = false, win, children }: { target: number; ask: string; hint: string; showHex?: boolean; win: Line[]; children?: ReactNode }) {
  const { stage, set, toggleBit, cheer } = useStage();
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const total = runeValue(stage.bits);

  // Bring the lanterns on stage, all dark, and point the camera at them.
  useEffect(() => {
    set({ scene: "forge", lanterns: true, hex: showHex, bits: Array(8).fill(false), shot: "lanterns", mood: "think" });
  }, [set, showHex]);

  // Win as soon as the rune shows the target, however it was lit (3D click or button).
  useEffect(() => {
    if (!done && total === target) {
      setDone(true);
      cheer();
    }
  }, [total, target, done, cheer]);

  function tap(i: number) {
    if (done) return;
    toggleBit(i);
    setTries((t) => t + 1);
  }

  return (
    <div className="puzzle">
      <div className="rune" role="group" aria-label="The rune: 8 lanterns">
        {LANTERN_VALUES.map((v, i) => (
          <button key={v} type="button" className={`rune__lamp ${stage.bits[i] ? "is-on" : ""} ${showHex && i === 3 ? "rune__lamp--gap" : ""}`} aria-pressed={stage.bits[i]} aria-label={`Lantern worth ${v}`} onClick={() => tap(i)}>
            {v}
          </button>
        ))}
      </div>
      <p className={`rune__total ${done ? "is-won" : ""}`} aria-live="polite">
        {showHex ? (
          <>
            Rune <strong>{hex(total >> 4)}{hex(total & 15)}</strong> <span>goal {hex(target)}</span>
          </>
        ) : (
          <>
            Rune = <strong>{total}</strong> <span>goal {target}</span>
          </>
        )}
      </p>
      {!done ? (
        <div className="talk">
          <p className="talk__who">
            <span className="talk__badge" aria-hidden="true">
              ⚒
            </span>{" "}
            Bram
          </p>
          <p className="talk__text">
            <Spoken text={ask} />
          </p>
          {tries >= 4 && <p className="talk__hint">💡 {hint}</p>}
        </div>
      ) : (
        <Dialogue lines={win}>{children}</Dialogue>
      )}
    </div>
  );
}
