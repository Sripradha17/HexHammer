// PROJECT BLUEPRINT: create a project from scratch, or edit every field of one (/projects/:id/blueprint).
// The day-to-day building happens in BuildPage; this is the full form behind it. Validation messages come from the server and appear
// next to each field. Milestones, tasks and tests are checklists. Deleting asks first.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Badge, Button, ConfirmDialog, Field } from "@hexhammer/design-system";
import { ApiError, projectsApi, type CheckItem, type Project, type ProjectDraft } from "../atlasApi";
import { ErrorState, Loading } from "../components/PageState";
import { useRewards } from "../components/Rewards";
import { NotFoundPage } from "./NotFoundPage";
import { EMPTY_PROJECT } from "../projectDraft";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL, formatDate } from "../labels";

const EMPTY: ProjectDraft = EMPTY_PROJECT;

// A list of text lines edited in one textarea: one item per line (simple and keyboard friendly).
function LinesField({ label, hint, value, onChange, error }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  return (
    <Field label={label} hint={hint ?? "One per line."} error={error}>
      {(p) => <textarea className="hh-textarea" rows={Math.max(3, value.length + 1)} value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} {...p} />}
    </Field>
  );
}

function Checklist({ label, items, onChange }: { label: string; items: CheckItem[]; onChange: (items: CheckItem[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <fieldset className="checklist-edit">
      <legend>{label}</legend>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <label className="check">
              <input type="checkbox" checked={item.done} onChange={() => onChange(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} /> {item.title}
            </label>
            <button type="button" className="icon-btn" aria-label={`Remove ${item.title}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
          </li>
        ))}
      </ul>
      <div className="inline-add">
        <label className="visually-hidden" htmlFor={`add-${label}`}>Add to {label}</label>
        <input id={`add-${label}`} className="hh-input" value={draft} placeholder={`Add to ${label.toLowerCase()}…`} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, { title: draft.trim(), done: false }]);
              setDraft("");
            }
          }}
        />
        <Button variant="secondary" size="small" disabled={!draft.trim()} onClick={() => (onChange([...items, { title: draft.trim(), done: false }]), setDraft(""))}>Add</Button>
      </div>
    </fieldset>
  );
}

export function ProjectEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { celebrate } = useRewards();
  const isNew = !id;
  const [project, setProject] = useState<Project | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", doneWhen: "" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const topic = params.get("topic");
    const load = isNew ? (topic ? projectsApi.template(topic) : Promise.resolve(EMPTY)) : projectsApi.get(Number(id));
    load
      .then((data) => {
        if (cancelled) return;
        if (isNew) setDraft({ ...EMPTY, ...(data as ProjectDraft) });
        else {
          setProject(data as Project);
          setDraft(data as Project);
        }
      })
      .catch((e: ApiError) => !cancelled && (e.status === 404 ? setNotFound(true) : setLoadError(e.message)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, isNew, params]);

  if (loading) return <Loading label="Opening the project" />;
  if (notFound) return <NotFoundPage what="project" />;
  if (loadError) return <ErrorState message={loadError} />;

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft({ ...draft, [key]: value });
  const clean = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean);

  async function save() {
    setSaving(true);
    setFieldErrors({});
    setMessage("");
    const body: ProjectDraft = {
      ...draft,
      objectives: clean(draft.objectives),
      prerequisites: clean(draft.prerequisites),
      requirements: clean(draft.requirements),
      acceptanceCriteria: clean(draft.acceptanceCriteria),
      technologies: clean(draft.technologies),
      stretchGoals: clean(draft.stretchGoals),
      repoUrl: draft.repoUrl?.trim() || null,
      demoUrl: draft.demoUrl?.trim() || null,
    };
    try {
      if (isNew) {
        const r = await projectsApi.create(body);
        celebrate({ ...r, message: "Project created" });
        navigate(`/projects/${r.project.id}`, { replace: true });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { milestones, ...changes } = body;
        const r = await projectsApi.update(project!.id, changes);
        setProject(r.project);
        setDraft(r.project);
        celebrate({ ...r, message: "Saved" });
        setMessage("Saved.");
      }
    } catch (e) {
      const err = e as ApiError;
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Optimistic update: tick the box straight away (the screen feels instant), then save. If the save
  // fails, put the box back and say why.
  async function toggleMilestone(milestoneId: number, done: boolean) {
    if (!project) return;
    const before = project;
    setProject({ ...project, milestones: project.milestones.map((m) => (m.id === milestoneId ? { ...m, doneAt: done ? new Date().toISOString() : null } : m)) });
    try {
      const r = await projectsApi.setMilestone(project.id, milestoneId, { done });
      celebrate({ ...r, message: done ? "Milestone done" : undefined });
      setProject((current) => current && { ...current, milestones: current.milestones.map((m) => (m.id === milestoneId ? r.milestone : m)) });
    } catch (e) {
      setProject(before);
      setMessage(`Could not update the milestone: ${(e as Error).message}`);
    }
  }

  async function addMilestone() {
    if (!project || !newMilestone.title.trim()) return;
    const m = await projectsApi.addMilestone(project.id, newMilestone.title.trim(), newMilestone.doneWhen.trim());
    setProject({ ...project, milestones: [...project.milestones, m] });
    setNewMilestone({ title: "", doneWhen: "" });
  }

  async function removeMilestone(milestoneId: number) {
    if (!project) return;
    await projectsApi.removeMilestone(project.id, milestoneId);
    setProject({ ...project, milestones: project.milestones.filter((m) => m.id !== milestoneId) });
  }

  async function remove() {
    if (!project) return;
    await projectsApi.remove(project.id);
    navigate("/projects");
  }

  const milestones = isNew ? (draft.milestones ?? []).map((m, i) => ({ id: -i - 1, order: i + 1, title: m.title, doneWhen: m.doneWhen, doneAt: null })) : project!.milestones;

  return (
    <div className="editor">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/projects">Workshop</Link> <span aria-hidden="true">/</span> {isNew ? <span aria-current="page">New blueprint</span> : <><Link to={`/projects/${project!.id}`}>{project!.title}</Link> <span aria-hidden="true">/</span> <span aria-current="page">Blueprint</span></>}
      </nav>
      <header className="page-head page-head--row">
        <div>
          <p className="eyebrow">{isNew ? (draft.topicId ? "From a topic template" : "From scratch") : `Created ${formatDate(project!.createdAt)}`}</p>
          <h1 className="page-title">{isNew ? "New project" : project!.title}</h1>
          {!isNew && project!.completedAt && <Badge tone="success">Completed {formatDate(project!.completedAt)}</Badge>}
        </div>
      </header>

      <form className="editor__form" onSubmit={(e) => (e.preventDefault(), save())} noValidate>
        <div className="editor__grid">
          <section className="editor__main">
            <Field label="Title" error={fieldErrors.title}>
              {(p) => <input className="hh-input" value={draft.title} onChange={(e) => set("title", e.target.value)} {...p} />}
            </Field>
            <Field label="Description" error={fieldErrors.description}>
              {(p) => <textarea className="hh-textarea" value={draft.description} onChange={(e) => set("description", e.target.value)} {...p} />}
            </Field>
            <LinesField label="Learning objectives" value={draft.objectives} onChange={(v) => set("objectives", v)} />
            <LinesField label="Requirements" value={draft.requirements} onChange={(v) => set("requirements", v)} />
            <LinesField label="Acceptance criteria" hint="One per line. Each should be checkable, ideally by an automated test." value={draft.acceptanceCriteria} onChange={(v) => set("acceptanceCriteria", v)} />
            <LinesField label="Prerequisites" value={draft.prerequisites} onChange={(v) => set("prerequisites", v)} />
            <LinesField label="Stretch goals" value={draft.stretchGoals} onChange={(v) => set("stretchGoals", v)} />
            <Checklist label="Tasks" items={draft.tasks} onChange={(v) => set("tasks", v)} />
            <Checklist label="Tests to write" items={draft.tests} onChange={(v) => set("tests", v)} />
          </section>

          <aside className="editor__side">
            <Field label="Status" error={fieldErrors.status}>
              {(p) => (
                <select className="hh-select" value={draft.status} onChange={(e) => set("status", e.target.value)} {...p}>
                  {Object.entries(PROJECT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
            </Field>
            <Field label="Type">
              {(p) => (
                <select className="hh-select" value={draft.type} onChange={(e) => set("type", e.target.value)} {...p}>
                  {Object.entries(PROJECT_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
            </Field>
            <Field label="Difficulty">
              {(p) => (
                <select className="hh-select" value={draft.difficulty} onChange={(e) => set("difficulty", e.target.value as ProjectDraft["difficulty"])} {...p}>
                  <option value="foundation">Foundation</option>
                  <option value="core">Core</option>
                  <option value="advanced">Advanced</option>
                </select>
              )}
            </Field>
            <Field label="Technologies" hint="Comma separated." error={fieldErrors.technologies}>
              {(p) => <input className="hh-input" value={draft.technologies.join(", ")} onChange={(e) => set("technologies", e.target.value.split(",").map((t) => t.trimStart()))} {...p} />}
            </Field>
            <Field label="GitHub repository" hint="https://github.com/you/repo. Stored as typed; not fetched or inspected." error={fieldErrors.repoUrl}>
              {(p) => <input className="hh-input" type="url" inputMode="url" value={draft.repoUrl ?? ""} onChange={(e) => set("repoUrl", e.target.value)} {...p} />}
            </Field>
            <Field label="Demo URL" hint="https:// (http:// allowed only for localhost)." error={fieldErrors.demoUrl}>
              {(p) => <input className="hh-input" type="url" inputMode="url" value={draft.demoUrl ?? ""} onChange={(e) => set("demoUrl", e.target.value)} {...p} />}
            </Field>
            <Field label="Evidence of completion" hint="Required to mark it complete: tests passing, screenshots, a demo. In your own words." error={fieldErrors.evidence}>
              {(p) => <textarea className="hh-textarea" value={draft.evidence ?? ""} onChange={(e) => set("evidence", e.target.value)} {...p} />}
            </Field>
            <Field label="Reflection: what did you learn?" error={fieldErrors.reflection}>
              {(p) => <textarea className="hh-textarea" value={draft.reflection ?? ""} onChange={(e) => set("reflection", e.target.value)} {...p} />}
            </Field>
          </aside>
        </div>

        <div className="editor__bar">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : isNew ? "Create project" : "Save changes"}</Button>
          {!isNew && <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete…</Button>}
          <span role="status" className={Object.keys(fieldErrors).length ? "field-error" : "muted"}>{message}</span>
        </div>
      </form>

      <section className="milestones" aria-labelledby="ms-title">
        <h2 id="ms-title" className="section-title">Milestones</h2>
        {isNew && <p className="muted">These are saved when you create the project. Then you can tick them off.</p>}
        <ol className="milestone-list">
          {milestones.map((m) => (
            <li key={m.id} className={m.doneAt ? "is-done" : ""}>
              <label className="check">
                <input type="checkbox" disabled={isNew} checked={Boolean(m.doneAt)} onChange={(e) => toggleMilestone(m.id, e.target.checked)} />
                <span>
                  <strong>{m.title}</strong>
                  {m.doneWhen && <span className="muted"> · done when: {m.doneWhen}</span>}
                </span>
              </label>
              {!isNew && <button type="button" className="icon-btn" aria-label={`Remove milestone ${m.title}`} onClick={() => removeMilestone(m.id)}>✕</button>}
            </li>
          ))}
        </ol>
        {!isNew && (
          <div className="inline-add inline-add--wide">
            <label className="visually-hidden" htmlFor="ms-new">New milestone</label>
            <input id="ms-new" className="hh-input" placeholder="New milestone" value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} />
            <label className="visually-hidden" htmlFor="ms-when">Done when</label>
            <input id="ms-when" className="hh-input" placeholder="Done when…" value={newMilestone.doneWhen} onChange={(e) => setNewMilestone({ ...newMilestone, doneWhen: e.target.value })} />
            <Button variant="secondary" size="small" onClick={addMilestone} disabled={!newMilestone.title.trim()}>Add milestone</Button>
          </div>
        )}
      </section>

      <ConfirmDialog open={confirmDelete} title="Delete this project?" confirmLabel="Delete project" danger onConfirm={remove} onCancel={() => setConfirmDelete(false)}>
        <p>
          "{project?.title}" and its milestones will be removed. XP you already earned stays (the work was real). This cannot be undone; consider archiving instead.
        </p>
      </ConfirmDialog>
    </div>
  );
}
