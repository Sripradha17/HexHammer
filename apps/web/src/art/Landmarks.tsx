// LANDMARKS: one illustrated place for each of the 16 regions of the Kingdom of Hex.
//
// Art direction: SILHOUETTES. Every building is a dark shape against a glowing sky (the way Hollow
// Knight and Ori draw their worlds). Detail comes from the outline, from warm lit windows, and from
// a soft rim of light, never from blocky shapes. Each landmark is drawn around (0, 0) = the middle
// of its base, about 170 wide and 180 tall, so the map can place and scale it.
//
// `lit` lights the windows (an open region); `glow` is the region's accent light (teal or amber).
import type { ReactNode } from "react";

const BODY = "url(#lm-body)"; // dark silhouette gradient, defined once in <LandmarkDefs>

// A small arched window. Lit windows glow warm amber.
function Win({ x, y, w = 7, h = 12, lit }: { x: number; y: number; w?: number; h?: number; lit: boolean }) {
  return <path d={`M${x} ${y} v${-h + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${h - w / 2}z`} className={lit ? "lm-win is-lit" : "lm-win"} />;
}

// The ground each landmark stands on: a soft organic mound, not a platform.
function Mound({ w = 190 }: { w?: number }) {
  return <path d={`M${-w / 2} 6 C${-w / 3} -14 ${-w / 6} -18 0 -18 C${w / 6} -18 ${w / 3} -14 ${w / 2} 6 Z`} className="lm-mound" />;
}

type Draw = (lit: boolean) => ReactNode;

const library: Draw = (lit) => (
  <>
    <Mound />
    <path fill={BODY} d="M-62 -12 V-70 L-50 -78 H50 L62 -70 V-12 Z" />
    <path fill={BODY} d="M-46 -78 C-46 -120 -24 -136 0 -138 C24 -136 46 -120 46 -78 Z" />
    <path fill={BODY} d="M-3 -138 L0 -162 L3 -138 Z" />
    {[-40, -22, 15, 33].map((x) => (
      <Win key={x} x={x} y={-22} w={9} h={30} lit={lit} />
    ))}
    <Win x={-6} y={-90} w={12} h={22} lit={lit} />
    {/* the floating ring of runes above the dome */}
    <g className="lm-runes" transform="translate(0 -190)">
      <circle r="24" className="lm-rune-ring" />
      <circle r="16" className="lm-rune-ring lm-rune-ring--inner" />
    </g>
  </>
);

const harbor: Draw = (lit) => (
  <>
    <Mound w={210} />
    <path className="lm-beam" d="M0 -132 L170 -170 L170 -100 Z" />
    <path fill={BODY} d="M-16 -12 L-10 -120 H10 L16 -12 Z" />
    <path fill={BODY} d="M-14 -120 H14 V-136 C14 -150 -14 -150 -14 -136 Z" />
    <circle cx="0" cy="-130" r="5" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
    <path fill={BODY} d="M-80 -12 V-40 L-64 -54 L-48 -40 V-12 Z M28 -12 V-34 L42 -46 L56 -34 V-12 Z" />
    <Win x={-68} y={-20} lit={lit} />
    <Win x={38} y={-18} lit={lit} />
    {/* a little sailing boat */}
    <path fill={BODY} d="M60 -6 C70 2 98 2 108 -6 Z M84 -8 V-48 C96 -38 100 -20 100 -10 Z" />
  </>
);

const spires: Draw = (lit) => (
  <>
    <Mound />
    {[
      [-60, 22, 92],
      [-34, 18, 130],
      [-12, 24, 165],
      [16, 20, 120],
      [40, 22, 100],
    ].map(([x, w, h]) => (
      <path key={x} fill={BODY} d={`M${x} -12 V${-h} C${x} ${-h - 16} ${x + w / 2} ${-h - 34} ${x + w / 2} ${-h - 40} C${x + w / 2} ${-h - 34} ${x + w} ${-h - 16} ${x + w} ${-h} V-12 Z`} />
    ))}
    <path fill="none" className="lm-bridge" d="M-38 -80 Q-24 -92 -12 -80 M10 -100 Q22 -110 36 -92" />
    {[-55, -29, -6, 21, 45].map((x, i) => (
      <Win key={x} x={x} y={-40 - (i % 2) * 30} w={7} h={11} lit={lit} />
    ))}
  </>
);

const palace: Draw = (lit) => (
  <>
    <Mound />
    <path fill={BODY} d="M-58 -12 V-74 H58 V-12 Z" />
    <path fill={BODY} d="M-26 -74 C-46 -96 -14 -128 0 -150 C14 -128 46 -96 26 -74 Z" />
    <path fill={BODY} d="M-66 -12 V-96 C-66 -112 -52 -112 -52 -96 V-12 Z M52 -12 V-96 C52 -112 66 -112 66 -96 V-12 Z" />
    <circle cx="-59" cy="-118" r="9" fill={BODY} />
    <circle cx="59" cy="-118" r="9" fill={BODY} />
    <path fill={BODY} d="M-1 -150 L0 -168 L1 -150 Z" />
    <Win x={-8} y={-24} w={16} h={36} lit={lit} />
    <Win x={-40} y={-34} lit={lit} />
    <Win x={33} y={-34} lit={lit} />
  </>
);

const forge: Draw = (lit) => (
  <>
    <Mound w={200} />
    <path fill={BODY} d="M-74 -12 V-58 L-50 -78 V-58 L-26 -78 V-58 L-2 -78 V-58 L22 -78 V-12 Z" />
    <path fill={BODY} d="M30 -12 V-120 H44 V-12 Z M54 -12 V-96 H66 V-12 Z" />
    <g className="lm-smoke">
      <circle cx="37" cy="-134" r="9" />
      <circle cx="44" cy="-152" r="13" />
      <circle cx="60" cy="-110" r="7" />
    </g>
    <circle cx="-26" cy="-34" r="15" className={lit ? "lm-furnace is-lit" : "lm-furnace"} />
    <Win x={-62} y={-24} lit={lit} />
    <Win x={2} y={-24} lit={lit} />
  </>
);

const archive: Draw = (lit) => (
  <>
    <Mound />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${-16 - i * 40})`}>
        <path fill={BODY} d={`M${-56 + i * 8} 0 V-36 H${56 - i * 8} V0 Z`} />
        <ellipse cx="0" cy="-36" rx={56 - i * 8} ry="8" fill={BODY} />
        {[-30, -10, 10, 30].slice(0, 4 - i).map((x) => (
          <Win key={x} x={x + i * 4 - 3} y={-6} w={6} h={18} lit={lit} />
        ))}
      </g>
    ))}
    <path className={lit ? "lm-crystal is-lit" : "lm-crystal"} d="M0 -176 L10 -152 L0 -140 L-10 -152 Z" />
  </>
);

const bridges: Draw = (lit) => (
  <>
    <Mound w={220} />
    <path fill={BODY} d="M-78 -12 V-130 L-68 -146 L-58 -130 V-12 Z M58 -12 V-110 L68 -126 L78 -110 V-12 Z" />
    <path fill={BODY} d="M-58 -70 Q0 -116 58 -60 V-52 Q0 -100 -58 -62 Z" />
    <path fill={BODY} d="M-58 -30 Q0 -60 58 -26 V-20 Q0 -50 -58 -24 Z" />
    <Win x={-72} y={-90} lit={lit} />
    <Win x={64} y={-74} lit={lit} />
    <circle cx="-68" cy="-152" r="4" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
    <circle cx="68" cy="-132" r="4" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
  </>
);

const tower: Draw = (lit) => (
  <>
    <Mound w={170} />
    <path fill={BODY} d="M-22 -12 L-14 -170 L0 -210 L14 -170 L22 -12 Z" />
    <path fill={BODY} d="M-60 -12 Q-50 -60 -18 -100 L-16 -84 Q-42 -52 -46 -12 Z M60 -12 Q50 -60 18 -100 L16 -84 Q42 -52 46 -12 Z" />
    <Win x={-4} y={-60} w={8} h={16} lit={lit} />
    <Win x={-3} y={-120} w={6} h={14} lit={lit} />
    <circle cx="0" cy="-178" r="4" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
  </>
);

const arena: Draw = (lit) => (
  <>
    <Mound w={210} />
    <path fill={BODY} d="M-82 -12 V-58 C-40 -76 40 -76 82 -58 V-12 Z" />
    {[-64, -40, -16, 8, 32, 56].map((x) => (
      <path key={x} d={`M${x} -14 v-20 a8 8 0 0 1 16 0 v20 z`} className={lit ? "lm-win is-lit" : "lm-win"} />
    ))}
    <path fill={BODY} d="M-4 -74 V-110 H2 V-74 Z" />
    <path className="lm-banner" d="M2 -110 L28 -104 L2 -96 Z" />
  </>
);

const observatory: Draw = (lit) => (
  <>
    <Mound />
    <path fill={BODY} d="M-50 -12 V-60 H50 V-12 Z" />
    <path fill={BODY} d="M-46 -60 C-46 -110 46 -110 46 -60 Z" />
    <path fill={BODY} d="M6 -84 L66 -132 L72 -124 L14 -76 Z" />
    <path className={lit ? "lm-slit is-lit" : "lm-slit"} d="M-4 -100 L4 -100 L8 -62 L-8 -62 Z" />
    <Win x={-34} y={-22} lit={lit} />
    <Win x={26} y={-22} lit={lit} />
  </>
);

const wall: Draw = (lit) => (
  <>
    <Mound w={220} />
    <path fill={BODY} d="M-88 -12 V-62 H-78 V-70 H-68 V-62 H-58 V-70 H-48 V-62 H48 V-70 H58 V-62 H68 V-70 H78 V-62 H88 V-12 Z" />
    <path fill={BODY} d="M-26 -62 V-110 H-20 V-118 H-12 V-110 H12 V-118 H20 V-110 H26 V-62 Z" />
    <path d="M-12 -12 V-34 C-12 -46 12 -46 12 -34 V-12 Z" className={lit ? "lm-win is-lit" : "lm-win"} />
    <path className="lm-shield" d="M-8 -96 H8 V-86 C8 -78 0 -74 0 -74 C0 -74 -8 -78 -8 -86 Z" />
    <Win x={-70} y={-30} lit={lit} />
    <Win x={62} y={-30} lit={lit} />
  </>
);

const watchtower: Draw = (lit) => (
  <>
    <Mound w={170} />
    <path className="lm-beam lm-beam--soft" d="M0 -150 L-150 -200 L-150 -120 Z" />
    <path fill={BODY} d="M-24 -12 L-16 -128 H16 L24 -12 Z" />
    <path fill={BODY} d="M-26 -128 H26 L16 -150 H-16 Z" />
    <circle cx="0" cy="-140" r="6" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
    <Win x={-4} y={-40} w={8} h={16} lit={lit} />
    <Win x={-4} y={-84} w={8} h={14} lit={lit} />
  </>
);

const grove: Draw = (lit) => (
  <>
    <Mound w={220} />
    <path fill={BODY} d="M-10 -12 C-6 -50 -14 -80 -30 -100 C-12 -90 -4 -76 0 -64 C4 -82 16 -96 34 -104 C14 -84 8 -50 10 -12 Z" />
    <path fill={BODY} d="M-86 -110 C-96 -150 -56 -186 -16 -176 C0 -206 52 -204 64 -170 C100 -170 108 -122 78 -106 C60 -88 -60 -86 -86 -110 Z" />
    {[
      [-52, -132],
      [-10, -160],
      [30, -140],
      [62, -124],
      [8, -118],
    ].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="4.5" className={lit ? "lm-fruit is-lit" : "lm-fruit"} />
    ))}
  </>
);

const golem: Draw = (lit) => (
  <>
    <Mound />
    <path fill={BODY} d="M-48 -12 L-40 -120 C-38 -150 38 -150 40 -120 L48 -12 Z" />
    <path className={lit ? "lm-eye is-lit" : "lm-eye"} d="M-18 -110 C-8 -122 8 -122 18 -110 C8 -100 -8 -100 -18 -110 Z" />
    <g className="lm-stones">
      <path fill={BODY} d="M-80 -120 l12 -6 l6 10 l-10 8 z" />
      <path fill={BODY} d="M66 -146 l14 -4 l2 12 l-12 4 z" />
      <path fill={BODY} d="M72 -80 l10 -2 l2 9 l-9 3 z" />
    </g>
    <Win x={-6} y={-28} w={12} h={26} lit={lit} />
  </>
);

const guild: Draw = (lit) => (
  <>
    <Mound w={220} />
    <path fill={BODY} d="M-84 -12 V-64 L-52 -100 L-20 -64 L12 -100 L44 -64 L76 -100 L84 -90 V-12 Z" />
    <path className="lm-banner" d="M-56 -60 h10 v26 l-5 -6 l-5 6 z" />
    <path className="lm-banner lm-banner--b" d="M40 -60 h10 v26 l-5 -6 l-5 6 z" />
    {[-30, -6, 18, 62].map((x) => (
      <Win key={x} x={x} y={-24} w={8} h={18} lit={lit} />
    ))}
  </>
);

const peaks: Draw = (lit) => (
  <>
    <path fill={BODY} d="M-110 6 L-46 -150 L-20 -96 L10 -200 L60 -92 L82 -130 L120 6 Z" />
    <path className="lm-snow" d="M10 -200 L24 -168 L12 -176 L2 -160 L-4 -178 Z" />
    {/* a dragon circling the highest peak */}
    <path className={lit ? "lm-dragon is-lit" : "lm-dragon"} d="M-70 -196 C-56 -206 -40 -204 -30 -196 C-20 -210 -6 -214 4 -206 C-8 -204 -14 -196 -18 -190 C-30 -194 -44 -192 -54 -186 C-58 -192 -64 -194 -70 -196 Z" />
    <circle cx="-30" cy="-60" r="4" className={lit ? "lm-lamp is-lit" : "lm-lamp"} />
  </>
);

export const LANDMARKS: Record<string, Draw> = {
  cs: library,
  web: harbor,
  fe: spires,
  ds: palace,
  be: forge,
  db: archive,
  dist: bridges,
  arch: tower,
  test: arena,
  ops: observatory,
  sec: wall,
  obs: watchtower,
  ml: grove,
  ai: golem,
  pt: guild,
  adv: peaks,
};

// Shared gradients and glows. Put this ONCE inside any <svg> that draws landmarks.
export function LandmarkDefs() {
  return (
    <defs>
      <linearGradient id="lm-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a3170" />
        <stop offset="0.55" stopColor="#151a44" />
        <stop offset="1" stopColor="#0a0e28" />
      </linearGradient>
      <radialGradient id="lm-halo" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="var(--halo, #5fd6c8)" stopOpacity="0.55" />
        <stop offset="1" stopColor="var(--halo, #5fd6c8)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="lm-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffd89a" stopOpacity="0.55" />
        <stop offset="1" stopColor="#ffd89a" stopOpacity="0" />
      </linearGradient>
      <filter id="lm-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id="lm-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
