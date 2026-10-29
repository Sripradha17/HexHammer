// PROGRESS: what I have really done. Every number is computed by the server from saved activity.
//
//   top      my level crest, XP to the next level, streak, and the reviews waiting today
//            (spaced repetition lives inside progression: reviews are how mastery is kept)
//   middle   mastery across the 16 regions, and the achievement wall
//   bottom   XP per week, what needs practice, and my history (tucked away)
import type { CSSProperties } from "react";
import { Link } from "react-router";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { Icon } from "../components/Icon";
import { WeeklyXp } from "../components/WeeklyXp";
import { formatDate, relativeDays } from "../labels";
import { medalFor } from "../art/realm";

export function ProgressPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.analytics(), atlas.me(), atlas.history(30), atlas.missionControl()]));
  if (loading && !data) return <Loading label="Counting real activity" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [a, me, { history }, mc] = data;
  const pct = Math.round((me.xpIntoLevel / me.xpForNextLevel) * 100);
  const reviewsDue = mc.reviews.dueTopics + mc.reviews.dueQuestions;
  const unlocked = me.achievements.filter((x) => x.unlockedAt).length;
  const rate = (n: number | null) => (n === null ? "—" : `${Math.round(n * 100)}%`);

  return (
    <div className="progress">
      <section className="pcrest glass">
        <div className="pcrest__level">
          <svg viewBox="0 0 120 136" aria-hidden="true">
            <polygon points="60,4 114,35 114,101 60,132 6,101 6,35" className="pcrest__shape" />
            <polygon points="60,4 114,35 114,101 60,132 6,101 6,35" className="pcrest__fill" style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }} />
          </svg>
          <span className="pcrest__n">
            <small>Level</small>
            {me.level}
          </span>
        </div>
        <div className="pcrest__info">
          <p className="kicker">Your engineer</p>
          <h1 className="screen-title">{me.xp} XP</h1>
          <p className="muted">
            {me.xpForNextLevel - me.xpIntoLevel} XP to level {me.level + 1} · {me.streak.current}-day streak · {me.streak.totalDays} days practised
          </p>
          <dl className="stats">
            <div>
              <dt>assessments passed</dt>
              <dd>{a.assessments.passed}</dd>
            </div>
            <div>
              <dt>topics mastered</dt>
              <dd>{a.mastered}</dd>
            </div>
            <div>
              <dt>review success</dt>
              <dd>{rate(a.reviews.successRate)}</dd>
            </div>
            <div>
              <dt>builds complete</dt>
              <dd>
                {a.projects.complete}/{a.projects.total}
              </dd>
            </div>
          </dl>
        </div>
        <div className={`pcrest__reviews ${reviewsDue ? "is-due" : ""}`}>
          <Icon name="reviews" size={22} />
          {reviewsDue > 0 ? (
            <>
              <strong>{reviewsDue} review{reviewsDue > 1 ? "s" : ""} due</strong>
              <span className="muted small">Reviews keep what you mastered.</span>
              <Link to="/reviews" className="cta cta--small">
                Start reviews
              </Link>
            </>
          ) : (
            <>
              <strong>No reviews due</strong>
              <span className="muted small">{mc.reviews.nextDueAt ? `Next one ${relativeDays(mc.reviews.nextDueAt)}` : "They start after your first passed assessment."}</span>
            </>
          )}
        </div>
      </section>

      <div className="pgrid">
        <section className="glass ppanel" aria-labelledby="regions-title">
          <h2 id="regions-title" className="ppanel__title">
            Mastery by region
          </h2>
          <ul className="pregions">
            {a.byDomain.map((d) => (
              <li key={d.id} style={{ "--hue": d.hue } as CSSProperties}>
                <Link to={`/map/${d.id}`} className="pregions__name">
                  {d.short}
                </Link>
                <span className="pregions__bar" aria-hidden="true">
                  <span className="is-started" style={{ width: `${(d.started / d.total) * 100}%` }} />
                  <span className="is-assessed" style={{ width: `${(d.assessed / d.total) * 100}%` }} />
                  <span className="is-mastered" style={{ width: `${(d.mastered / d.total) * 100}%` }} />
                </span>
                <span className="pregions__n">
                  {d.assessed}/{d.total}
                  <span className="visually-hidden">
                    {" "}
                    passed, {d.started} started, {d.mastered} mastered
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="pregions__key muted small">
            <span className="k is-started" /> started <span className="k is-assessed" /> passed <span className="k is-mastered" /> mastered
          </p>
        </section>

        <section className="glass ppanel" aria-labelledby="ach-title">
          <h2 id="ach-title" className="ppanel__title">
            Achievements · {unlocked}/{me.achievements.length}
          </h2>
          <ul className="badges">
            {me.achievements.map((x) => (
              <li key={x.id} className={x.unlockedAt ? "is-unlocked" : ""} title={`${x.title}: ${x.description}`}>
                {/* Earned: its painted medal, gently glowing. Not yet: a dim, empty socket. */}
                {x.unlockedAt ? (
                  <img className="badges__medal" src={medalFor(x.id)} alt="" />
                ) : (
                  <span className="badges__icon" aria-hidden="true">
                    {x.icon}
                  </span>
                )}
                <span className="badges__name">{x.title}</span>
                <span className="visually-hidden">
                  {x.description} {x.unlockedAt ? `Unlocked ${formatDate(x.unlockedAt)}` : "Locked"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="pgrid">
        <section className="glass ppanel">
          <WeeklyXp weeks={a.xpByWeek} />
        </section>
        <section className="glass ppanel" aria-labelledby="practice-title">
          <h2 id="practice-title" className="ppanel__title">
            Needs practice
          </h2>
          {a.needsPractice.length === 0 ? (
            <p className="muted">Nothing flagged. Topics appear here when an assessment falls short or you often miss a challenge.</p>
          ) : (
            <ul className="strike-list">
              {a.needsPractice.map((p) => (
                <li key={p.topicId + p.reason}>
                  <Link to={`/topic/${p.topicId}`} className="mrow">
                    <span className="mrow__dot is-progress" aria-hidden="true">
                      !
                    </span>
                    <span className="mrow__title">{p.title}</span>
                    <span className="mrow__state">{p.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <details className="more">
            <summary>Recent history</summary>
            {history.length === 0 ? (
              <p className="muted">Empty so far.</p>
            ) : (
              <ol className="history">
                {history.map((h) => (
                  <li key={h.id}>
                    <time dateTime={h.createdAt}>{formatDate(h.createdAt, true)}</time> <span className="pill">{h.type}</span>{" "}
                    {h.topicId ? <Link to={`/topic/${h.topicId}`}>{h.topicTitle}</Link> : h.refId}
                    {typeof h.detail.score === "number" && <span className="muted"> · {Math.round((h.detail.score as number) * 100)}%</span>}
                  </li>
                ))}
              </ol>
            )}
          </details>
        </section>
      </div>
    </div>
  );
}
