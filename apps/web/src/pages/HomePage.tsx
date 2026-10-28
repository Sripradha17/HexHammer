// HOME: the Kingdom of Hex, in 3D, filling the screen. On top of it, only three things:
//   1. a big animated title and one line from Bram
//   2. today's quest, with ONE big button
//   3. when I tap an island: that town's name, progress and a way in
// Real data only: /atlas/mission-control (next quest, streak) and /atlas/map (islands, progress).
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { QUESTS, TOWNS, playPath } from "../story/quests";
// The 3D world is big (three.js), so it loads on its own, after the page appears.
const Kingdom3D = lazy(() => import("../world3d/Kingdom3D").then((m) => ({ default: m.Kingdom3D })));

// Letters that rise in one after another: kinetic type, the way cinematic sites open.
export function Kinetic({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`kinetic ${className}`} aria-label={text}>
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
  if (loading && !data) return <Loading label="Opening the kingdom gates" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [mc, map] = data;
  const mission = mc.nextMission;
  const quest = mission ? QUESTS[mission.id] : undefined;
  const hereId = mission?.regionId ?? mc.path.id;
  const town = TOWNS[hereId];
  const pickedRegion = map.regions.find((r) => r.id === picked && r.id !== hereId);

  return (
    <div className="realm">
      <Suspense fallback={<div className="kingdom3d kingdom3d--loading" />}>
        <Kingdom3D regions={map.regions} selectedId={picked} hereId={hereId} onSelect={setPicked} />
      </Suspense>

      <header className="realm__title">
        <h1>
          <Kinetic text="The Kingdom of Hex" />
        </h1>
        <p className="realm__bram">
          <span className="realm__who">⚒ Bram</span> {mc.streak.current > 1 ? `${mc.streak.current} days in a row! ` : ""}
          {quest ? `${town?.name} needs you, apprentice.` : "Pick an island and let's learn something new."}
        </p>
      </header>

      {mission && (
        <section className="realm__quest" aria-labelledby="today-quest">
          <p className="realm__kicker">
            {town?.icon} {town?.name} · Today's quest
          </p>
          <h2 id="today-quest" className="realm__quest-title">
            {quest ? quest.title : mission.title}
          </h2>
          <p className="realm__teaser">{quest ? quest.teaser : mission.objective}</p>
          <Link to={playPath(mission.id)} className="btn btn--go btn--big">
            {mission.status === "new" ? "Start quest" : "Continue quest"} <span aria-hidden="true">▶</span>
          </Link>
        </section>
      )}

      {pickedRegion && (
        <aside className="realm__town" key={pickedRegion.id}>
          <p className="realm__kicker">{pickedRegion.unlocked ? "Town" : "Locked town"}</p>
          <h2 className="realm__town-name">
            {TOWNS[pickedRegion.id]?.icon} {TOWNS[pickedRegion.id]?.name}
          </h2>
          <p className="realm__teaser">{pickedRegion.tagline}</p>
          <p className="realm__small">
            {pickedRegion.unlocked ? `${pickedRegion.counts.assessed} of ${pickedRegion.counts.topics} quests done` : `Opens after progress in ${pickedRegion.unlockedBy.map((id) => TOWNS[id]?.name).join(" or ")}`}
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
