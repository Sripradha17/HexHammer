// WORKSHOP: build real things. Every project is a "build bay" card: a picture of what it makes,
// one line of objective, difficulty and the skills it needs, real progress, and ONE action
// (Start build / Resume build). Starting copies the topic's template into my own project record
// and drops me into the build, milestone by milestone.
//
// Detailed requirements and acceptance criteria live inside the build (Briefing step), not here.
import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { projectsApi, type Project, type ProjectTemplate } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { useRewards } from "../components/Rewards";
import { Icon } from "../components/Icon";
import { BuildArt } from "../components/BuildArt";
import { EMPTY_PROJECT, firstSentence } from "../projectDraft";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL } from "../labels";

const DIFFICULTY_DOTS = { foundation: 1, core: 2, advanced: 3 } as const;

function Difficulty({ level }: { level: keyof typeof DIFFICULTY_DOTS }) {
  return (
    <span className="diff" title={`Difficulty: ${level}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= DIFFICULTY_DOTS[level] ? "is-on" : ""} aria-hidden="true" />
      ))}
      <span className="diff__label">{level}</span>
    </span>
  );
}

const doneCount = (p: Project) => p.milestones.filter((m) => m.doneAt).length;

// A project I already have.
function MyBuildCard({ project, hue }: { project: Project; hue: number }) {
  const done = doneCount(project);
  const total = project.milestones.length;
  const next = project.milestones.find((m) => !m.doneAt);
  const complete = project.status === "complete";
  return (
    <article className="bay" style={{ "--hue": hue } as CSSProperties}>
      <BuildArt type={project.type} hue={hue} preview={project.acceptanceCriteria[0] ?? project.title} progress={total ? done / total : 0} />
      <div className="bay__body">
        <p className="bay__meta">
          <span className={`pill ${complete ? "pill--green" : "pill--amber"}`}>{PROJECT_STATUS_LABEL[project.status] ?? project.status}</span>
          <Difficulty level={project.difficulty} />
        </p>
        <h3 className="bay__title">{project.title}</h3>
        <p className="bay__goal">{complete ? "Built and proven." : next ? `Next: ${next.title}` : firstSentence(project.description)}</p>
        <div className="bay__progress">
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
          <span>
            {done}/{total} milestones
          </span>
        </div>
        <Link to={`/projects/${project.id}`} className={`cta cta--small ${complete ? "cta--ghost" : ""}`}>
          {complete ? "Open build" : "Resume build"} <Icon name="arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}

// A build I can start, from a written topic's template.
function TemplateCard({ template, highlight, onStart, busy }: { template: ProjectTemplate; highlight: boolean; onStart: () => void; busy: boolean }) {
  const skills = [...template.prerequisiteTopics.map((t) => t.title), ...template.technologies].slice(0, 3);
  return (
    <article id={`build-${template.topicId}`} className={`bay ${highlight ? "is-highlight" : ""}`} style={{ "--hue": template.region.hue } as CSSProperties}>
      <BuildArt type={template.type} hue={template.region.hue} preview={template.acceptanceCriteria[0] ?? template.title} />
      <div className="bay__body">
        <p className="bay__meta">
          <span className="pill">{template.region.short}</span>
          <span className="pill">{PROJECT_TYPE_LABEL[template.type] ?? template.type}</span>
          <Difficulty level={template.difficulty} />
        </p>
        <h3 className="bay__title">{template.title}</h3>
        <p className="bay__goal">{firstSentence(template.description)}</p>
        {skills.length > 0 && (
          <ul className="bay__skills" aria-label="Skills used">
            {skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <p className="bay__ms">
          {template.milestones?.length ?? 0} milestones · from <Link to={`/topic/${template.topicId}`}>{template.topicTitle}</Link>
        </p>
        <button type="button" className="cta cta--small" onClick={onStart} disabled={busy}>
          <Icon name="play" size={15} /> {busy ? "Opening the bay…" : "Start build"}
        </button>
      </div>
    </article>
  );
}

export function WorkshopPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([projectsApi.list(), projectsApi.templates()]));
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { celebrate } = useRewards();
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState("");
  const highlight = params.get("start");

  // Arriving from a mission (?start=topic): bring that build into view.
  useEffect(() => {
    if (highlight && data) document.getElementById(`build-${highlight}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight, data]);

  if (loading && !data) return <Loading label="Opening the workshop" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [{ projects }, { templates }] = data;
  const hueOf = (p: Project) => templates.find((t) => t.topicId === p.topicId)?.region.hue ?? 36;
  const active = projects.filter((p) => !["complete", "archived"].includes(p.status));
  const finished = projects.filter((p) => p.status === "complete");
  const startedTopics = new Set(projects.map((p) => p.topicId));
  const available = templates.filter((t) => !startedTopics.has(t.topicId));
  const featured = active[0];

  async function start(t: ProjectTemplate) {
    setStarting(t.topicId);
    setStartError("");
    try {
      const draft = await projectsApi.template(t.topicId);
      const r = await projectsApi.create({ ...EMPTY_PROJECT, ...draft, status: "in_progress" });
      celebrate({ ...r, message: "Build bay open" });
      navigate(`/projects/${r.project.id}`);
    } catch (e) {
      setStartError((e as Error).message);
      setStarting(null);
    }
  }

  return (
    <div className="workshop">
      <header className="screen-head">
        <div>
          <p className="kicker">Workshop</p>
          <h1 className="screen-title">Build things that prove it.</h1>
          <p>Pick a bay. Each build goes Briefing → Build → Test → Fix → Complete.</p>
        </div>
        <Link to="/projects/new" className="cta cta--ghost cta--small">
          Blank blueprint
        </Link>
      </header>

      {featured && (
        <section className="feature glass" style={{ "--hue": hueOf(featured) } as CSSProperties} aria-label="Current build">
          <BuildArt type={featured.type} hue={hueOf(featured)} preview={featured.acceptanceCriteria[0] ?? featured.title} progress={featured.milestones.length ? doneCount(featured) / featured.milestones.length : 0} />
          <div className="feature__body">
            <p className="kicker kicker--amber">On the bench</p>
            <h2 className="feature__title">{featured.title}</h2>
            <ol className="feature__ms">
              {featured.milestones.map((m) => (
                <li key={m.id} className={m.doneAt ? "is-done" : ""}>
                  <span aria-hidden="true">{m.doneAt ? <Icon name="check" size={13} /> : m.order}</span>
                  {m.title}
                </li>
              ))}
            </ol>
            <Link to={`/projects/${featured.id}`} className="cta">
              <Icon name="play" size={17} /> Resume build
            </Link>
          </div>
        </section>
      )}

      {startError && (
        <p className="field-error" role="alert">
          Could not start that build: {startError}
        </p>
      )}

      {active.length > 1 && (
        <section className="bays-section">
          <h2 className="bays-section__title">Your builds</h2>
          <div className="bays">
            {active.slice(1).map((p) => (
              <MyBuildCard key={p.id} project={p} hue={hueOf(p)} />
            ))}
          </div>
        </section>
      )}

      <section className="bays-section">
        <h2 className="bays-section__title">Ready to build</h2>
        <div className="bays">
          {available.map((t) => (
            <TemplateCard key={t.topicId} template={t} highlight={t.topicId === highlight} busy={starting === t.topicId} onStart={() => start(t)} />
          ))}
        </div>
      </section>

      {finished.length > 0 && (
        <section className="bays-section">
          <h2 className="bays-section__title">Built</h2>
          <div className="bays">
            {finished.map((p) => (
              <MyBuildCard key={p.id} project={p} hue={hueOf(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
