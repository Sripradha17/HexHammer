// A BUILD: one project, one phase at a time.
//
//   BRIEFING  what I'm making and how I'll know it's done (details tucked away until needed)
//   BUILD     the current milestone, big, with the workbench (real editor, runs in a Web Worker)
//   TEST      the test ideas as a checklist, and the bench open on tests.js
//   FIX       whatever failed in my last run, with the acceptance criteria to aim at
//   COMPLETE  evidence and reflection, then mark it complete (the server checks the evidence)
//
// Milestones, tests and status are saved to the database. The workbench files are a scratch
// bench saved in this browser.
import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ApiError, projectsApi, type CheckItem, type Project } from "../atlasApi";
import { ErrorState, Loading } from "../components/PageState";
import { useRewards } from "../components/Rewards";
import { Icon } from "../components/Icon";
import { NotFoundPage } from "./NotFoundPage";
import { PROJECT_TYPE_LABEL, formatDate } from "../labels";
import type { RunResult } from "../runner/execute";
// The workbench pulls in the Monaco editor: load it only when a phase shows it.
const Workbench = lazy(() => import("../components/Workbench").then((m) => ({ default: m.Workbench })));

type PhaseId = "briefing" | "build" | "test" | "fix" | "complete";
const PHASES: { id: PhaseId; label: string }[] = [
  { id: "briefing", label: "Briefing" },
  { id: "build", label: "Build" },
  { id: "test", label: "Test" },
  { id: "fix", label: "Fix" },
  { id: "complete", label: "Complete" },
];

function Checks({ items, onToggle }: { items: CheckItem[]; onToggle: (i: number) => void }) {
  return (
    <ul className="checks">
      {items.map((t, i) => (
        <li key={t.title + i}>
          <label className={`checks__item ${t.done ? "is-done" : ""}`}>
            <input type="checkbox" checked={t.done} onChange={() => onToggle(i)} />
            <span className="checks__box" aria-hidden="true">
              {t.done && <Icon name="check" size={13} />}
            </span>
            {t.title}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function BuildPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { celebrate } = useRewards();
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [evidence, setEvidence] = useState("");
  const [reflection, setReflection] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    projectsApi
      .get(Number(id))
      .then((p) => {
        setProject(p);
        setEvidence(p.evidence ?? "");
        setReflection(p.reflection ?? "");
        setRepoUrl(p.repoUrl ?? "");
      })
      .catch((e: ApiError) => (e.status === 404 ? setNotFound(true) : setLoadError(e.message)));
  }, [id]);

  if (notFound) return <NotFoundPage what="project" />;
  if (loadError) return <ErrorState message={loadError} />;
  if (!project) return <Loading label="Opening the build bay" />;

  const done = project.milestones.filter((m) => m.doneAt).length;
  const total = project.milestones.length;
  const current = project.milestones.find((m) => !m.doneAt) ?? null;
  const complete = project.status === "complete";
  const testsDone = project.tests.filter((t) => t.done).length;
  const failures = lastRun?.results.filter((r) => !r.passed) ?? [];

  // Which phases are really done.
  const phaseDone: Record<PhaseId, boolean> = {
    briefing: done > 0 || complete,
    build: total > 0 && done === total,
    test: project.tests.length > 0 && testsDone === project.tests.length,
    fix: Boolean(lastRun && lastRun.results.length > 0 && failures.length === 0),
    complete,
  };
  const hashPhase = PHASES.find((p) => `#${p.id}` === location.hash)?.id;
  const phase: PhaseId = hashPhase ?? (complete ? "complete" : done === 0 ? "briefing" : current ? "build" : "test");
  const index = PHASES.findIndex((p) => p.id === phase);
  const go = (p: PhaseId) => {
    navigate({ hash: p }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function toggleMilestone(milestoneId: number, nowDone: boolean) {
    const before = project!;
    // Optimistic: tick straight away, put it back if saving fails.
    setProject({ ...before, milestones: before.milestones.map((m) => (m.id === milestoneId ? { ...m, doneAt: nowDone ? new Date().toISOString() : null } : m)) });
    try {
      const r = await projectsApi.setMilestone(before.id, milestoneId, { done: nowDone });
      celebrate({ ...r, message: nowDone ? "Milestone done" : undefined });
      setProject((p) => p && { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? r.milestone : m)) });
    } catch (e) {
      setProject(before);
      setMessage(`Could not save: ${(e as Error).message}`);
    }
  }

  async function save(changes: Partial<Project>, note?: string) {
    try {
      const r = await projectsApi.update(project!.id, changes);
      setProject(r.project);
      celebrate({ ...r, message: note });
      setFieldErrors({});
      return true;
    } catch (e) {
      const err = e as ApiError;
      setFieldErrors(err.fields ?? {});
      setMessage(err.message);
      return false;
    }
  }

  const toggleTest = (i: number) => save({ tests: project.tests.map((t, j) => (j === i ? { ...t, done: !t.done } : t)) });
  const toggleTask = (i: number) => save({ tasks: project.tasks.map((t, j) => (j === i ? { ...t, done: !t.done } : t)) });

  async function finish() {
    setMessage("");
    const ok = await save({ evidence: evidence.trim() || null, reflection: reflection.trim() || null, repoUrl: repoUrl.trim() || null, status: "complete" }, "Build complete");
    if (ok) setJustCompleted(true);
  }

  const bench = (tab: "code" | "tests") => (
    <Suspense fallback={<Loading label="Loading the workbench" />}>
      <Workbench projectId={project.id} initialTab={tab} onRun={setLastRun} />
    </Suspense>
  );
  const hue = 36;

  return (
    <div className="build" style={{ "--hue": hue } as CSSProperties}>
      <header className="mission__head">
        <Link to="/projects" className="mission__back">
          <Icon name="back" size={16} /> Workshop
        </Link>
        <p className="kicker">
          {PROJECT_TYPE_LABEL[project.type] ?? project.type} · {project.difficulty} · {done}/{total} milestones
          {complete && <span className="pill pill--green">Complete {formatDate(project.completedAt)}</span>}
        </p>
        <h1 className="mission__title">{project.title}</h1>
        <nav aria-label="Build phases">
          <ol className="path">
            {PHASES.map((p, i) => (
              <li key={p.id} className={phaseDone[p.id] ? "is-done" : ""}>
                <button type="button" className="path__step" aria-current={p.id === phase ? "step" : undefined} onClick={() => go(p.id)}>
                  <span className="path__dot" aria-hidden="true">
                    {phaseDone[p.id] ? <Icon name="check" size={14} /> : i + 1}
                  </span>
                  {p.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {message && (
        <p className="field-error" role="alert">
          {message}
        </p>
      )}

      <section className="mission__step" key={phase}>
        {phase === "briefing" && (
          <div className="step-grid">
            <div>
              <p className="kicker kicker--amber">The brief</p>
              <p className="scenario__text">{project.description}</p>
              <p className="build__done-when">
                <Icon name="trophy" size={18} />
                <span>
                  <strong>Finished when:</strong> {project.acceptanceCriteria[0] ?? "you decide (edit the blueprint)."}
                </span>
              </p>
              <ul className="bay__skills">
                {project.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <details className="more">
                <summary>All {project.acceptanceCriteria.length} acceptance criteria</summary>
                <ul className="goals">
                  {project.acceptanceCriteria.map((c) => (
                    <li key={c}>
                      <Icon name="check" size={14} /> {c}
                    </li>
                  ))}
                </ul>
              </details>
              {project.requirements.length > 0 && (
                <details className="more">
                  <summary>Requirements</summary>
                  <ul className="goals">
                    {project.requirements.map((c) => (
                      <li key={c}>· {c}</li>
                    ))}
                  </ul>
                </details>
              )}
              <p className="small">
                <Link to={`/projects/${project.id}/blueprint`}>Edit the blueprint</Link>
                {project.topicId && (
                  <>
                    {" · "}
                    <Link to={`/topic/${project.topicId}`}>The mission behind it</Link>
                  </>
                )}
              </p>
            </div>
            <div className="stage-box">
              <div className="build-poster" aria-hidden="true">
                <span>⚒️</span>
                <span className="build-poster__bar">
                  <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                </span>
              </div>
              <p className="kicker" style={{ marginTop: 16 }}>
                Your route
              </p>
              <ol className="feature__ms">
                {project.milestones.map((m) => (
                  <li key={m.id} className={m.doneAt ? "is-done" : ""}>
                    <span aria-hidden="true">{m.doneAt ? <Icon name="check" size={13} /> : m.order}</span>
                    {m.title}
                  </li>
                ))}
              </ol>
              <button type="button" className="cta" onClick={() => go("build")}>
                <Icon name="play" size={16} /> Start building
              </button>
            </div>
          </div>
        )}

        {phase === "build" && (
          <div className="build__grid">
            <div className="build__milestone">
              {current ? (
                <div className="stage-box ms-card">
                  <p className="kicker kicker--amber">
                    Milestone {current.order} of {total}
                  </p>
                  <h2 className="ms-card__title">{current.title}</h2>
                  {current.doneWhen && (
                    <p className="ms-card__when">
                      <strong>Done when:</strong> {current.doneWhen}
                    </p>
                  )}
                  <button type="button" className="cta cta--small" onClick={() => toggleMilestone(current.id, true)}>
                    <Icon name="check" size={15} /> Mark milestone done
                  </button>
                </div>
              ) : (
                <div className="stage-box ms-card burst">
                  <p className="kicker kicker--amber">All {total} milestones done</p>
                  <h2 className="ms-card__title">Now prove it with tests.</h2>
                  <button type="button" className="cta cta--small" onClick={() => go("test")}>
                    Go to Test <Icon name="arrow" size={15} />
                  </button>
                </div>
              )}
              <ol className="ms-list">
                {project.milestones.map((m) => (
                  <li key={m.id}>
                    <label className={`checks__item ${m.doneAt ? "is-done" : ""} ${m.id === current?.id ? "is-current" : ""}`}>
                      <input type="checkbox" checked={Boolean(m.doneAt)} onChange={(e) => toggleMilestone(m.id, e.target.checked)} />
                      <span className="checks__box" aria-hidden="true">
                        {m.doneAt && <Icon name="check" size={13} />}
                      </span>
                      {m.title}
                    </label>
                  </li>
                ))}
              </ol>
              {project.tasks.length > 0 && (
                <details className="more">
                  <summary>Tasks</summary>
                  <Checks items={project.tasks} onToggle={toggleTask} />
                </details>
              )}
            </div>
            <div className="stage-box stage-box--bench">{bench("code")}</div>
          </div>
        )}

        {phase === "test" && (
          <div className="build__grid">
            <div>
              <p className="kicker">Tests to write · {testsDone}/{project.tests.length} passing</p>
              <p className="muted">Write each one in tests.js, run it, and tick it when it passes.</p>
              <Checks items={project.tests} onToggle={toggleTest} />
            </div>
            <div className="stage-box stage-box--bench">{bench("tests")}</div>
          </div>
        )}

        {phase === "fix" && (
          <div className="build__grid">
            <div>
              {!lastRun ? (
                <p className="scenario__text">Run the workbench first. Anything that fails shows up here, one problem at a time.</p>
              ) : failures.length === 0 ? (
                <div className="stage-box ms-card">
                  <p className="kicker kicker--amber">Clean run</p>
                  <h2 className="ms-card__title">{lastRun.results.length ? `All ${lastRun.results.length} tests pass.` : "No tests ran yet."}</h2>
                  {lastRun.results.length > 0 && (
                    <button type="button" className="cta cta--small" onClick={() => go("complete")}>
                      Go to Complete <Icon name="arrow" size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="stage-box ms-card">
                  <p className="kicker kicker--amber">
                    {failures.length} failing · fix the first one
                  </p>
                  <h2 className="ms-card__title">{failures[0].name}</h2>
                  <p className="ms-card__when">{failures[0].message}</p>
                  <p className="muted small">Read the message, change one thing, run again. That's the whole loop.</p>
                </div>
              )}
              <details className="more">
                <summary>What "done" means for this build</summary>
                <ul className="goals">
                  {project.acceptanceCriteria.map((c) => (
                    <li key={c}>
                      <Icon name="check" size={14} /> {c}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            <div className="stage-box stage-box--bench">{bench("code")}</div>
          </div>
        )}

        {phase === "complete" && (
          <div className="step-grid">
            {complete ? (
              <div className={`stage-box ms-card ${justCompleted ? "burst" : ""}`}>
                <p className="kicker kicker--amber">Built</p>
                <h2 className="ms-card__title">It's in your portfolio.</h2>
                <p>{project.evidence}</p>
                <div className="home__actions">
                  <Link to="/portfolio" className="cta cta--small">
                    <Icon name="portfolio" size={15} /> See portfolio
                  </Link>
                  <Link to="/projects" className="cta cta--ghost cta--small">
                    Next build
                  </Link>
                </div>
              </div>
            ) : (
              <form className="stage-box finish" onSubmit={(e) => (e.preventDefault(), finish())}>
                <p className="kicker kicker--amber">Ship it</p>
                <label className="finish__field">
                  <span>Evidence it works (required)</span>
                  <textarea className="hh-textarea" rows={4} value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Tests passing, what you ran, what you saw." />
                  {fieldErrors.evidence && <span className="field-error">{fieldErrors.evidence}</span>}
                </label>
                <label className="finish__field">
                  <span>What did you learn?</span>
                  <textarea className="hh-textarea" rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} />
                </label>
                <label className="finish__field">
                  <span>Repository link (optional)</span>
                  <input className="hh-input" type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/repo" />
                  {fieldErrors.repoUrl && <span className="field-error">{fieldErrors.repoUrl}</span>}
                </label>
                <button type="submit" className="cta" disabled={!evidence.trim()}>
                  <Icon name="trophy" size={17} /> Complete build
                </button>
              </form>
            )}
            <div>
              <p className="kicker">Checklist</p>
              <ul className="seals">
                {[
                  [`Milestones ${done}/${total}`, phaseDone.build],
                  [`Tests ticked ${testsDone}/${project.tests.length}`, phaseDone.test],
                  ["Evidence written", Boolean(evidence.trim())],
                ].map(([label, met]) => (
                  <li key={String(label)} className={met ? "is-met" : ""}>
                    <span className="seals__mark" aria-hidden="true">
                      {met ? <Icon name="check" size={14} /> : null}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              {project.stretchGoals.length > 0 && (
                <details className="more">
                  <summary>Stretch goals</summary>
                  <ul className="goals">
                    {project.stretchGoals.map((g) => (
                      <li key={g}>· {g}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}
      </section>

      {index < PHASES.length - 1 && (
        <footer className="mission__foot">
          <button type="button" className="cta cta--ghost cta--small" onClick={() => go(PHASES[index + 1].id)}>
            Continue to {PHASES[index + 1].label} <Icon name="arrow" size={16} />
          </button>
        </footer>
      )}
    </div>
  );
}
