// A hexagon badge that shows progress by how full it is (like a jar filling up).
//   fill     0 to 1: how much of the hexagon is filled with the region color
//   locked   dashed outline, no fill
//   review   a dashed violet ring around it ("time to review")
// It is decoration for numbers that are ALSO written in text nearby, so it is aria-hidden.
import { useId, type CSSProperties } from "react";

interface HexProps {
  size?: number;
  fill?: number;
  locked?: boolean;
  review?: boolean;
  hue?: number;
  label?: string; // a short text drawn in the middle (optional)
}

// Corner points of a pointy-top hexagon centred in a 100x100 box.
const POINTS = "50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5";

export function Hex({ size = 40, fill = 0, locked = false, review = false, hue, label }: HexProps) {
  const id = `hexclip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const level = Math.max(0, Math.min(1, fill));
  const classes = ["hh-hex", locked ? "hh-hex--locked" : "", review ? "hh-hex--review" : ""].join(" ");
  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="-6 -6 112 112"
      aria-hidden="true"
      style={hue === undefined ? undefined : ({ "--hue": hue } as CSSProperties)}
    >
      <defs>
        <clipPath id={id}>
          <polygon points={POINTS} />
        </clipPath>
      </defs>
      <polygon className="hh-hex__shape" points={POINTS} />
      {!locked && level > 0 && (
        <rect className="hh-hex__fill" x="0" y={100 - level * 100} width="100" height={level * 100} clipPath={`url(#${id})`} />
      )}
      {review && <polygon className="hh-hex__ring" points="50,-4 97,23 97,77 50,104 3,77 3,23" />}
      {label && (
        <text x="50" y="58" textAnchor="middle" fontSize="30" fontWeight="700" fill="currentColor" fontFamily="var(--hh-font-mono)">
          {label}
        </text>
      )}
    </svg>
  );
}
