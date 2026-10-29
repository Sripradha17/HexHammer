// BINARY LAB: flip real bits; see the decimal and hex value. Type text; see its real UTF-8 bytes
// (from the browser's own TextEncoder) and its JavaScript length.
import { useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

export default function BinaryLab({ onGoal }: LabProps) {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]); // most significant first
  const [text, setText] = useState("café");
  const [seen, setSeen] = useState({ byte: false, multi: false });

  const value = bits.reduce((n, b) => n * 2 + b, 0);
  const chars = [...text].slice(0, 40); // by code point
  const encoder = new TextEncoder();
  const multiByte = chars.find((c) => encoder.encode(c).length > 1);

  // Remember each half of the goal once it has happened (the bits may change again afterwards).
  if ((value === 0xa5 && !seen.byte) || (multiByte && !seen.multi)) {
    setSeen({ byte: seen.byte || value === 0xa5, multi: seen.multi || Boolean(multiByte) });
  }
  const done = useGoal(seen.byte && seen.multi, `Set the byte to 0xA5 and typed a character that needs more than one UTF-8 byte.`, onGoal);

  return (
    <LabFrame title="Bits and bytes" note="Real values: the byte is computed from your switches, and the text bytes come from the browser's TextEncoder (UTF-8)." goalMet={done}>
      <div className="bits" role="group" aria-label="Eight bits, most significant first">
        {bits.map((b, i) => (
          <button
            key={i}
            type="button"
            className={`bit ${b ? "bit--on" : ""}`}
            aria-pressed={b === 1}
            aria-label={`Bit worth ${2 ** (7 - i)}`}
            onClick={() => setBits(bits.map((x, j) => (j === i ? 1 - x : x)))}
          >
            <span className="bit__value">{b}</span>
            <span className="bit__weight">{2 ** (7 - i)}</span>
          </button>
        ))}
      </div>
      <p className="lab__readout" aria-live="polite">
        binary <code>{bits.join("")}</code> = decimal <strong>{value}</strong> = hex <code>0x{value.toString(16).padStart(2, "0")}</code>
        {seen.byte && ", 0xA5 found"}
      </p>

      <label className="lab__field">
        Type any text (try an accent or an emoji)
        <input className="hh-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={80} />
      </label>
      <p className="muted">
        JavaScript <code>.length</code> = {text.length} · code points = {[...text].length} · UTF-8 bytes = {encoder.encode(text).length}
      </p>
      <ul className="char-table" aria-label="Each character and its UTF-8 bytes">
        {chars.map((c, i) => {
          const bytes = [...encoder.encode(c)];
          return (
            <li key={i} className={bytes.length > 1 ? "is-multi" : ""}>
              <span className="char-table__char">{c === " " ? "␠" : c}</span>
              <span className="char-table__cp">U+{c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}</span>
              <span className="char-table__bytes">{bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ")}</span>
            </li>
          );
        })}
      </ul>
    </LabFrame>
  );
}
