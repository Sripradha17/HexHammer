// LEARNING ANALYTICS: only numbers computed from what I actually did. With no activity, the page says
// so instead of drawing empty or invented charts.
import { useState } from "react";
import { Link } from "react-router";
import { Badge, EmptyState, ProgressBar } from "@hexhammer/design-system";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { formatDate, hueStyle } from "../labels";

// A simple single-series column chart (XP per week). One hue (magnitude), no legend (the title names
// it), values in text colors, a hover/focus tooltip per bar, and a table view below.
function WeeklyXp({ weeks }: { weeks: { weekStart: string; xp: number }[] }) {
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

export function AnalyticsPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.analytics(), atlas.me(), atlas.history(30)]));
  if (loading && !data) return <Loading label="Counting real activity" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [a, me, { history }] = data;
  const empty = a.lessonsRead === 0 && a.assessments.attempts === 0 && a.exercisesDone === 0 && a.projects.total === 0 && history.length === 0;
  const pct = (n: number | null) => (n === null ? "—" : `${Math.round(n * 100)}%`);

  return (
    <div className="analytics">
      <header className="page-head">
        <p className="eyebrow">Learning analytics · level {me.level} · {me.xp} XP</p>
        <h1 className="page-title">What you've actually done.</h1>
        <p className="lead">Every number comes from your saved activity. Reading counts for little; assessments, reviews and projects count for more.</p>
      </header>

      {empty ? (
        <EmptyState title="Nothing to measure yet" action={<Link to="/" className="hh-button hh-button--primary">Start a mission</Link>}>
          Charts appear once you read a lesson, pass a check, or start a project. No made-up numbers in the meantime.
        </EmptyState>
      ) : (
        <>
          <dl className="stat-grid">
            <div><dt>Lessons fully read</dt><dd>{a.lessonsRead}</dd></div>
            <div><dt>Exercises completed</dt><dd>{a.exercisesDone}</dd></div>
            <div><dt>Assessments passed</dt><dd>{a.assessments.passed} <span className="muted">of {a.assessments.attempts} attempts · avg {pct(a.assessments.averageScore)}</span></dd></div>
            <div><dt>Review success</dt><dd>{pct(a.reviews.successRate)} <span className="muted">of {a.reviews.done} reviews</span></dd></div>
            <div><dt>Topics mastered</dt><dd>{a.mastered}</dd></div>
            <div><dt>Projects complete</dt><dd>{a.projects.complete} <span className="muted">of {a.projects.total}</span></dd></div>
          </dl>

          <WeeklyXp weeks={a.xpByWeek} />

          <div className="analytics__columns">
            <section aria-labelledby="mastery-title">
              <h2 id="mastery-title" className="section-title">Progress by region</h2>
              <ul className="skill-list">
                {a.byDomain.filter((d) => d.started > 0).map((d) => (
                  <li key={d.id} style={hueStyle(d.hue)}>
                    <Link to={`/map/${d.id}`} className="skill-list__name">{d.short}</Link>
                    <ProgressBar name={`${d.short}: topics assessed`} percent={(d.assessed / d.total) * 100} label={`${d.assessed}/${d.total}`} />
                    <span className="muted">{d.mastered} mastered</span>
                  </li>
                ))}
              </ul>
              {a.byDomain.every((d) => d.started === 0) && <p className="muted">No region started yet.</p>}
            </section>
            <section aria-labelledby="practice-title">
              <h2 id="practice-title" className="section-title">Needs practice</h2>
              {a.needsPractice.length === 0 ? (
                <p className="muted">Nothing flagged. Areas appear here when an assessment falls short or you often miss interview answers on a topic.</p>
              ) : (
                <ul className="practice-list">
                  {a.needsPractice.map((p) => <li key={p.topicId + p.reason}><Link to={`/topic/${p.topicId}`}>{p.title}</Link> <span className="muted">{p.reason}</span></li>)}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <section aria-labelledby="ach-title">
        <h2 id="ach-title" className="section-title">Achievements ({me.achievements.filter((x) => x.unlockedAt).length}/{me.achievements.length})</h2>
        <ul className="achievements">
          {me.achievements.map((x) => (
            <li key={x.id} className={x.unlockedAt ? "is-unlocked" : ""}>
              <span className="achievements__icon" aria-hidden="true">{x.icon}</span>
              <span>
                <strong>{x.title}</strong> {x.unlockedAt ? <Badge tone="success">{formatDate(x.unlockedAt)}</Badge> : <span className="visually-hidden">(locked)</span>}
                <br />
                <span className="muted">{x.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hist-title">
        <h2 id="hist-title" className="section-title">Learning history</h2>
        {history.length === 0 ? (
          <p className="muted">Empty so far.</p>
        ) : (
          <ol className="history">
            {history.map((h) => (
              <li key={h.id}>
                <time dateTime={h.createdAt}>{formatDate(h.createdAt, true)}</time> <Badge tone="soft">{h.type}</Badge>{" "}
                {h.topicId ? <Link to={`/topic/${h.topicId}`}>{h.topicTitle}</Link> : h.refId}
                {typeof h.detail.correct === "boolean" && <span className="muted"> · {h.detail.correct ? "correct" : "not yet"}</span>}
                {typeof h.detail.score === "number" && <span className="muted"> · {Math.round((h.detail.score as number) * 100)}%</span>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
