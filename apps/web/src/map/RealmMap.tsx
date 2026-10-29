// THE REALM MAP: the painted world map, brought to life in layers.
//
//   1. the painting itself (one flat picture)
//   2. COOL light: only the cyan crystal pixels of the painting, on their own layer. It breathes.
//   3. WARM light: only the golden road and window pixels, on their own layer. A band of light
//      sweeps through it, so light seems to travel along the painted roads.
//   4. links: for the selected town, a line to the towns that open it and the towns it opens.
//      Small packets of light travel along the open ones.
//   5. the town medallions: real buttons, one per region, showing its true state
//      (locked / open / in progress / complete), and "you are here".
//   6. in front: five painted clouds and a band of mist, each drifting at its own speed, and each
//      moving more than the map when the pointer moves (parallax: nearer things move more).
//
// Layers 2 and 3 were cut out of the painting by scripts/cut-art.mjs; nothing is painted over.
// Every state comes from the server (/atlas/map). Motion stops under reduced-motion settings.
import type { CSSProperties } from "react";
import type { Region } from "../atlasApi";
import { CLOUDS, MAP, MIST, regionArt } from "../art/realm";
import { TOWNS } from "../story/quests";
import { REGION_STATE_LABEL, regionState } from "./regionState";

interface Props {
  regions: Region[];
  selectedId: string | null;
  hereId: string;
  onSelect: (id: string) => void;
  fresh?: Set<string>; // regions unlocked since my last visit: they play the unlock sequence
  mode: "home" | "world";
}

// Where each cloud floats: height on screen (%), size, speed (s), and depth (how much it follows
// the pointer). Far clouds are small, slow and faint; near ones big, faster and stronger.
// `at` = how far along its trip each cloud starts (0..1), so some are already on screen.
const CLOUD_LAYOUT = [
  { img: 2, top: 8, width: 26, dur: 140, at: 0.42, depth: 14, far: true },
  { img: 0, top: 30, width: 20, dur: 170, at: 0.68, depth: 18, far: true },
  { img: 3, top: 58, width: 30, dur: 120, at: 0.55, depth: 26, far: false },
  { img: 1, top: 76, width: 40, dur: 95, at: 0.3, depth: 40, far: false },
  { img: 4, top: 16, width: 34, dur: 110, at: 0.78, depth: 34, far: false },
];

// Map percentages -> SVG units (the SVG uses the picture's own pixel size).
const px = (x: number) => (x / 100) * MAP.width;
const py = (y: number) => (y / 100) * MAP.height;

// A gentle curve between two towns (it bows sideways, like a road would).
function linkPath(from: string, to: string) {
  const a = regionArt(from);
  const b = regionArt(to);
  const [x1, y1, x2, y2] = [px(a.x), py(a.y), px(b.x), py(b.y)];
  const bow = 0.18;
  const cx = (x1 + x2) / 2 - (y2 - y1) * bow;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bow;
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
}

export function RealmMap({ regions, selectedId, hereId, onSelect, fresh, mode }: Props) {
  const selected = regions.find((r) => r.id === selectedId);
  // The links worth showing: what opens the selected town, and what it opens. Nothing else, so
  // the painting is never covered in lines.
  const links = selected
    ? [
        ...selected.unlockedBy.map((from) => ({ from, to: selected.id, open: selected.unlocked })),
        ...regions.filter((r) => r.unlockedBy.includes(selected.id)).map((r) => ({ from: selected.id, to: r.id, open: r.unlocked })),
      ]
    : [];
  // The unlock sequence also draws the road from the town that opened it.
  const unlockLinks = regions
    .filter((r) => fresh?.has(r.id))
    .flatMap((r) => r.unlockedBy.filter((from) => regions.find((x) => x.id === from)?.unlocked).map((from) => ({ from, to: r.id })));
  const focus = regionArt(selectedId ?? hereId);

  return (
    <div className={`rmap rmap--${mode}`} style={{ "--fx": `${focus.x}%`, "--fy": `${focus.y}%` } as CSSProperties}>
      {/* Behind everything: the same painting, blurred, filling any space the map does not. */}
      <img className="rmap__ambient" src={MAP.src} alt="" aria-hidden="true" />
      <div className="rmap__stage">
        <div className="rmap__canvas">
          <img className="rmap__base" src={MAP.src} alt="" width={MAP.width} height={MAP.height} draggable={false} />
          <img className="rmap__cool" src={MAP.cool} alt="" aria-hidden="true" draggable={false} />
          <img className="rmap__warm" src={MAP.warm} alt="" aria-hidden="true" draggable={false} />
          <div className="rmap__flow" style={{ maskImage: `url(${MAP.warm})`, WebkitMaskImage: `url(${MAP.warm})` }} aria-hidden="true" />

          <svg className="rmap__links" viewBox={`0 0 ${MAP.width} ${MAP.height}`} aria-hidden="true">
            {links.map((l) => {
              const d = linkPath(l.from, l.to);
              return (
                <g key={`${l.from}-${l.to}`} className={l.open ? "rlink is-open" : "rlink"}>
                  <path d={d} className="rlink__road" />
                  {l.open && (
                    <>
                      <path d={d} className="rlink__glow" pathLength={100} />
                      {/* Three packets of light, spaced out, travelling from the opener to the town. */}
                      {[0, 1, 2].map((k) => (
                        <circle key={k} r="5" className="rlink__packet">
                          <animateMotion dur="3s" begin={`${k}s`} repeatCount="indefinite" path={d} />
                        </circle>
                      ))}
                    </>
                  )}
                </g>
              );
            })}
            {unlockLinks.map((l) => (
              <path key={`u-${l.from}-${l.to}`} d={linkPath(l.from, l.to)} className="rlink__unlock" pathLength={100} />
            ))}
          </svg>

          {regions.map((r) => {
            const art = regionArt(r.id);
            const state = regionState(r);
            const town = TOWNS[r.id]?.name ?? r.short;
            const here = r.id === hereId;
            const classes = ["rnode", `is-${state}`, here && "is-here", r.id === selectedId && "is-selected", fresh?.has(r.id) && "is-fresh"].filter(Boolean).join(" ");
            return (
              <button
                key={r.id}
                type="button"
                className={classes}
                style={{ left: `${art.x}%`, top: `${art.y}%` } as CSSProperties}
                aria-label={town}
                aria-pressed={r.id === selectedId}
                aria-describedby={`rnode-${r.id}`}
                onClick={() => onSelect(r.id)}
              >
                <span className="rnode__ring" aria-hidden="true" />
                <img className="rnode__icon" src={art.icon} alt="" draggable={false} />
                {/* A fresh unlock still shows its lock for a moment, so the lock can visibly break. */}
                {(state === "locked" || fresh?.has(r.id)) && (
                  <span className={`rnode__lock ${state === "locked" ? "" : "is-breaking"}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" />
                    </svg>
                  </span>
                )}
                {state === "complete" && (
                  <span className="rnode__done" aria-hidden="true">
                    ✓
                  </span>
                )}
                <span className="rnode__name">{town}</span>
                <span id={`rnode-${r.id}`} className="visually-hidden">
                  {REGION_STATE_LABEL[state]}
                  {here ? ", you are here" : ""}
                </span>
                {here && (
                  <span className="rnode__here" aria-hidden="true">
                    You are here
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="rmap__sky" aria-hidden="true">
        {CLOUD_LAYOUT.map((c, i) => (
          <img
            key={i}
            className={`rmap__cloud ${c.far ? "is-far" : ""}`}
            src={CLOUDS[c.img]}
            alt=""
            style={{ "--rest": `${i * 21}vw`, "--top": `${c.top}%`, "--w": `${c.width}vw`, "--dur": `${c.dur}s`, "--delay": `${-c.at * c.dur}s`, "--depth": `${c.depth}px` } as CSSProperties}
          />
        ))}
        <img className="rmap__mist" src={MIST} alt="" />
      </div>
      <div className="rmap__vignette" aria-hidden="true" />
    </div>
  );
}
