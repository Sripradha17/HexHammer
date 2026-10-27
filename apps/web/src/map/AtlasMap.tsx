// THE ATLAS MAP: the 16 regions drawn as raised districts in a 2.5D world.
//
// How one district is drawn (all plain SVG shapes):
//   - a hexagon squashed vertically (the "top" of the platform, seen at an angle)
//   - the same hexagon a little lower and darker behind it (the platform's side: depth)
//   - on top, one small tower per module. A tower's height grows with the share of that module's
//     missions I have really PASSED, and its windows light up as I go. So mastery is visible.
//   - the region's emblem floats above.
// Roads between districts are the unlock rules ("B opens after progress in A"). Open roads have
// light flowing along them. Locked districts sit dark, under fog, with a lock.
//
// Each district is a focusable button (Enter/Space selects it). Parallax: the whole map drifts a
// little with the pointer (CSS reads --px/--py, written by WorldBackdrop).
import type { CSSProperties, KeyboardEvent } from "react";
import type { Region } from "../atlasApi";
import { REGION_GLYPHS } from "../components/Icon";
import { regionState, REGION_STATE_LABEL } from "./regionState";

const W = 1060;
const H = 850;
const RX = 92; // half-width of a platform
const RY = 52; // half-height of its (squashed) top
const DEPTH = 24; // how tall the platform's side is

// Where a region sits: its column and row from the curriculum, odd rows nudged right (honeycomb).
export function districtCenter(r: Region) {
  return { x: 115 + r.col * 230 + (r.row % 2) * 115, y: 140 + r.row * 192 };
}

// The six corners of the squashed hexagon around (x, y).
function hex(x: number, y: number) {
  return [
    [x - RX, y],
    [x - RX / 2, y - RY],
    [x + RX / 2, y - RY],
    [x + RX, y],
    [x + RX / 2, y + RY],
    [x - RX / 2, y + RY],
  ]
    .map((p) => p.join(","))
    .join(" ");
}

interface Props {
  regions: Region[];
  selectedId: string | null;
  hereId: string | null; // the region of my next mission
  fresh: Set<string>; // regions unlocked since my last visit (they play a reveal once)
  onSelect: (id: string) => void;
}

export function AtlasMap({ regions, selectedId, hereId, fresh, onSelect }: Props) {
  const byId = new Map(regions.map((r) => [r.id, r]));
  // Draw from the back row to the front row, so nearer districts overlap farther ones.
  const ordered = [...regions].sort((a, b) => a.row - b.row || a.col - b.col);

  function onKey(e: KeyboardEvent, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  }

  return (
    <div className="atlas">
      <svg className="atlas__svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="World map of the 16 engineering regions">
        <defs>
          <radialGradient id="atlas-ground" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#14203a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#060912" stopOpacity="0" />
          </radialGradient>
          <filter id="atlas-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <ellipse cx={W / 2} cy={H / 2} rx={W / 1.7} ry={H / 1.8} fill="url(#atlas-ground)" />

        {/* Roads: one per unlock rule. */}
        <g className="atlas__roads" aria-hidden="true">
          {regions.flatMap((r) =>
            r.unlockedBy.map((fromId) => {
              const from = byId.get(fromId);
              if (!from) return null;
              const a = districtCenter(from);
              const b = districtCenter(r);
              const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.15;
              const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.1 + 20;
              const d = `M${a.x} ${a.y + 10} Q${mx} ${my} ${b.x} ${b.y + 10}`;
              const open = r.unlocked && from.unlocked;
              const lit = selectedId === r.id || selectedId === fromId;
              return (
                <g key={`${fromId}-${r.id}`} className={`road ${open ? "is-open" : "is-locked"} ${lit ? "is-lit" : ""}`}>
                  <path d={d} className="road__bed" />
                  {open && <path d={d} className="road__flow" pathLength={100} />}
                </g>
              );
            }),
          )}
        </g>

        {ordered.map((r) => {
          const { x, y } = districtCenter(r);
          const state = regionState(r);
          const selected = r.id === selectedId;
          const here = r.id === hereId;
          const modules = r.modules.slice(0, 5);
          return (
            <g
              key={r.id}
              className={`district is-${state} ${selected ? "is-selected" : ""} ${fresh.has(r.id) ? "is-fresh" : ""}`}
              style={{ "--hue": r.hue } as CSSProperties}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${r.short}. ${REGION_STATE_LABEL[state]}. ${r.counts.assessed} of ${r.counts.topics} missions passed.${here ? " You are here." : ""}`}
              onClick={() => onSelect(r.id)}
              onKeyDown={(e) => onKey(e, r.id)}
            >
              {/* glow under lit districts */}
              <ellipse cx={x} cy={y + DEPTH} rx={RX * 1.05} ry={RY * 0.9} className="district__halo" filter="url(#atlas-glow)" />
              <polygon points={hex(x, y + DEPTH)} className="district__side" />
              <polygon points={hex(x, y)} className="district__top" />
              <polygon points={hex(x, y)} className="district__edge" />

              {/* Towers: one per module, height = share of that module passed. */}
              {modules.map((m, i) => {
                const passed = m.topics.filter((t) => t.status === "assessed" || t.status === "mastered").length;
                const share = m.topics.length ? passed / m.topics.length : 0;
                // Spread the towers evenly across the platform (a single tower stands in the middle).
                const tx = modules.length > 1 ? x - 44 + i * (88 / (modules.length - 1)) : x;
                const ty = y + 8 - (i % 2) * 14;
                const h = 14 + share * 46;
                const lit = Math.round(share * 4);
                return (
                  <g key={m.id} className="tower">
                    <rect x={tx - 7} y={ty - h} width="14" height={h} rx="2" className="tower__body" />
                    <rect x={tx - 7} y={ty - h} width="14" height="3" className="tower__cap" />
                    {[0, 1, 2, 3].map((w) => (
                      <rect key={w} x={tx - 2} y={ty - 8 - w * 9} width="4" height="4" className={`tower__win ${w < lit ? "is-lit" : ""}`} />
                    ))}
                  </g>
                );
              })}

              {/* Emblem floating above. */}
              <g className="district__emblem" transform={`translate(${x - 15} ${y - 82}) scale(1.25)`}>
                <circle cx="12" cy="12" r="16" className="district__emblem-bg" />
                <path d={state === "locked" ? "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3" : (REGION_GLYPHS[r.id] ?? REGION_GLYPHS.adv)} className="district__emblem-path" />
              </g>

              {state === "locked" && <ellipse cx={x} cy={y} rx={RX * 1.1} ry={RY * 1.3} className="district__fog" />}

              <text x={x} y={y + RY + DEPTH + 26} className="district__name">
                {r.short}
              </text>
              <text x={x} y={y + RY + DEPTH + 44} className="district__count">
                {state === "locked" ? "locked" : `${r.counts.assessed}/${r.counts.topics} passed`}
              </text>

              {here && (
                <g className="here" transform={`translate(${x} ${y - 120})`} aria-hidden="true">
                  <circle r="10" className="here__ping" />
                  <path d="M0 14 L-9 -2 A10 10 0 1 1 9 -2 Z" className="here__pin" />
                  <circle r="3.5" cy="-5" className="here__dot" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
