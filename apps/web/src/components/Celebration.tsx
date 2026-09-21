// A small celebration when every test passes: falling confetti and a big message.
import { Link } from "react-router";
import { Button } from "@hexhammer/design-system";
import { art } from "../mascots";

// Twelve paper scraps. Each one gets a color from the palette (see .confetti--0 to --3 in app.css).
const CONFETTI = Array.from({ length: 12 }, (_, index) => index);

export function Celebration({
  nextStrikeId,
  level,
  backTo,
  backLabel,
}: {
  nextStrikeId: string | null;
  level: number; // only picks the color
  backTo: string; // where to go after the last strike
  backLabel: string;
}) {
  return (
    <div className="celebration" role="status">
      <div className="celebration__confetti" aria-hidden="true">
        {CONFETTI.map((index) => (
          <span
            key={index}
            className={`confetti--${index % 4}`}
            style={{ left: `${index * 8 + 2}%`, animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
      {/* A hexagon coin made of stacked layers, so it has real thickness when it spins. */}
      <div className="coin" aria-hidden="true">
        {[-6, -4, -2, 0, 2, 4].map((depth) => (
          <span
            key={depth}
            className="coin__layer"
            style={{ transform: `translateZ(${depth}px)` }}
          />
        ))}
        <span className="coin__face">H</span>
      </div>
      <img className="celebration__art" src={art.celebrate} alt="" />
      <h2>All tests passed! Strike complete!</h2>
      <p>Now write your one-sentence explanation in the Say card, then keep going.</p>
      <Link to={nextStrikeId ? `/strike/${nextStrikeId}` : backTo}>
        <Button level={level}>{nextStrikeId ? "Next strike" : backLabel}</Button>
      </Link>
    </div>
  );
}
