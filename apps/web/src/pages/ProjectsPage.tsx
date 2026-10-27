// PROJECT WORKSHOP: every project, grouped by where it is in its life. Start from a topic's template
// or from scratch.
import { Link } from "react-router";
import { Badge, EmptyState, ProgressBar } from "@hexhammer/design-system";
import { projectsApi, type Project } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL, formatDate } from "../labels";

const COLUMNS: { title: string; statuses: string[] }[] = [
  { title: "Ideas and planned", statuses: ["idea", "planned"] },
  { title: "In progress", statuses: ["in_progress", "blocked"] },
  { title: "Complete", statuses: ["complete"] },
];

function ProjectCard({ p }: { p: Project }) {
  const done = p.milestones.filter((m) => m.doneAt).length;
  return (
    <li className="project-card">
      <Link to={`/projects/${p.id}`} className="project-card__link">
        <span className="project-card__title">{p.title}</span>
      </Link>
      <span className="project-card__meta">
        <Badge tone={p.status === "blocked" ? "danger" : p.status === "complete" ? "success" : "soft"}>{PROJECT_STATUS_LABEL[p.status]}</Badge>{" "}
        <span className="muted">{PROJECT_TYPE_LABEL[p.type]}</span>
      </span>
      {p.milestones.length > 0 && <ProgressBar name={`${p.title}: milestones done`} percent={(done / p.milestones.length) * 100} label={`${done}/${p.milestones.length}`} />}
      <span className="muted project-card__date">Updated {formatDate(p.updatedAt)}</span>
    </li>
  );
}

export function ProjectsPage() {
  const { data, error, loading, reload } = useLoad(() => projectsApi.list());
  if (loading && !data) return <Loading label="Opening the workshop" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const projects = data?.projects ?? [];
  const archived = projects.filter((p) => p.status === "archived");

  return (
    <div className="workshop">
      <header className="page-head page-head--row">
        <div>
          <p className="eyebrow">Project Workshop</p>
          <h1 className="page-title">Build things that prove it.</h1>
          <p className="lead">Every written topic suggests a project with acceptance criteria. Links you add are stored as you typed them; Hexhammer never claims to have checked a repository.</p>
        </div>
        <Link to="/projects/new" className="hh-button hh-button--primary">New project</Link>
      </header>
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" action={<Link to="/map" className="hh-button hh-button--secondary">Find a topic's project on the map</Link>}>
          Start from a topic (each one has a template with requirements, milestones and tests) or create one from scratch.
        </EmptyState>
      ) : (
        <div className="board">
          {COLUMNS.map((col) => {
            const own = projects.filter((p) => col.statuses.includes(p.status));
            return (
              <section key={col.title} className="board__col" aria-labelledby={`col-${col.title}`}>
                <h2 id={`col-${col.title}`} className="board__title">{col.title} <span className="muted">{own.length}</span></h2>
                {own.length === 0 ? <p className="muted">Nothing here.</p> : <ul className="board__list">{own.map((p) => <ProjectCard key={p.id} p={p} />)}</ul>}
              </section>
            );
          })}
        </div>
      )}
      {archived.length > 0 && (
        <details className="archived">
          <summary>Archived ({archived.length})</summary>
          <ul className="board__list">{archived.map((p) => <ProjectCard key={p.id} p={p} />)}</ul>
        </details>
      )}
    </div>
  );
}
