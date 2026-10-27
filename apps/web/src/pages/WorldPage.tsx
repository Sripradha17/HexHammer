// WORLD: explore the engineering regions. The map fills the screen; selecting a district opens
// its panel: what it is, what is open, what is locked and WHY, and its missions, each one a
// click away. The URL remembers the selection (/map/web), so links and the back button work.
import { useEffect, useRef, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { atlas, type MapTopic, type Region } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { Glyph, Icon, REGION_GLYPHS } from "../components/Icon";
import { AtlasMap } from "../map/AtlasMap";
import { NODE_STATE_LABEL, REGION_STATE_LABEL, nextTopicIn, nodeState, regionState, useNewlyUnlocked } from "../map/regionState";

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
    <Link to={`/topic/${topic.id}`} className={`mrow ${isNext ? "is-next" : ""}`}>
      {body}
    </Link>
  );
}

function RegionPanel({ region, regions, strict }: { region: Region; regions: Region[]; strict: boolean }) {
  const state = regionState(region);
  const next = nextTopicIn(region);
  const blocked = !region.unlocked && strict;
  const unlockers = region.unlockedBy.map((id) => regions.find((r) => r.id === id)).filter((r): r is Region => Boolean(r));
  const opens = regions.filter((r) => r.unlockedBy.includes(region.id));
  const pct = region.counts.topics ? Math.round((region.counts.assessed / region.counts.topics) * 100) : 0;
  let n = 0;

  return (
    <aside className="rpanel glass" style={{ "--hue": region.hue } as CSSProperties} aria-labelledby="rpanel-title">
      <header className="rpanel__head">
        <span className="rpanel__emblem" aria-hidden="true">
          <Glyph d={REGION_GLYPHS[region.id] ?? REGION_GLYPHS.adv} size={26} />
        </span>
        <div>
          <p className="rpanel__state">
            Region {String(region.number).padStart(2, "0")} · {REGION_STATE_LABEL[state]}
          </p>
          <h2 id="rpanel-title" className="rpanel__title">
            {region.short}
          </h2>
        </div>
      </header>
      <p className="rpanel__tagline">{region.tagline}</p>

      <div className="rpanel__progress">
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span>
          {region.counts.assessed}/{region.counts.topics} passed · {region.counts.written} lessons ready
        </span>
      </div>

      {!region.unlocked && (
        <p className="rpanel__locked" role="note">
          <Icon name="lock" size={16} />
          <span>
            Opens when you pass one assessment (or 3 strikes) in{" "}
            {unlockers.map((u, i) => (
              <span key={u.id}>
                {i > 0 && " or "}
                <Link to={`/map/${u.id}`}>{u.short}</Link>
              </span>
            ))}
            .{!blocked && " You can still peek inside."}
          </span>
        </p>
      )}

      {next && !blocked && (
        <Link to={`/topic/${next.id}`} className="cta rpanel__cta">
          <Icon name="play" size={17} /> {next.status === "new" ? "Enter mission" : "Resume mission"}
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
          Progress here opens{" "}
          {opens.map((o, i) => (
            <span key={o.id}>
              {i > 0 && ", "}
              <Link to={`/map/${o.id}`}>{o.short}</Link>
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
  const fresh = useNewlyUnlocked(data?.[0].regions);
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="world">
      <header className="world__head">
        <div>
          <p className="kicker">The engineering world</p>
          <h1 className="screen-title">Choose where to go.</h1>
        </div>
        <dl className="stats">
          <div>
            <dt>regions open</dt>
            <dd>
              {open}/{map.regions.length}
            </dd>
          </div>
          <div>
            <dt>missions passed</dt>
            <dd>
              {passed}/{total}
            </dd>
          </div>
        </dl>
      </header>

      <div className="world__layout">
        <div className="world__map">
          <AtlasMap regions={map.regions} selectedId={selected.id} hereId={hereId} fresh={fresh} onSelect={(id) => navigate(`/map/${id}`, { replace: Boolean(regionId) })} />
          <ul className="world__legend" aria-label="Legend">
            <li>
              <span className="lg lg--here" /> You are here
            </li>
            <li>
              <span className="lg lg--open" /> Open
            </li>
            <li>
              <span className="lg lg--locked" /> Locked
            </li>
            <li>
              <span className="lg lg--tower" /> Towers grow as you pass missions
            </li>
          </ul>
        </div>
        <div ref={panelRef} className="world__panel">
          <RegionPanel key={selected.id} region={selected} regions={map.regions} strict={map.strictUnlocking} />
        </div>
      </div>
    </div>
  );
}
