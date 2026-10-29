// BRAM, THE OWL GUIDE: made from the owl paintings (see art/realm.ts).
//
//   <BramFigure>  the cut-out owl. He changes pose by swapping to a different painting (thinking,
//                 pointing, cheering...), like a flip-book. He breathes with a tiny bob, BLINKS
//                 for real (a closed-eyes patch from his own blink painting), and arrives by
//                 flying in. He is never stretched.
//   <BramHero>    the big Bram on Home, standing on a glowing rune circle. Tap him and he reacts
//                 and gives the next study tip.
//   <BramFace>    his face in a round frame, next to what he says. The face follows his mood.
//
// All movement is CSS (styles/realm.css), so reduced-motion settings switch it off.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BLINK, OWL_FACES, OWL_POSES, POSE_HEIGHT, type Face, type Pose } from "./realm";

// His moods in the story, and which face goes with each one.
export type Mood = "happy" | "think" | "wow" | "proud" | "oops";
const FACE_FOR: Record<Mood, Face> = { happy: "grin", think: "think", wow: "wow", proud: "proud", oops: "oops" };

// Which painting to show. A cheer wins over everything; then the mood; while he talks about
// something on stage he points at it, otherwise he explains with an open wing.
export function poseFor(mood: Mood, talking: boolean, pointing: boolean, cheering: boolean): Pose {
  if (cheering) return "cheer";
  if (mood === "wow") return "wow";
  if (mood === "think") return "think";
  if (mood === "oops") return "oops";
  if (talking && pointing) return "point";
  if (talking) return "explain";
  if (mood === "proud") return "proud";
  return "stand";
}

const ALL_POSES = Object.keys(OWL_POSES) as Pose[];

// Reduced motion (the system setting, or the app's own setting): no flying in, he is simply there.
const stillMode = () =>
  document.documentElement.dataset.motion === "reduce" ||
  (document.documentElement.dataset.motion !== "full" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// `scale` = how many screen pixels per painting pixel (0.18 is about 270px tall when standing).
export function BramFigure({ pose, scale = 0.18, className = "", arrive = true }: { pose: Pose; scale?: number; className?: string; arrive?: boolean }) {
  // He flies in first (the flying painting), then lands in the pose he was asked for.
  const [landed, setLanded] = useState(() => !arrive || stillMode());
  useEffect(() => {
    if (landed) return;
    const t = setTimeout(() => setLanded(true), 1100);
    return () => clearTimeout(t);
  }, [landed]);
  const shown: Pose = landed ? pose : "fly";

  // A little hop each time the pose changes, so the swap reads as a movement, not a cut.
  const [hop, setHop] = useState(0);
  const last = useRef(shown);
  useEffect(() => {
    if (last.current !== shown) setHop((h) => h + 1);
    last.current = shown;
  }, [shown]);

  return (
    <div className={`owl ${landed ? "" : "is-arriving"} ${className}`} data-pose={shown} style={{ "--k": scale } as CSSProperties} aria-hidden="true">
      <span className="owl__shadow" />
      <div className="owl__breath">
        <div className="owl__hop" key={hop}>
          {/* Every painting is on the page at once (so swapping is instant); only one is visible. */}
          {ALL_POSES.map((p) => (
            <img key={p} className={`owl__pose ${p === shown ? "is-on" : ""}`} style={{ "--n": POSE_HEIGHT[p] } as CSSProperties} src={OWL_POSES[p]} alt="" draggable={false} />
          ))}
          {/* The blink: closed eyes laid over the standing painting, shown for a moment now and then. */}
          {shown === "stand" && (
            <span className="owl__blinkbox" style={{ "--n": POSE_HEIGHT.stand } as CSSProperties}>
              <img className="owl__blink" src={BLINK.src} alt="" style={{ left: `${BLINK.left}%`, top: `${BLINK.top}%`, width: `${BLINK.width}%`, height: `${BLINK.height}%` }} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Home's big Bram. Each tap: a happy reaction pose for a moment, and the next tip.
const REACTIONS: Pose[] = ["cheer", "wow", "proud", "explain", "point"];

export function BramHero({ lines }: { lines: string[] }) {
  const [at, setAt] = useState(0);
  const [reaction, setReaction] = useState<Pose | null>(null);
  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(null), 1600);
    return () => clearTimeout(t);
  }, [reaction]);

  function tap() {
    setAt((a) => (a + 1) % lines.length);
    setReaction(REACTIONS[at % REACTIONS.length]);
  }

  return (
    <figure className="owl-hero">
      <button type="button" className="owl-hero__tap" onClick={tap} aria-label="Bram, the guide of Hexhammer: a wise owl wizard. Tap for a tip.">
        <svg className="owl-hero__circle" viewBox="0 0 400 120" aria-hidden="true">
          <ellipse cx="200" cy="60" rx="190" ry="50" className="owl-hero__ring owl-hero__ring--outer" />
          <ellipse cx="200" cy="60" rx="150" ry="38" className="owl-hero__ring owl-hero__ring--mid" pathLength={100} />
          <ellipse cx="200" cy="60" rx="100" ry="24" className="owl-hero__ring owl-hero__ring--inner" />
        </svg>
        <BramFigure pose={reaction ?? "stand"} scale={0.34} className="owl-hero__owl" />
      </button>
      <figcaption className="owl-hero__line" key={at} aria-live="polite">
        <span className="owl-hero__who">Bram</span> {lines[at]}
        {lines.length > 1 && <span className="owl-hero__more">Tap Bram for another tip</span>}
      </figcaption>
    </figure>
  );
}

export function BramFace({ mood, size = 56 }: { mood: Mood; size?: number }) {
  const face = FACE_FOR[mood];
  return (
    <span className="owl-face" style={{ width: size, height: size }} aria-hidden="true">
      {(Object.keys(OWL_FACES) as Face[]).map((f) => (
        <img key={f} className={f === face ? "is-on" : ""} src={OWL_FACES[f]} alt="" />
      ))}
    </span>
  );
}
