// ENGINEERING PORTFOLIO: everything I have built, filterable, with links, skills and reflections.
// It gets more impressive as I progress, because it only ever shows real projects.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge, Chip, EmptyState } from "@hexhammer/design-system";
import { atlas, projectsApi } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL, hueStyle } from "../labels";

export function PortfolioPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([projectsApi.list(), atlas.map()]));
  const [status, setStatus] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [tech, setTech] = useState("");

  const [projectData, mapData] = data ?? [null, null];
  const projects = useMemo(() => (projectData?.projects ?? []).filter((p) => p.status !== "archived"), [projectData]);
  const allTech = useMemo(() => [...new Set(projects.flatMap((p) => p.technologies))].sort(), [projects]);
  const regionOf = (id: string | null) => mapData?.regions.find((r) => r.id === id);

  const shown = projects.filter(
    (p) =>
      (!status.length || status.includes(p.status)) &&
      (!types.length || types.includes(p.type)) &&
      (!difficulty.length || difficulty.includes(p.difficulty)) &&
      (!domain || p.domainId === domain) &&
      (!tech || p.technologies.includes(tech)),
  );

  if (loading && !data) return <Loading label="Hanging the portfolio" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const toggle = (list: string[], v: string, set: (l: string[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const complete = projects.filter((p) => p.status === "complete").length;

  return (
    <div className="portfolio">
      <header className="page-head page-head--row">
        <div>
          <p className="eyebrow">Engineering portfolio · {projects.length} projects · {complete} complete</p>
          <h1 className="page-title">Work you can show.</h1>
          <p className="lead">Repository and demo links are listed exactly as entered. Hexhammer does not inspect, build or deploy them.</p>
        </div>
        {projects.length > 0 && <a className="hh-button hh-button--secondary" href="/api/projects/export/markdown" download>Export as Markdown</a>}
      </header>

      {projects.length === 0 ? (
        <EmptyState title="Your portfolio starts with one project" action={<Link to="/projects/new" className="hh-button hh-button--primary">Create a project</Link>}>
          Every complete topic comes with a project template. Finished projects appear here with their evidence and reflections.
        </EmptyState>
      ) : (
        <>
          <div className="filters" role="group" aria-label="Filter projects">
            {Object.entries(PROJECT_STATUS_LABEL).filter(([v]) => v !== "archived").map(([v, l]) => (
              <Chip key={v} pressed={status.includes(v)} onToggle={() => toggle(status, v, setStatus)}>{l}</Chip>
            ))}
            <span className="filters__sep" aria-hidden="true" />
            {Object.entries(PROJECT_TYPE_LABEL).map(([v, l]) => (
              <Chip key={v} pressed={types.includes(v)} onToggle={() => toggle(types, v, setTypes)}>{l}</Chip>
            ))}
            <span className="filters__sep" aria-hidden="true" />
            {["foundation", "core", "advanced"].map((d) => (
              <Chip key={d} pressed={difficulty.includes(d)} onToggle={() => toggle(difficulty, d, setDifficulty)}>{d}</Chip>
            ))}
            <label className="filters__select">
              <span className="visually-hidden">Domain</span>
              <select className="hh-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                <option value="">All domains</option>
                {mapData?.regions.map((r) => <option key={r.id} value={r.id}>{r.short}</option>)}
              </select>
            </label>
            <label className="filters__select">
              <span className="visually-hidden">Technology</span>
              <select className="hh-select" value={tech} onChange={(e) => setTech(e.target.value)}>
                <option value="">All technologies</option>
                {allTech.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <p className="muted" aria-live="polite">{shown.length} shown</p>
          <ul className="showcase">
            {shown.map((p) => {
              const region = regionOf(p.domainId);
              const done = p.milestones.filter((m) => m.doneAt).length;
              return (
                <li key={p.id} className={`showcase__item ${p.status === "complete" ? "is-complete" : ""}`} style={region ? hueStyle(region.hue) : undefined}>
                  <p className="eyebrow">{region?.short ?? "Unassigned"} · {PROJECT_TYPE_LABEL[p.type]} · {p.difficulty}</p>
                  <h2 className="showcase__title"><Link to={`/projects/${p.id}`}>{p.title}</Link></h2>
                  <p>{p.description}</p>
                  <p>
                    <Badge tone={p.status === "complete" ? "success" : "soft"}>{PROJECT_STATUS_LABEL[p.status]}</Badge>{" "}
                    {p.milestones.length > 0 && <span className="muted">{done}/{p.milestones.length} milestones</span>}
                  </p>
                  {p.technologies.length > 0 && <p className="tags">{p.technologies.map((t) => <span key={t} className="tag">{t}</span>)}</p>}
                  {p.objectives.length > 0 && (
                    <p className="muted"><strong>Skills demonstrated:</strong> {p.objectives.slice(0, 3).join(" · ")}</p>
                  )}
                  <p className="showcase__links">
                    {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer noopener">Repository ↗</a>}
                    {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer noopener">Demo ↗</a>}
                  </p>
                  {p.reflection && <blockquote className="showcase__reflection">{p.reflection}</blockquote>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
