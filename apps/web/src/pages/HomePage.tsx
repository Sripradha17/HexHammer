// HOME (Mission Control): entering the game. One screen, one job: start the next mission.
//
//   left   where I am (region + mission number), the mission title, one line of "why",
//          ENTER MISSION (the one obvious action) and a smaller EXPLORE WORLD
//   right  a live, touchable scene for THIS mission's topic (see MissionScene.tsx)
//   below  my route through the current region (one hexagon per mission, real statuses),
//          and a compact "next unlock" line
//
// Everything comes from /atlas/mission-control and /atlas/map: no invented progress.
import { Link } from "react-router";
import type { CSSProperties } from "react";
import { atlas, type MapTopic, type Region } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { Icon } from "../components/Icon";
import { MissionScene } from "../components/MissionScene";
import { missionNumber, nodeState, NODE_STATE_LABEL } from "../map/regionState";

// The region route: every mission in the region as a small hexagon, in map order.
function RegionRoute({ region, currentId }: { region: Region; currentId: string | null }) {
  const topics: MapTopic[] = region.modules.flatMap((m) => m.topics);
  const passed = topics.filter((t) => nodeState(t) === "done").length;
  return (
    <section className="route" aria-label={`Your route through ${region.short}`} style={{ "--hue": region.hue } as CSSProperties}>
      <div className="route__head">
        <span className="route__name">{region.short}</span>
        <span className="route__count">
          {passed} of {topics.length} missions passed
        </span>
      </div>
      <ol className="route__nodes">
        {topics.map((t, i) => {
          const state = nodeState(t);
          const here = t.id === currentId;
          const node = (
            <>
              <span className="visually-hidden">
                Mission {i + 1}: {t.title}. {NODE_STATE_LABEL[state]}
                {here ? ". You are here." : ""}
              </span>
            </>
          );
          return (
            <li key={t.id} className={`route__node is-${state} ${here ? "is-here" : ""}`} title={`${i + 1}. ${t.title} · ${NODE_STATE_LABEL[state]}`}>
              {state === "locked" || state === "unwritten" ? <span className="route__hex">{node}</span> : <Link to={`/topic/${t.id}`} className="route__hex">{node}</Link>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function HomePage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.missionControl(), atlas.map()]));
  if (loading && !data) return <Loading label="Entering the world" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [mc, map] = data;
  const mission = mc.nextMission;
  const region = map.regions.find((r) => r.id === (mission?.regionId ?? mc.path.id)) ?? null;
  const number = region && mission ? missionNumber(region, mission.id) : null;

  // What opens next: a locked region that THIS region unlocks; otherwise the next achievement.
  const nextRegion = map.regions.find((r) => !r.unlocked && region && r.unlockedBy.includes(region.id));
  const reviewsDue = mc.reviews.enabled ? mc.reviews.dueTopics + mc.reviews.dueQuestions : 0;

  return (
    <div className="home" style={{ "--hue": region?.hue ?? 36 } as CSSProperties}>
      <section className="home__hero">
        <div className="home__brief">
          {mission ? (
            <>
              <p className="kicker">
                <span className="home__beacon" aria-hidden="true" />
                {region?.short} · Mission {number}
                {mission.status !== "new" && <span className="pill pill--amber">In progress</span>}
              </p>
              <h1 className="home__title">{mission.title}</h1>
              {mission.objective && <p className="home__objective">{mission.objective}</p>}
              <div className="home__actions">
                <Link to={`/topic/${mission.id}`} className="cta">
                  <Icon name="play" size={18} /> {mission.status === "new" ? "Enter mission" : "Resume mission"}
                </Link>
                <Link to="/map" className="cta cta--ghost cta--small">
                  <Icon name="map" size={17} /> Explore world
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="kicker">Every open mission is passed</p>
              <h1 className="home__title">The map is waiting.</h1>
              <div className="home__actions">
                <Link to="/map" className="cta">
                  <Icon name="map" size={18} /> Explore world
                </Link>
              </div>
            </>
          )}

          <ul className="home__signals">
            {nextRegion && (
              <li>
                <Icon name="lock" size={16} />
                <span>
                  Next unlock: <strong>{nextRegion.short}</strong> <span className="muted">· pass one assessment here</span>
                </span>
              </li>
            )}
            {!nextRegion && mc.nextAchievement && (
              <li>
                <Icon name="trophy" size={16} />
                <span>
                  Next badge: <strong>{mc.nextAchievement.title}</strong>
                </span>
              </li>
            )}
            {reviewsDue > 0 && (
              <li>
                <Icon name="reviews" size={16} />
                <Link to="/reviews">
                  {reviewsDue} review{reviewsDue > 1 ? "s" : ""} due today
                </Link>
              </li>
            )}
            {mc.activeProject && (
              <li>
                <Icon name="workshop" size={16} />
                <Link to={`/projects/${mc.activeProject.id}`}>
                  Build: {mc.activeProject.title} ({mc.activeProject.milestonesDone}/{mc.activeProject.milestonesTotal})
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="home__stage">
          <div className="home__stage-glow" aria-hidden="true" />
          <p className="home__stage-label">
            <Icon name="spark" size={14} /> Try it now
          </p>
          <MissionScene kind={mission?.visualization ?? "none"} region={region} />
        </div>
      </section>

      {region && <RegionRoute region={region} currentId={mission?.id ?? null} />}
    </div>
  );
}
