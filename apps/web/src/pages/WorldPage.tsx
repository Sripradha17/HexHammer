// WORLD: explore the engineering regions. The painted map fills the screen; selecting a town opens
// its panel: its painted scene, what it is, what is open, what is locked and WHY, and its quests,
// each one a click away. The URL remembers the selection (/map/web), so links and the back button
// work. Entering a quest plays a short "fly into the town" transition first.
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { atlas, type MapTopic, type Region } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { Icon } from "../components/Icon";
import { Kinetic } from "./HomePage";
import { TOWNS, playPath } from "../story/quests";
import { NODE_STATE_LABEL, REGION_STATE_LABEL, nextTopicIn, nodeState, regionState, useNewlyUnlocked } from "../map/regionState";
import { RealmMap } from "../map/RealmMap";
import { regionArt, scene } from "../art/realm";

// How long the fly-in plays before the quest opens (matches .realm.is-entering in realm.css).
const ENTER_MS = 1300;
const reducedMotion = () =>
  document.documentElement.dataset.motion === "reduce" ||
  (document.documentElement.dataset.motion !== "full" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function MissionRow({ topic, number, blocked, isNext }: { topic: MapTopic; number: number; blocked: boolean; isNext: boolean }) {
  const state = nodeState(topic);
  const body = (
    <>
      <span className={`mrow__dot is-${state}`} aria-hidden="true">
        {state === "done" ? <Icon name="check" size={13} /> : state === "locked" ? <Icon name="lock" size={12} /> : number}
      </span>
      <span className="mrow__title">
        {topic.capstone && <span className="mrow__crown">Boss · </span>}
        {topic.title}
      </span>
      <span className="mrow__state">{isNext ? "Next" : NODE_STATE_LABEL[state]}</span>
    </>
  );
  // An unwritten topic still opens (it lists hands-on strikes); only strict locking blocks a click.
  return blocked ? (
    <span className="mrow is-blocked" aria-disabled="true">
      {body}
    </span>
  ) : (
    <Link to={playPath(topic.id, topic.stage)} className={`mrow ${isNext ? "is-next" : ""}`}>
      {body}
    </Link>
  );
}

function RegionPanel({ region, regions, strict, onEnter }: { region: Region; regions: Region[]; strict: boolean; onEnter: (e: MouseEvent<HTMLAnchorElement>, to: string) => void }) {
  const state = regionState(region);
  const next = nextTopicIn(region);
  const blocked = !region.unlocked && strict;
  const unlockers = region.unlockedBy.map((id) => regions.find((r) => r.id === id)).filter((r): r is Region => Boolean(r));
  const opens = regions.filter((r) => r.unlockedBy.includes(region.id));
  const pct = region.counts.topics ? Math.round((region.counts.assessed / region.counts.topics) * 100) : 0;
  let n = 0;

  return (
    <aside className={`rpanel rm-panel is-${state}`} style={{ "--hue": region.hue } as CSSProperties} aria-labelledby="rpanel-title">
      <div className="rpanel__scene rm-scene">
        <img src={scene(regionArt(region.id).scene, true)} alt={`${TOWNS[region.id]?.name ?? region.short}, painted`} />
      </div>
      <header className="rpanel__head">
        <img className="rpanel__emblem" src={regionArt(region.id).icon} alt="" />
        <div>
          <p className="rpanel__state">
            {REGION_STATE_LABEL[state]} town
          </p>
          <h2 id="rpanel-title" className="rpanel__title">
            {TOWNS[region.id]?.name ?? region.short}
          </h2>
          <p className="rpanel__sub">{region.short}</p>
        </div>
      </header>
      <p className="rpanel__tagline">{region.tagline}</p>

      <div className="rpanel__progress">
        <div className="rm-meter" aria-hidden="true">
          <span style={{ "--to": `${pct}%` } as CSSProperties} />
        </div>
        <span>
          {region.counts.assessed} of {region.counts.topics} quests done
        </span>
      </div>

      {!region.unlocked && (
        <p className="rpanel__locked" role="note">
          <Icon name="lock" size={16} />
          <span>
            Opens when you finish a quest in{" "}
            {unlockers.map((u, i) => (
              <span key={u.id}>
                {i > 0 && " or "}
                <Link to={`/map/${u.id}`}>{TOWNS[u.id]?.name ?? u.short}</Link>
              </span>
            ))}
            .{!blocked && " You can still peek inside."}
          </span>
        </p>
      )}

      {next && !blocked && (
        <Link to={playPath(next.id, next.stage)} className="btn btn--go rpanel__cta" onClick={(e) => onEnter(e, playPath(next.id, next.stage))}>
          <Icon name="play" size={17} /> {next.status === "new" ? "Start quest" : "Continue quest"}
        </Link>
      )}

      <div className="rpanel__modules">
        {region.modules.map((m) => (
          <section key={m.id} className="rmod">
            <h3 className="rmod__title">{m.title}</h3>
            <ol className="rmod__list">
              {m.topics.map((t) => (
                <li key={t.id}>
                  <MissionRow topic={t} number={++n} blocked={blocked} isNext={t.id === next?.id} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {opens.length > 0 && (
        <p className="rpanel__opens">
          Finish a quest here to open{" "}
          {opens.map((o, i) => (
            <span key={o.id}>
              {i > 0 && ", "}
              <Link to={`/map/${o.id}`}>{TOWNS[o.id]?.name ?? o.short}</Link>
            </span>
          ))}
        </p>
      )}
    </aside>
  );
}

export function WorldPage() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.map(), atlas.missionControl()]));
  const panelRef = useRef<HTMLDivElement>(null);
  const [entering, setEntering] = useState(false);
  const fresh = useNewlyUnlocked(data?.[0].regions);

  // On phones the panel sits under the map: scroll to it when I pick a district.
  useEffect(() => {
    if (regionId && window.innerWidth < 1000) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [regionId]);

  if (loading && !data) return <Loading label="Drawing the world" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [map, mc] = data;
  const hereId = mc.nextMission?.regionId ?? mc.path.id;
  const selected = map.regions.find((r) => r.id === (regionId ?? hereId)) ?? map.regions[0];
  const open = map.regions.filter((r) => r.unlocked).length;
  const passed = map.regions.reduce((s, r) => s + r.counts.assessed, 0);
  const total = map.regions.reduce((s, r) => s + r.counts.topics, 0);

  // Entering a town: the map flies into it and fades, THEN the quest opens. A plain click
  // (or reduced motion) skips the show and goes straight there.
  function enter(e: MouseEvent<HTMLAnchorElement>, to: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || reducedMotion()) return;
    e.preventDefault();
    setEntering(true);
    setTimeout(() => navigate(to), ENTER_MS);
  }

  return (
    <div className={`realm realm--world ${entering ? "is-entering" : ""}`}>
      <RealmMap mode="world" regions={map.regions} selectedId={selected.id} hereId={hereId} fresh={fresh} onSelect={(id) => navigate(`/map/${id}`, { replace: Boolean(regionId) })} />
      <header className="realm__title">
        <h1>
          <Kinetic text="Choose your town" />
        </h1>
        <p className="realm__bram">
          {open} of {map.regions.length} towns open · {passed} of {total} quests done
        </p>
      </header>
      {/* Entering: the town's own painting fades in as the map flies towards it. */}
      {entering && (
        <div className="realm__arrive" aria-hidden="true">
          <img src={scene(regionArt(selected.id).scene)} alt="" />
          <p>{TOWNS[selected.id]?.name}</p>
        </div>
      )}
      <div ref={panelRef} className="realm__panel">
        <RegionPanel key={selected.id} region={selected} regions={map.regions} strict={map.strictUnlocking} onEnter={enter} />
      </div>
    </div>
  );
}
