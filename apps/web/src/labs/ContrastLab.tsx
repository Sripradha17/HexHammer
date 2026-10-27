// CONTRAST LAB: the real WCAG 2.x contrast-ratio formula on two colors you pick.
import { useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

// sRGB channel (0-255) -> linear light, as defined by WCAG 2.x.
function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
export function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const DARK = "#10131a"; // the app's dark surface
const LIGHT = "#f7f4ec"; // the app's light page

export default function ContrastLab({ onGoal }: LabProps) {
  const [text, setText] = useState("#6b7280");
  const [surface, setSurface] = useState(DARK);
  const [comparedOnLight, setComparedOnLight] = useState(false);
  const ratio = contrast(text, surface);
  const onDark = contrast(text, DARK);
  const isGrey = /^#([0-9a-f]{2})\1\1$/i.test(text);
  const nearThreshold = isGrey && onDark >= 4.5 && onDark <= 5;
  if (nearThreshold && surface === LIGHT && !comparedOnLight) setComparedOnLight(true);
  const goal = useGoal(nearThreshold && comparedOnLight, `Grey ${text}: ${onDark.toFixed(2)}:1 on the dark surface, ${contrast(text, LIGHT).toFixed(2)}:1 on the light page.`, onGoal);

  const verdict = (min: number) => (ratio >= min ? "pass" : "fail");
  return (
    <LabFrame title="Contrast checker" note="Real WCAG 2.x maths: relative luminance per channel, then (lighter + 0.05) / (darker + 0.05)." goalMet={goal}>
      <div className="lab__controls">
        <label className="lab__field lab__field--small">Text color<input type="color" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <label className="lab__field lab__field--small">Surface<input type="color" value={surface} onChange={(e) => setSurface(e.target.value)} /></label>
        <button type="button" className="hh-chip" aria-pressed={surface === DARK} onClick={() => setSurface(DARK)}>Dark surface</button>
        <button type="button" className="hh-chip" aria-pressed={surface === LIGHT} onClick={() => setSurface(LIGHT)}>Light page</button>
      </div>
      <div className="contrast-sample" style={{ color: text, background: surface }}>
        <p className="contrast-sample__big">Large text 24px</p>
        <p>Body text at normal size. Can you read this comfortably?</p>
      </div>
      <p className="lab__readout" aria-live="polite">
        <strong>{ratio.toFixed(2)}:1</strong> · body text (AA 4.5) <span className={`verdict verdict--${verdict(4.5)}`}>{verdict(4.5)}</span> · large text (AA 3)
        <span className={`verdict verdict--${verdict(3)}`}> {verdict(3)}</span> · UI parts (AA 3) <span className={`verdict verdict--${verdict(3)}`}>{verdict(3)}</span> · AAA body (7)
        <span className={`verdict verdict--${verdict(7)}`}> {verdict(7)}</span>
      </p>
      <p className="muted">
        Goal check: {isGrey ? `this grey is ${onDark.toFixed(2)}:1 on the dark surface` : "pick a pure grey (equal red, green and blue, like #8a8a8a)"}
        {nearThreshold && (comparedOnLight ? " ✓ compared on the light page too" : ", now switch to the light page")}.
      </p>
    </LabFrame>
  );
}
