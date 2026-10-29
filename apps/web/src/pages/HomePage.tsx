// HOME (Mission Control): the painted realm fills the screen and comes alive (glowing roads,
// breathing crystals, drifting clouds). On top of it, only a few things:
//   1. Bram the owl on his rune circle. Tap him for the next study tip.
//   2. today's topic, with ONE big button (it opens the topic at its Study step)
//   3. my town and TODAY'S THREE: learn, review, build (the daily loop that makes it stick)
//   4. the journey: every town as a numbered stop along one road, open or locked
//   5. when I tap a town on the map: its name, progress and a way in
// Real data only: /atlas/mission-control (next topic, reviews, builds, streak) and /atlas/map.
import { useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { TOWNS, playPath } from "../story/quests";
import { RealmMap } from "../map/RealmMap";
import { regionState, useNewlyUnlocked } from "../map/regionState";
import { BramHero } from "../art/Bram";
import { regionArt, scene } from "../art/realm";

// Bram's study tips: how to learn so it sticks, ace interviews, and build without leaning on AI.
const TIPS = [
  "Type every example by hand. Your fingers remember what your eyes only skim.",
  "Stuck? Say the problem out loud in one sentence. Interviewers love hearing you think.",
  "Break it on purpose. Knowing WHY code fails is how you fix it fast.",
  "Build it yourself first. Ask AI afterwards, and check every line it gives you.",
  "Ten minutes every day beats three hours on Sunday. Keep the streak glowing!",
  "Before you code, write the steps in plain words. Then turn each step into code.",
];

// Letters that rise in one after another: kinetic type, the way cinematic sites open.
export function Kinetic({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`kinetic ${className}`}>
      {/* Screen readers read this whole sentence; the animated letters below are hidden from them. */}
      <span className="visually-hidden">{text}</span>
      {text.split(" ").map((word, w) => (
        <span key={w} className="kinetic__word" aria-hidden="true">
          {[...word].map((ch, i) => (
            <span key={i} className="kinetic__ch" style={{ animationDelay: `${0.25 + w * 0.12 + i * 0.035}s` }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function HomePage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.missionControl(), atlas.map()]));
  const [picked, setPicked] = useState<string | null>(null);
  const fresh = useNewlyUnlocked(data?.[1].regions);
  if (loading && !data) return <Loading label="Opening the kingdom gates" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [mc, map] = data;
  const mission = mc.nextMission;
  const hereId = mission?.regionId ?? mc.path.id;
  const town = TOWNS[hereId];
  const hereRegion = map.regions.find((r) => r.id === hereId);
  const pickedRegion = map.regions.find((r) => r.id === picked && r.id !== hereId);
  const pct = hereRegion?.counts.topics ? Math.round((hereRegion.counts.assessed / hereRegion.counts.topics) * 100) : 0;

  const line =
    mc.streak.current > 1
      ? `${mc.streak.current} days in a row! ${town?.name ?? "The kingdom"} needs you.`
      : mission
        ? `${town?.name} needs you, apprentice.`
        : "Pick a town and let's learn something new.";
  const reviewsDue = mc.reviews.enabled ? mc.reviews.dueTopics + mc.reviews.dueQuestions : 0;

  return (
    <div className="realm realm--home">
      <RealmMap mode="home" regions={map.regions} selectedId={picked} hereId={hereId} onSelect={setPicked} fresh={fresh} />

      <header className="realm__title">
        <p className="realm__eyebrow">Mission control</p>
        <h1>
          <Kinetic text="The Kingdom of Hex" />
        </h1>
      </header>

      <div className="realm__guide">
        <BramHero lines={[line, ...(reviewsDue ? [`${reviewsDue} review${reviewsDue > 1 ? "s" : ""} waiting. Memories fade unless you use them!`] : []), ...TIPS]} />
      </div>

      {mission && (
        <section className="realm__quest rm-panel" aria-labelledby="today-quest">
          <p className="realm__kicker">
            {town?.name} · Today's topic
          </p>
          <h2 id="today-quest" className="realm__quest-title">
            {mission.title}
          </h2>
          <span className="rm-rule" aria-hidden="true" />
          <p className="realm__teaser">{mission.objective}</p>
          {/* The four steps every topic follows, so it is always clear what comes next. */}
          <ol className="flow-steps" aria-label="Every topic has four steps">
            <li className="is-now">1 Study</li>
            <li>2 Play</li>
            <li>3 Build</li>
            <li>4 Test</li>
          </ol>
          <Link to={playPath(mission.id)} className="btn btn--go btn--big">
            {mission.status === "new" ? "Start: Study" : "Continue"}
          </Link>
        </section>
      )}

      {hereRegion && !pickedRegion && (
        <aside className="realm__here rm-panel" aria-label={`Your town: ${town?.name}`}>
          <p className="realm__kicker">Your town</p>
          <div className="rm-scene">
            <img src={scene(regionArt(hereId).scene, true)} alt={`${town?.name}, painted`} />
          </div>
          <p className="realm__here-name">{town?.name}</p>
          <div className="rm-meter" aria-hidden="true">
            <span style={{ "--to": `${pct}%` } as CSSProperties} />
          </div>
          <p className="realm__small">
            {hereRegion.counts.assessed} of {hereRegion.counts.topics} topics done
          </p>
          {/* Today's three: the daily loop. Learn something, remember something, make something. */}
          <h3 className="today__title">Today's three</h3>
          <ol className="today">
            <li className={mission ? "" : "is-done"}>
              <span className="today__n">1</span>
              {mission ? <Link to={playPath(mission.id)}>Learn: {mission.title}</Link> : <span>Learn: every open topic is done</span>}
            </li>
            <li className={reviewsDue ? "" : "is-done"}>
              <span className="today__n">2</span>
              {reviewsDue ? <Link to="/reviews">Remember: {reviewsDue} due</Link> : <span>Remember: nothing due</span>}
            </li>
            <li>
              <span className="today__n">3</span>
              {mc.activeProject ? (
                <Link to={`/projects/${mc.activeProject.id}`}>
                  Build: {mc.activeProject.title} ({mc.activeProject.milestonesDone}/{mc.activeProject.milestonesTotal})
                </Link>
              ) : (
                <Link to="/projects">Build: pick something fun</Link>
              )}
            </li>
          </ol>
        </aside>
      )}

      {/* The journey: every town, in map order, as one road of medallions. */}
      <nav className="journey" aria-label="Journey">
        <ol>
          {map.regions.map((r) => {
            const state = regionState(r);
            return (
              <li key={r.id} className={`journey__stop is-${state} ${r.id === hereId ? "is-here" : ""} ${fresh.has(r.id) ? "is-fresh" : ""}`}>
                <Link to={`/map/${r.id}`} title={`${TOWNS[r.id]?.name}: ${state}`}>
                  <span aria-hidden="true">{r.number}</span>
                  <span className="visually-hidden">{`${TOWNS[r.id]?.name} (${state})`}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {pickedRegion && (
        <aside className="realm__town rm-panel" key={pickedRegion.id}>
          <p className="realm__kicker">{pickedRegion.unlocked ? "Town" : "Locked town"}</p>
          <h2 className="realm__town-name">{TOWNS[pickedRegion.id]?.name}</h2>
          <p className="realm__teaser">{pickedRegion.tagline}</p>
          <p className="realm__small">
            {pickedRegion.unlocked ? `${pickedRegion.counts.assessed} of ${pickedRegion.counts.topics} topics done` : `Opens after progress in ${pickedRegion.unlockedBy.map((id) => TOWNS[id]?.name).join(" or ")}`}
          </p>
          <div className="realm__row">
            <Link to={`/map/${pickedRegion.id}`} className="btn btn--soft">
              Visit town
            </Link>
            <button type="button" className="btn btn--ghost" onClick={() => setPicked(null)}>
              Close
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
