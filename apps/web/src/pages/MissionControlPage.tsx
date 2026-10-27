// MISSION CONTROL: where am I, what next, what have I done. A few real things, not a wall of numbers.
import { Link } from "react-router";
import { Badge, Button, EmptyState, ProgressBar } from "@hexhammer/design-system";
import { atlas, type MissionControl } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { STATUS_LABEL, CLASSIFICATION_TONE, hueStyle, relativeDays } from "../labels";
import { gridSize, hexCenter, hexPoints } from "../map/hexGeometry";

// A small, non-interactive picture of the 16 regions, each filled by how much I have assessed.
// The same numbers are listed as text in "Skill progression" below, so the picture is aria-hidden.
function MiniAtlas({ skills }: { skills: MissionControl["skills"] }) {
  const size = 34;
  const layout: Record<string, [number, number]> = {
    cs: [0, 0], web: [1, 0], fe: [2, 0], ds: [3, 0], pt: [0, 1], test: [1, 1], be: [2, 1], db: [3, 1],
    sec: [0, 2], dist: [1, 2], arch: [2, 2], ops: [3, 2], obs: [0, 3], ml: [1, 3], ai: [2, 3], adv: [3, 3],
  };
  const { width, height } = gridSize(4, 4, size);
  return (
    <svg className="mini-atlas" viewBox={`-4 -4 ${width + 8} ${height + 8}`} aria-hidden="true">
      {skills.map((s) => {
        const [col, row] = layout[s.id] ?? [0, 0];
        const { x, y } = hexCenter(col, row, size);
        const share = s.topics ? s.assessed / s.topics : 0;
        return (
          <g key={s.id} style={hueStyle(s.hue)} className={s.unlocked ? "" : "mini-atlas--locked"}>
            <polygon points={hexPoints(x, y, size - 2)} className="mini-atlas__hex" />
            <polygon points={hexPoints(x, y, (size - 2) * Math.max(0.12, Math.sqrt(share)))} className="mini-atlas__core" opacity={share > 0 ? 1 : 0.35} />
          </g>
        );
      })}
    </svg>
  );
}

export function MissionControlPage() {
  const { data, error, loading, reload } = useLoad(() => atlas.missionControl());
  if (loading && !data) return <Loading label="Opening Mission Control" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { nextMission, path, reviews, activeProject, recentAchievement, radar, resume } = data;
  const reviewCount = reviews.dueTopics + reviews.dueQuestions;
  const levelPct = Math.round((data.level.xpIntoLevel / data.level.xpForNextLevel) * 100);
  const active = [...data.skills].filter((s) => s.started > 0).sort((a, b) => b.assessed - a.assessed || b.started - a.started).slice(0, 6);

  return (
    <div className="mission">
      <section className="mission__hero" style={hueStyle(path.hue)} aria-labelledby="next-title">
        <div className="mission__hero-text">
          <p className="eyebrow">
            Mission control · Level {data.level.level} · {path.short} path
          </p>
          {nextMission ? (
            <>
              <h1 id="next-title" className="display">
                <span className="display__kicker">Next:</span> {nextMission.title}
              </h1>
              <p className="lead">{nextMission.why} One lesson, a few exercises, then an assessment that proves it.</p>
              <div className="actions">
                <Link to={`/topic/${nextMission.id}`} className="hh-button hh-button--primary">
                  Start this mission
                </Link>
                <Link to="/map" className="hh-button hh-button--secondary">
                  Open the World Map →
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 id="next-title" className="display">Every written mission in reach is done.</h1>
              <p className="lead">Open the map to pick a new region, or practise with reviews and interview questions.</p>
              <div className="actions">
                <Link to="/map" className="hh-button hh-button--primary">Open the World Map</Link>
              </div>
            </>
          )}
          <div className="mission__level" aria-label={`Level ${data.level.level}: ${data.level.xpIntoLevel} of ${data.level.xpForNextLevel} XP to the next level`}>
            <ProgressBar name={`Progress to level ${data.level.level + 1}`} percent={levelPct} label={`${data.level.xpIntoLevel}/${data.level.xpForNextLevel} XP`} />
          </div>
        </div>
        <MiniAtlas skills={data.skills} />
      </section>

      <section className="strip" aria-label="Your status">
        <article className="tile tile--review">
          <h2 className="tile__title">Reviews</h2>
          {!reviews.enabled ? (
            <p className="muted">Review reminders are off in Settings.</p>
          ) : reviewCount > 0 ? (
            <>
              <p className="tile__big">{reviewCount}</p>
              <p className="muted">due today ({reviews.dueTopics} topic, {reviews.dueQuestions} question). A few minutes keeps them fresh.</p>
              <Link to="/reviews" className="hh-button hh-button--secondary hh-button--small">Start review mission</Link>
            </>
          ) : (
            <p className="muted">
              Nothing due today.{" "}
              {reviews.nextDueAt ? `Next review ${relativeDays(reviews.nextDueAt)}.` : "Pass an assessment to start your first review schedule."}
            </p>
          )}
        </article>

        <article className="tile">
          <h2 className="tile__title">Active project</h2>
          {activeProject ? (
            <>
              <p className="tile__name">
                <Link to={`/projects/${activeProject.id}`}>{activeProject.title}</Link>
              </p>
              <ProgressBar
                name="Milestones done"
                percent={activeProject.milestonesTotal ? (activeProject.milestonesDone / activeProject.milestonesTotal) * 100 : 0}
                label={`${activeProject.milestonesDone}/${activeProject.milestonesTotal}`}
              />
              {activeProject.nextMilestone && <p className="muted">Next milestone: {activeProject.nextMilestone}</p>}
            </>
          ) : (
            <p className="muted">
              No project in progress. Every written topic suggests one: <Link to="/projects">open the Workshop</Link>.
            </p>
          )}
        </article>

        <article className="tile">
          <h2 className="tile__title">Pick up where you left off</h2>
          {resume ? (
            <>
              <p className="tile__name">
                <Link to={`/topic/${resume.id}`}>{resume.title}</Link>
              </p>
              <Badge tone="soft">{STATUS_LABEL[resume.status]}</Badge>
            </>
          ) : (
            <p className="muted">Your learning history starts with your first lesson.</p>
          )}
        </article>

        <article className="tile">
          <h2 className="tile__title">Latest achievement</h2>
          {recentAchievement ? (
            <p className="achievement-line">
              <span className="achievement-line__icon" aria-hidden="true">{recentAchievement.icon}</span>
              <span>
                <strong>{recentAchievement.title}</strong>
                <br />
                <span className="muted">{recentAchievement.description}</span>
              </span>
            </p>
          ) : (
            <p className="muted">
              None yet. Achievements come from real work, like reading a whole topic or passing an assessment. <Link to="/analytics">See them all</Link>.
            </p>
          )}
        </article>
      </section>

      <div className="mission__columns">
        <section aria-labelledby="skills-title">
          <div className="section-head">
            <h2 id="skills-title" className="section-title">Skill progression</h2>
            <Link to="/analytics">All 16 regions →</Link>
          </div>
          {active.length === 0 ? (
            <EmptyState title="Your map is still dark">
              Regions light up as you pass assessments and complete strikes. Start with the mission above.
            </EmptyState>
          ) : (
            <ul className="skill-list">
              {active.map((s) => (
                <li key={s.id} style={hueStyle(s.hue)}>
                  <Link to={`/map/${s.id}`} className="skill-list__name">{s.short}</Link>
                  <ProgressBar name={`${s.short}: topics assessed`} percent={s.topics ? (s.assessed / s.topics) * 100 : 0} label={`${s.assessed}/${s.topics}`} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="radar-title">
          <div className="section-head">
            <h2 id="radar-title" className="section-title">Technology updates</h2>
            <Link to="/radar">Radar →</Link>
          </div>
          {radar.length === 0 ? (
            <p className="muted">No unreviewed updates that matter to your curriculum. The radar checks its sources while the app is running.</p>
          ) : (
            <ul className="radar-mini">
              {radar.map((u) => (
                <li key={u.id}>
                  <Badge tone={CLASSIFICATION_TONE[u.classification] ?? "soft"}>{u.classification.replace("-", " ")}</Badge>{" "}
                  <Link to={`/radar/updates/${u.id}`}>{u.title}</Link>
                  <span className="muted"> · {u.source}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="footnote">
        <Button variant="ghost" size="small" onClick={reload}>Refresh</Button> Every number here comes from what you have actually done.
      </p>
    </div>
  );
}
