// XP per week: a real chart of real activity (never invented numbers).
import { useState } from "react";
import { formatDate } from "../labels";

// A simple single-series column chart (XP per week). One hue (magnitude), no legend (the title names
// it), values in text colors, a hover/focus tooltip per bar, and a table view below.
export function WeeklyXp({ weeks }: { weeks: { weekStart: string; xp: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...weeks.map((w) => w.xp));
  const W = 600, H = 180, gap = 2, barW = W / weeks.length - gap;
  return (
    <figure className="chart">
      <figcaption className="chart__title">XP per week, last 12 weeks</figcaption>
      <div className="chart__plot">
        <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={`XP per week. Highest week: ${max} XP.`}>
          <line x1="0" x2={W} y1={H} y2={H} className="chart__axis" />
          {weeks.map((w, i) => {
            const h = (w.xp / max) * (H - 10);
            const x = i * (barW + gap);
            return (
              <g key={w.weekStart} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
                <rect x={x} y={0} width={barW} height={H} fill="transparent" />
                {w.xp > 0 && <path className="chart__bar" d={`M${x},${H} V${H - h + 4} q0,-4 4,-4 h${barW - 8} q4,0 4,4 V${H} Z`} />}
                {i % 2 === 0 && <text x={x + barW / 2} y={H + 16} textAnchor="middle" className="chart__tick">{w.weekStart.slice(5)}</text>}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div className="chart__tooltip" style={{ left: `${((hover + 0.5) / weeks.length) * 100}%` }} role="status">
            Week of {formatDate(weeks[hover].weekStart)}: <strong>{weeks[hover].xp} XP</strong>
          </div>
        )}
      </div>
      <details>
        <summary>Show as a table</summary>
        <table className="data-table">
          <thead><tr><th scope="col">Week starting</th><th scope="col">XP</th></tr></thead>
          <tbody>{weeks.map((w) => <tr key={w.weekStart}><td>{formatDate(w.weekStart)}</td><td className="num">{w.xp}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
