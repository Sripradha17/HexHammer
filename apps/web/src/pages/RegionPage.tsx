// One region of the map: its story on the left, its modules and topics on the right
// (an asymmetric editorial band, see docs/design-references). Every status is real.
import { Link, useParams } from "react-router";
import { Badge, Hex } from "@hexhammer/design-system";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { NotFoundPage } from "./NotFoundPage";
import { STATUS_FILL, STATUS_LABEL, hueStyle } from "../labels";

export function RegionPage() {
  const { regionId = "" } = useParams();
  const { data, error, loading, reload } = useLoad(() => atlas.map(), [regionId]);

  if (loading && !data) return <Loading label="Opening the region" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const region = data?.regions.find((r) => r.id === regionId);
  if (!data || !region) return <NotFoundPage what="region" />;
  const blocked = !region.unlocked && data.strictUnlocking;
  const unlockers = region.unlockedBy.map((id) => data.regions.find((r) => r.id === id)!).filter(Boolean);

  return (
    <div className="region" style={hueStyle(region.hue)}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/map">World map</Link> <span aria-hidden="true">/</span> <span aria-current="page">{region.short}</span>
      </nav>

      <div className="region__band">
        <header className="region__intro">
          <p className="eyebrow">Region {String(region.number).padStart(2, "0")}</p>
          <h1 className="page-title region__title">{region.title}</h1>
          <p className="lead">{region.tagline}</p>
          <p>{region.story}</p>
          <dl className="facts">
            <div><dt>Topics</dt><dd>{region.counts.topics}</dd></div>
            <div><dt>Lessons written</dt><dd>{region.counts.written}</dd></div>
            <div><dt>Assessed</dt><dd>{region.counts.assessed}</dd></div>
            <div><dt>Mastered</dt><dd>{region.counts.mastered}</dd></div>
          </dl>
          {!region.unlocked && (
            <div className="callout callout--locked" role="note">
              <strong>Locked region.</strong> It opens when you pass any assessment, or complete three strikes, in{" "}
              {unlockers.map((u, i) => (
                <span key={u.id}>
                  {i > 0 && " or "}
                  <Link to={`/map/${u.id}`}>{u.short}</Link>
                </span>
              ))}
              . {blocked ? "Strict unlocking is on in Settings, so topics here cannot be opened yet." : "You can still peek at its topics."}
            </div>
          )}
        </header>

        <div className="region__modules">
          {region.modules.map((m) => (
            <section key={m.id} className="module" aria-labelledby={`m-${m.id}`}>
              <h2 id={`m-${m.id}`} className="module__title">{m.title}</h2>
              <p className="muted module__summary">{m.summary}</p>
              <ul className="topic-list">
                {m.topics.map((t) => {
                  const row = (
                    <>
                      <Hex size={34} hue={region.hue} fill={STATUS_FILL[t.status]} locked={t.status === "locked"} review={t.reviewDue} />
                      <span className="topic-row__main">
                        <span className="topic-row__title">
                          {t.capstone && <span className="crown" title="Capstone: a boss battle for this region">♛ </span>}
                          {t.title}
                        </span>
                        <span className="topic-row__meta">
                          {STATUS_LABEL[t.status]} · {t.difficulty}
                          {t.strikeCount > 0 && ` · ${t.strikeCount} hands-on strike${t.strikeCount > 1 ? "s" : ""}`}
                        </span>
                      </span>
                      <span className="topic-row__badges">
                        {t.stage === "complete" ? <Badge tone="success">Lesson ready</Badge> : <Badge tone="soft">Outline</Badge>}
                        {t.reviewDue && <Badge tone="review">Review due</Badge>}
                      </span>
                    </>
                  );
                  return (
                    <li key={t.id}>
                      {blocked ? (
                        <span className="topic-row topic-row--blocked" aria-disabled="true">{row}</span>
                      ) : (
                        <Link to={`/topic/${t.id}`} className="topic-row">{row}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
