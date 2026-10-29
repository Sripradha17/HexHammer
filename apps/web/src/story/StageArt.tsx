// THE PAINTED STAGE: draws what the quest's stage state (stage.tsx) says, using the paintings.
//
// Every stage is one big painting that fills the screen, with a few things drawn ON it in the
// painting's own coordinates (so they stay in place at any screen size):
//   forge   = the archive with the great hanging crystal: the Rune Engine. The 8 lanterns are rune
//             stones floating in a row above its floor circle. Each lit stone sends a beam of energy up to the crystal,
//             and the crystal glows brighter the bigger the number. The binary digits above flip
//             as they change. When the puzzle is REALLY solved (stage.solved), the engine wakes:
//             every beam flares, a pillar of light drops from the crystal and the floor ring lights.
//   village = Byteford by the waterfall; the bridge (dark until the Bridge Trial is passed, then
//             its lanterns light one by one as the light sweeps across); or the night market with
//             Rosa's bakery sign.
//   Bram    = the owl, whose pose follows his mood (art/Bram.tsx). For the "bram" shot he steps
//             into the middle and grows, like a film cutting to a close-up.
//
// Everything here is decoration (aria-hidden): the panel beside it holds the real buttons and
// words. The stones can also be clicked with a mouse, as a shortcut for the lantern buttons.
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BramFigure, poseFor } from "../art/Bram";
import { STAGE_SCENES, scene } from "../art/realm";
import { LANTERN_VALUES, runeValue, useStage } from "./stage";

// The paintings are 1680 x 944; overlays use those same units.
const W = 1680;
const H = 944;
const at = (xPct: number, yPct: number) => ({ x: (xPct / 100) * W, y: (yPct / 100) * H });

// The Rune Engine (picture 8): the crystal, the floor circle, and the 8 stones floating in a
// gentle smile-shaped row above the floor (high enough that Bram never stands in front of them).
const CRYSTAL = at(64.2, 27);
const FLOOR = at(42.4, 85);
const STONES = LANTERN_VALUES.map((_, i) => at(30 + (i * 46) / 7, 58 + 5 * Math.sin((Math.PI * i) / 7)));
// The bridge's crystal lanterns (picture 27), left to right.
const BRIDGE_LAMPS = [at(29.5, 47), at(41, 48), at(52, 49), at(57, 48), at(61.5, 49), at(68, 47.5), at(75.5, 47)];

const hex = (n: number) => n.toString(16).toUpperCase();

// One painting filling the stage. `focus` (0..1) is the part of the painting to keep in view,
// left to right; overlays are drawn into the SVG in painting units.
function Painting({ n, focus, className = "", children, lit }: { n: number; focus: number; className?: string; children?: ReactNode; lit?: ReactNode }) {
  return (
    <div className={`stage__canvas ${className}`} style={{ "--fx": focus } as CSSProperties}>
      <img className="stage__art" src={scene(n)} alt="" draggable={false} />
      {lit}
      <svg className="stage__over" viewBox={`0 0 ${W} ${H}`}>
        {children}
      </svg>
    </div>
  );
}

function Sparks({ burst }: { burst: number }) {
  if (!burst) return null;
  return (
    <span className="sparks" key={burst} aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ "--a": `${(i * 360) / 16}deg`, "--d": `${80 + (i % 3) * 40}px` } as CSSProperties} />
      ))}
    </span>
  );
}

function Engine() {
  const { stage, toggleBit } = useStage();
  const value = runeValue(stage.bits);
  const power = stage.lanterns ? value / 255 : 0;
  return (
    <>
      <Painting n={STAGE_SCENES.engine} focus={0.5} className={stage.solved ? "is-awake" : ""}>
        <defs>
          <radialGradient id="crystal-glow">
            <stop offset="0" stopColor="#d9f8ff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#5fd8f5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5fd8f5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pillar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e6fbff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5fd8f5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* The crystal's light: brighter as the rune's number grows. */}
        <circle className="engine__crystal" cx={CRYSTAL.x} cy={CRYSTAL.y} r={110 + 170 * power} fill="url(#crystal-glow)" style={{ "--power": power } as CSSProperties} />
        {stage.solved && (
          <>
            {/* The engine wakes: a pillar of light, and the floor circle lights up. */}
            <rect className="engine__pillar" x={CRYSTAL.x - 26} y={CRYSTAL.y} width="52" height={FLOOR.y - CRYSTAL.y} fill="url(#pillar)" />
            <ellipse className="engine__ring" cx={FLOOR.x} cy={FLOOR.y} rx={0.24 * W} ry={0.08 * H} pathLength={100} />
          </>
        )}
        {stage.lanterns &&
          STONES.map((s, i) => {
            const on = stage.bits[i];
            return (
              <g key={i} className={`stone ${on ? "is-on" : ""}`} style={{ "--i": i } as CSSProperties} onClick={() => !stage.solved && toggleBit(i)}>
                {/* Energy travelling from a lit stone up to the crystal. */}
                {on && <path className="stone__beam" d={`M${s.x} ${s.y - 34} Q${(s.x + CRYSTAL.x) / 2} ${s.y - 260} ${CRYSTAL.x} ${CRYSTAL.y + 40}`} pathLength={100} />}
                <polygon className="stone__body" points={`${s.x},${s.y - 40} ${s.x + 30},${s.y - 22} ${s.x + 30},${s.y + 12} ${s.x},${s.y + 30} ${s.x - 30},${s.y + 12} ${s.x - 30},${s.y - 22}`} />
                <text className="stone__value" x={s.x} y={s.y + 2}>
                  {LANTERN_VALUES[i]}
                </text>
              </g>
            );
          })}
      </Painting>
      {stage.lanterns && (
        <div className={`readout ${stage.solved ? "is-won" : ""}`}>
          <span className="readout__bits">
            {stage.bits.map((b, i) => (
              // The key includes the bit, so a changed digit is a NEW element and plays its flip.
              <span key={`${i}-${b}`} className={`readout__bit ${b ? "is-on" : ""} ${stage.hex && i === 3 ? "readout__bit--half" : ""}`}>
                {b ? 1 : 0}
              </span>
            ))}
          </span>
          <span className="readout__value" key={value}>
            {stage.hex ? `${hex(value >> 4)}${hex(value & 15)}` : value}
          </span>
          {stage.solved && <span className="readout__woke">The Rune Engine wakes!</span>}
        </div>
      )}
    </>
  );
}

function Village() {
  const { stage } = useStage();
  if (stage.shot === "sign")
    return (
      <Painting n={STAGE_SCENES.market} focus={0.45}>
        <g className={`sign ${stage.signFixed ? "is-fixed" : ""}`} transform={`translate(${0.26 * W} ${0.04 * H})`}>
          <g className="sign__swing">
            <path className="sign__chain" d="M70 0 V40 M290 0 V40" />
            <rect className="sign__board" x="0" y="40" width="360" height="104" rx="14" />
            <text className="sign__text" x="180" y="106" key={String(stage.signFixed)}>
              {stage.signFixed ? "José's Bakery" : "JosÃ©'s Bakery"}
            </text>
          </g>
        </g>
      </Painting>
    );
  if (stage.shot === "bridge")
    return (
      <Painting
        n={STAGE_SCENES.bridge}
        focus={0.52}
        className={stage.bridgeFixed ? "is-fixed" : "is-dark"}
        // The repaired bridge: the same painting at full colour, revealed by a sweep of light.
        lit={stage.bridgeFixed ? <img className="stage__lit" src={scene(STAGE_SCENES.bridge)} alt="" /> : null}
      >
        {BRIDGE_LAMPS.map((p, i) => (
          <circle key={i} className="lamp" cx={p.x} cy={p.y} r="16" style={{ "--i": i } as CSSProperties} />
        ))}
      </Painting>
    );
  return <Painting n={STAGE_SCENES.village} focus={0.55} />;
}

export function StageArt() {
  const { stage } = useStage();
  // A cheer shows the cheering painting for a moment, then Bram settles back.
  const [cheering, setCheering] = useState(false);
  useEffect(() => {
    if (!stage.cheer) return;
    setCheering(true);
    const t = setTimeout(() => setCheering(false), 1800);
    return () => clearTimeout(t);
  }, [stage.cheer]);

  const pointing = stage.shot === "sign" || stage.shot === "bridge" || stage.shot === "lanterns";
  const pose = poseFor(stage.mood, stage.talking, pointing, cheering);
  const n = stage.painting ?? (stage.scene === "forge" ? STAGE_SCENES.engine : stage.shot === "sign" ? STAGE_SCENES.market : stage.shot === "bridge" ? STAGE_SCENES.bridge : STAGE_SCENES.village);

  return (
    <div className={`stage stage--${stage.scene} shot--${stage.shot}`} aria-hidden="true">
      {/* Behind: the same painting, blurred, filling any edge the main painting leaves. */}
      <img className="stage__ambient" src={scene(n, true)} alt="" key={`ambient-${n}`} />
      <div className="stage__room" key={stage.painting ? `painting-${stage.painting}` : `${stage.scene}-${stage.shot === "sign" || stage.shot === "bridge" ? stage.shot : "main"}`}>
        {stage.painting ? <Painting n={stage.painting} focus={0.5} /> : stage.scene === "forge" ? <Engine /> : <Village />}
      </div>
      <Sparks burst={stage.cheer} />
      <BramFigure pose={pose} className="stage__bram" />
    </div>
  );
}
