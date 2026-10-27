// BUILD ART: a small illustration of the thing being built, drawn from the project's TYPE, in its
// region's color. Inside it, the real "finished when" line of the project, so the picture is also
// an honest preview of the finished result.
//
//   exercise / implementation  a terminal window printing the result
//   application                a browser window with a little layout
//   architecture               boxes joined by lines (a system diagram)
//   debugging-lab              a bug under a magnifying glass, then a green tick
import type { CSSProperties } from "react";

export function BuildArt({ type, hue, preview, progress = 0 }: { type: string; hue: number; preview: string; progress?: number }) {
  const clean = preview.replace(/`/g, "");
  const short = clean.length > 46 ? `${clean.slice(0, 44)}…` : clean;
  return (
    <svg className="buildart" viewBox="0 0 320 170" style={{ "--hue": hue } as CSSProperties} aria-hidden="true">
      <defs>
        <linearGradient id={`ba-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 60% 22%)`} />
          <stop offset="1" stopColor="#070b14" />
        </linearGradient>
      </defs>
      <rect width="320" height="170" fill={`url(#ba-${hue})`} />
      {/* a faint grid floor */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={i * 46} y1="170" x2={160 + (i - 3.5) * 14} y2="110" className="buildart__floor" />
      ))}

      {(type === "exercise" || type === "implementation") && (
        <g transform="translate(40 26)">
          <rect width="240" height="118" rx="10" className="buildart__window" />
          <circle cx="16" cy="14" r="4" className="buildart__led" />
          <circle cx="30" cy="14" r="4" className="buildart__led" />
          <text x="16" y="48" className="buildart__mono">$ run build</text>
          <text x="16" y="70" className="buildart__mono buildart__mono--ok">✓ {short.slice(0, 28)}</text>
          <text x="16" y="88" className="buildart__mono buildart__mono--dim">{short.slice(28)}</text>
          <rect x="16" y="98" width="8" height="12" className="buildart__caret" />
        </g>
      )}
      {type === "application" && (
        <g transform="translate(40 22)">
          <rect width="240" height="126" rx="10" className="buildart__window" />
          <rect x="12" y="26" width="216" height="10" rx="5" className="buildart__bar" />
          <rect x="12" y="46" width="70" height="66" rx="6" className="buildart__block" />
          <rect x="92" y="46" width="136" height="28" rx="6" className="buildart__block buildart__block--lit" />
          <rect x="92" y="84" width="136" height="28" rx="6" className="buildart__block" />
          <circle cx="16" cy="13" r="4" className="buildart__led" />
        </g>
      )}
      {type === "architecture" && (
        <g transform="translate(30 30)">
          <path d="M60 20 H130 M190 20 H200 M130 20 V90 H200 M60 20 V90 H130" className="buildart__wire" />
          <rect x="0" y="0" width="70" height="40" rx="8" className="buildart__block buildart__block--lit" />
          <rect x="125" y="0" width="70" height="40" rx="8" className="buildart__block" />
          <rect x="190" y="70" width="70" height="40" rx="8" className="buildart__block" />
          <rect x="60" y="70" width="70" height="40" rx="8" className="buildart__block" />
          {/* A packet travelling the wires (CSS offset-path, so reduced motion stops it). */}
          <circle r="5" className="buildart__packet" style={{ offsetPath: "path('M35 20 H160 V90 H225')" }} />
        </g>
      )}
      {type === "debugging-lab" && (
        <g transform="translate(110 22)">
          <circle cx="50" cy="56" r="44" className="buildart__lens" />
          <path d="M82 88 L112 118" className="buildart__handle" />
          <ellipse cx="50" cy="60" rx="14" ry="18" className="buildart__bug" />
          <path d="M36 50 L24 42 M36 62 L22 62 M36 74 L24 82 M64 50 L76 42 M64 62 L78 62 M64 74 L76 82" className="buildart__legs" />
        </g>
      )}

      {/* progress along the bottom */}
      <rect x="0" y="166" width="320" height="4" className="buildart__track" />
      <rect x="0" y="166" width={320 * progress} height="4" className="buildart__progress" />
    </svg>
  );
}
