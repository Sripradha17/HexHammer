// THE ENGINEERING WORLD MAP. Sixteen regions on a honeycomb. Every hex is a real link, with a
// visible focus ring, and its fill comes from MY real progress. Lines show which regions unlock which.
// The same information is listed as text in the table below the map (for screen readers and phones).
import { useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { Badge } from "@hexhammer/design-system";
import { atlas, type Region } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { gridSize, hexCenter } from "../map/hexGeometry";
import { hueStyle } from "../labels";

const SIZE = 100; // geometry units; the map scales to the screen with percentages

export function WorldMapPage() {
  const { data, error, loading, reload } = useLoad(() => atlas.map());
  const [focused, setFocused] = useState<string | null>(null);

  if (loading && !data) return <Loading label="Unrolling the map" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const regions = data.regions;
  const cols = Math.max(...regions.map((r) => r.col)) + 1;
  const rows = Math.max(...regions.map((r) => r.row)) + 1;
  const { width, height } = gridSize(cols, rows, SIZE);
  const byId = new Map(regions.map((r) => [r.id, r]));
  const current = focused ? byId.get(focused) : null;

  // Percent position of a hex centre inside the map box.
  const pos = (r: Region) => {
    const c = hexCenter(r.col, r.row, SIZE);
    return { left: (c.x / width) * 100, top: (c.y / height) * 100, x: c.x, y: c.y };
  };

  return (
    <div className="world">
      <header className="page-head">
        <p className="eyebrow">World map · 16 regions</p>
        <h1 className="page-title">The Engineering Atlas</h1>
        <p className="lead">
          Each hexagon is a region of software engineering. It fills as you pass assessments. Dashed regions are locked until you show real progress in a
          neighbouring region{data.strictUnlocking ? "." : ", but you can still peek inside."}
        </p>
      </header>

      <div className="world__layout">
        <div className="world__map" style={{ aspectRatio: `${width} / ${height}` }}>
          {/* The unlock paths, drawn under the hexes. Decorative: the table lists the same links. */}
          <svg className="world__paths" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            {regions.flatMap((r) =>
              r.unlockedBy.map((fromId) => {
                const from = byId.get(fromId);
                if (!from) return null;
                const a = pos(from);
                const b = pos(r);
                const lit = focused === r.id || focused === fromId;
                return <line key={`${fromId}-${r.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`world__path ${lit ? "world__path--lit" : ""} ${r.unlocked ? "world__path--open" : ""}`} />;
              }),
            )}
          </svg>

          {regions.map((r) => {
            const p = pos(r);
            const share = r.counts.topics ? r.counts.assessed / r.counts.topics : 0;
            return (
              <Link
                key={r.id}
                to={`/map/${r.id}`}
                className={`region-hex ${r.unlocked ? "" : "region-hex--locked"} ${focused === r.id ? "region-hex--focus" : ""}`}
                style={{ ...hueStyle(r.hue), left: `${p.left}%`, top: `${p.top}%`, "--fill": `${Math.round(share * 100)}%` } as CSSProperties}
                onMouseEnter={() => setFocused(r.id)}
                onFocus={() => setFocused(r.id)}
                onMouseLeave={() => setFocused(null)}
                onBlur={() => setFocused(null)}
                aria-label={`${r.number}. ${r.title}. ${r.unlocked ? "Open" : "Locked"}. ${r.counts.assessed} of ${r.counts.topics} topics assessed${r.counts.reviewDue ? `, ${r.counts.reviewDue} reviews due` : ""}.`}
              >
                <span className="region-hex__face">
                  <span className="region-hex__num">{String(r.number).padStart(2, "0")}</span>
                  <span className="region-hex__name">{r.short}</span>
                  <span className="region-hex__meta">
                    {r.counts.assessed}/{r.counts.topics}
                  </span>
                </span>
                {r.counts.reviewDue > 0 && <span className="region-hex__review" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>

        <aside className="world__panel" aria-live="polite">
          {current ? (
            <div style={hueStyle(current.hue)} className="region-preview">
              <p className="eyebrow">Region {current.number}</p>
              <h2 className="region-preview__title">{current.title}</h2>
              <p>{current.tagline}</p>
              <dl className="facts">
                <div><dt>Topics</dt><dd>{current.counts.topics}</dd></div>
                <div><dt>Lessons written</dt><dd>{current.counts.written}</dd></div>
                <div><dt>Started</dt><dd>{current.counts.started}</dd></div>
                <div><dt>Assessed</dt><dd>{current.counts.assessed}</dd></div>
                <div><dt>Mastered</dt><dd>{current.counts.mastered}</dd></div>
              </dl>
              {!current.unlocked && (
                <p className="muted">
                  Unlock: pass any assessment (or three strikes) in {current.unlockedBy.map((id) => byId.get(id)?.short).join(" or ")}.
                </p>
              )}
            </div>
          ) : (
            <div className="region-preview region-preview--idle">
              <p className="eyebrow">Legend</p>
              <ul className="legend">
                <li><span className="legend__swatch legend__swatch--open" /> Open region; the fill shows assessed topics</li>
                <li><span className="legend__swatch legend__swatch--locked" /> Locked region (dashed)</li>
                <li><span className="legend__swatch legend__swatch--review" /> Reviews due inside</li>
                <li><span className="legend__line" /> Unlock path</li>
              </ul>
              <p className="muted">Hover or tab through the hexes to preview a region. Press Enter to open it.</p>
            </div>
          )}
        </aside>
      </div>

      <section aria-labelledby="regions-table" className="world__table-wrap">
        <h2 id="regions-table" className="section-title">All regions</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Region</th>
              <th scope="col">State</th>
              <th scope="col">Written</th>
              <th scope="col">Assessed</th>
              <th scope="col">Mastered</th>
              <th scope="col">Reviews due</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => (
              <tr key={r.id} style={hueStyle(r.hue)}>
                <th scope="row">
                  <Link to={`/map/${r.id}`} className="region-link">
                    <span className="region-dot" aria-hidden="true" /> {r.number}. {r.title}
                  </Link>
                </th>
                <td>{r.unlocked ? <Badge tone="success">Open</Badge> : <Badge tone="soft">Locked</Badge>}</td>
                <td>{r.counts.written} of {r.counts.topics}</td>
                <td>{r.counts.assessed}</td>
                <td>{r.counts.mastered}</td>
                <td>{r.counts.reviewDue || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
