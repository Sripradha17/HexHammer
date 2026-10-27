// THE LEARNING STUDIO: one topic, end to end. Story → mental model → lesson (one section at a time)
// → worked examples → lab → exercises → assessment → project → interview → mastery → references.
// Outline topics (not written yet) say so honestly, and point at the hands-on strikes that exist.
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Badge, Button, Hex } from "@hexhammer/design-system";
import { atlas, type PublicChoice, type TopicView } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { ChoiceQuestion } from "../components/ChoiceQuestion";
import { CodeBlock, InlineText, RichText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { LabHost } from "../labs/LabHost";
import { NotFoundPage } from "./NotFoundPage";
import { STATUS_FILL, STATUS_LABEL, formatDate, hueStyle, relativeDays } from "../labels";

// ------------------------------------------------------------------ Lesson, one section at a time

function LessonFlow({ view, onRead }: { view: TopicView; onRead: () => void }) {
  const sections = view.topic.lessonSections;
  const [shown, setShown] = useState(view.progress.lessonRead ? sections.length : 1);
  const [reported, setReported] = useState(view.progress.lessonRead);

  function reveal(n: number) {
    setShown(n);
    if (n >= sections.length && !reported) {
      setReported(true);
      onRead();
    }
  }

  return (
    <div className="lesson">
      <ol className="lesson__sections">
        {sections.slice(0, shown).map((s, i) => (
          <li key={s.heading} className="lesson__section">
            <h3 className="lesson__heading">{s.heading}</h3>
            <RichText text={s.body} />
            {/* A quick check halfway through, so reading is never passive. */}
            {i === 1 && view.topic.knowledgeChecks[0] && (
              <ChoiceQuestion question={view.topic.knowledgeChecks[0]} kindLabel="Quick check" />
            )}
          </li>
        ))}
      </ol>
      <div className="lesson__controls">
        <span className="muted" aria-live="polite">
          Section {Math.min(shown, sections.length)} of {sections.length}
          {reported && " · lesson read"}
        </span>
        {shown < sections.length ? (
          <>
            <Button onClick={() => reveal(shown + 1)}>Next section</Button>
            <Button variant="ghost" size="small" onClick={() => reveal(sections.length)}>Show all</Button>
          </>
        ) : (
          <Badge tone="success">✓ All sections read (reading alone isn't mastery)</Badge>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Worked example with a stepper

function WorkedExample({ example }: { example: TopicView["topic"]["codeExamples"][number] }) {
  const [step, setStep] = useState(-1);
  return (
    <div className="example">
      <h3 className="subhead">{example.title}</h3>
      <CodeBlock code={example.code} label={example.language.toUpperCase()} />
      <div className="example__run">
        <ol className="example__steps">
          {example.steps.map((s, i) => (
            <li key={i} className={i === step ? "is-current" : i < step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <InlineText text={s} />
            </li>
          ))}
        </ol>
        <div className="example__controls">
          <Button variant="secondary" size="small" onClick={() => setStep((s) => Math.min(s + 1, example.steps.length - 1))} disabled={step >= example.steps.length - 1}>
            {step < 0 ? "Step through it" : "Next step"}
          </Button>
          {step >= 0 && (
            <Button variant="ghost" size="small" onClick={() => setStep(-1)}>
              Reset
            </Button>
          )}
        </div>
        {step >= example.steps.length - 1 && <CodeBlock code={example.expectedOutput} label="Expected output" />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Assessment

function Assessment({ view, onDone }: { view: TopicView; onDone: () => void }) {
  const questions = view.topic.assessment?.questions ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Awaited<ReturnType<typeof atlas.submitAssessment>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { celebrate } = useRewards();
  const answered = Object.keys(answers).length;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const r = await atlas.submitAssessment(view.topic.id, answers);
      setResult(r);
      celebrate(r);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const byId = new Map(result.results.map((r) => [r.questionId, r]));
    return (
      <div className="assessment-result" role="status">
        <p className={`assessment-result__score ${result.passed ? "is-pass" : ""}`}>
          {result.correct} of {result.total} ({Math.round(result.score * 100)}%) · {result.passed ? "Passed" : `Needs ${Math.round((view.topic.assessment?.passingScore ?? 0.8) * 100)}% to pass`}
        </p>
        {result.weakObjectives.length > 0 && (
          <div className="callout">
            <strong>Practise next:</strong>
            <ul>
              {result.weakObjectives.map((o) => (
                <li key={o.index}>{o.text}</li>
              ))}
            </ul>
          </div>
        )}
        <ol className="assessment-review">
          {questions.map((q) => {
            const r = byId.get(q.id)!;
            return (
              <li key={q.id} className={r.correct ? "is-right" : "is-wrong"}>
                <p><InlineText text={q.prompt} /></p>
                <p className="muted">
                  {r.correct ? "✓ Your answer was right" : `✗ You chose ${r.chosen === null ? "nothing" : `"${q.choices[r.chosen]}"`}; the answer is "${q.choices[r.answerIndex]}"`}
                </p>
                <p><InlineText text={r.explanation} /></p>
              </li>
            );
          })}
        </ol>
        <Button variant="secondary" onClick={() => (setResult(null), setAnswers({}))}>Take it again</Button>
      </div>
    );
  }

  return (
    <form className="assessment" onSubmit={(e) => (e.preventDefault(), submit())}>
      {questions.map((q: PublicChoice, n) => (
        <fieldset key={q.id} className="choice">
          <legend className="choice__legend">
            <span className="eyebrow">Question {n + 1} of {questions.length}</span>
            <span className="choice__prompt"><InlineText text={q.prompt} /></span>
          </legend>
          {q.code && <CodeBlock code={q.code} />}
          <div className="choice__options">
            {q.choices.map((c, i) => (
              <label key={i} className="choice__option">
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
                <span><InlineText text={c} /></span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="assessment__submit">
        <span className="muted">{answered} of {questions.length} answered</span>
        <Button type="submit" disabled={busy || answered === 0}>{busy ? "Scoring…" : "Submit assessment"}</Button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  );
}

// ------------------------------------------------------------------ The page

const OUTLINE_NAV = [
  ["goals", "Goals"],
  ["practice", "Practise now"],
];
const FULL_NAV = [
  ["story", "The problem"],
  ["model", "Mental model"],
  ["lesson", "Lesson"],
  ["examples", "Worked examples"],
  ["lab", "Lab"],
  ["exercises", "Exercises"],
  ["mistakes", "Mistakes & myths"],
  ["assessment", "Assessment"],
  ["project", "Project"],
  ["interview", "Interview"],
  ["mastery", "Mastery"],
  ["references", "References"],
];

export function TopicStudioPage() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useLoad(() => atlas.topic(id), [id]);
  const { celebrate } = useRewards();

  const exerciseDone = useMemo(() => new Set(data?.progress.exercisesDone ?? []), [data]);

  if (loading && !data) return <Loading label="Opening the studio" />;
  if (error) return error.startsWith("No topic") ? <NotFoundPage what="topic" /> : <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { topic, domain } = data;
  const isOutline = topic.stage === "outline";
  const nav = isOutline ? OUTLINE_NAV : [...FULL_NAV, ...(data.versions.length ? [["changes", "What changed"]] : [])];
  const labExercise = topic.exercises.find((e) => e.kind === "lab");
  const latestVersion = data.versions[data.versions.length - 1];

  async function markRead() {
    try {
      celebrate(await atlas.markRead(topic.id));
      reload();
    } catch {
      // Reading is still shown; the server will be told next time.
    }
  }

  async function labGoal(detail: string) {
    if (!labExercise || labExercise.kind !== "lab") return;
    try {
      celebrate({ ...(await atlas.completeLab(topic.id, labExercise.lab, detail)), message: "Lab goal reached" });
      reload();
    } catch {
      // ignore: the lab still works locally
    }
  }

  return (
    <div className="studio" style={hueStyle(domain.hue)}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/map">World map</Link> <span aria-hidden="true">/</span> <Link to={`/map/${domain.id}`}>{domain.short}</Link> <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{topic.title}</span>
      </nav>

      <header className="studio__head">
        <Hex size={64} hue={domain.hue} fill={STATUS_FILL[data.status]} locked={data.status === "locked"} review={data.progress.reviewDue} />
        <div>
          <p className="eyebrow">
            {topic.difficulty} · {STATUS_LABEL[data.status]} · content v{data.contentVersion}
            {topic.capstone && " · ♛ capstone"}
          </p>
          <h1 className="page-title">{topic.title}</h1>
          <div className="studio__badges">
            {isOutline ? <Badge tone="soft">Outline: lesson not written yet</Badge> : <Badge tone="success">Full lesson · {data.completeness.passed}/18 parts</Badge>}
            {latestVersion && <Badge tone="review">Updated {formatDate(latestVersion.approvedAt)}</Badge>}
            {data.review && <Badge tone={data.progress.reviewDue ? "review" : "soft"}>Next review {relativeDays(data.review.dueAt)}</Badge>}
          </div>
        </div>
      </header>

      <div className="studio__layout">
        <nav className="studio__toc" aria-label="On this page">
          <p className="eyebrow">On this page</p>
          <ul>
            {nav.map(([anchor, label]) => (
              <li key={anchor}>
                <a href={`#${anchor}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="studio__content">
          {data.prerequisites.length > 0 && (
            <div className={`callout ${data.prerequisites.every((p) => p.met) ? "" : "callout--locked"}`}>
              <strong>Builds on:</strong>{" "}
              {data.prerequisites.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <Link to={`/topic/${p.id}`}>{p.title}</Link> {p.met ? "✓" : "(not yet)"}
                </span>
              ))}
              {!data.prerequisites.every((p) => p.met) && <span className="muted"> · You can still study this; it may just feel harder.</span>}
            </div>
          )}

          {isOutline ? (
            <>
              <section id="goals" className="studio__section">
                <h2 className="section-title">What this topic will teach</h2>
                <ul className="checklist">
                  {topic.learningObjectives.map((o) => <li key={o}>{o}</li>)}
                </ul>
                {topic.subtopics.length > 0 && <p className="muted">Covers: {topic.subtopics.join(" · ")}</p>}
                <p className="callout">
                  <strong>Honest status:</strong> this topic's full lesson, assessment and project are not written yet. It is listed in{" "}
                  <code className="inline-code">docs/curriculum/coverage-report.md</code> as backlog.
                </p>
              </section>
              <section id="practice" className="studio__section">
                <h2 className="section-title">Practise it by hand today</h2>
                {data.strikes.length === 0 ? (
                  <p className="muted">No hands-on strike covers this yet.</p>
                ) : (
                  <ul className="strike-links">
                    {data.strikes.map((s) => (
                      <li key={s.id}>
                        <Link to={`/strike/${s.id}`}>{s.title}</Link> <Badge tone={s.status === "complete" ? "success" : "soft"}>{s.status.replace("_", " ")}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <>
              <section id="story" className="studio__section">
                <h2 className="section-title">The problem</h2>
                <p className="story">{topic.story}</p>
                <h3 className="subhead">You will be able to…</h3>
                <ul className="checklist">
                  {topic.learningObjectives.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </section>

              <section id="model" className="studio__section">
                <h2 className="section-title">Mental model</h2>
                <p className="lead">{topic.mentalModel?.plain}</p>
                <div className="analogy">
                  <p><strong>Analogy.</strong> {topic.mentalModel?.analogy}</p>
                  <p className="muted"><strong>Where the analogy breaks.</strong> {topic.mentalModel?.analogyLimit}</p>
                </div>
              </section>

              <section id="lesson" className="studio__section">
                <h2 className="section-title">Lesson</h2>
                <LessonFlow view={data} onRead={markRead} />
              </section>

              <section id="examples" className="studio__section">
                <h2 className="section-title">Worked examples</h2>
                {topic.codeExamples.map((ex) => <WorkedExample key={ex.title} example={ex} />)}
                {topic.practicalApplication && (
                  <div className="callout">
                    <strong>In real work:</strong> <InlineText text={topic.practicalApplication} />
                  </div>
                )}
              </section>

              <section id="lab" className="studio__section">
                <h2 className="section-title">Lab</h2>
                {labExercise && labExercise.kind === "lab" && (
                  <p className="lab-task">
                    <strong>Task:</strong> {labExercise.task} <strong>Goal:</strong> {labExercise.goal}{" "}
                    {exerciseDone.has(`lab:${labExercise.lab}`) && <Badge tone="success">Goal reached before</Badge>}
                  </p>
                )}
                {topic.visualizationType !== "none" ? (
                  <LabHost kind={topic.visualizationType} onGoal={labGoal} />
                ) : (
                  <p className="muted">{topic.visualNote}</p>
                )}
              </section>

              <section id="exercises" className="studio__section">
                <h2 className="section-title">Exercises</h2>
                <p className="muted">Coding exercises open the hand-typing strike runner: starter code, tests and three hints. Solutions stay hidden until you have really tried.</p>
                <div className="exercise-list">
                  {topic.exercises.map((ex, i) => {
                    if (ex.kind === "strike") {
                      const strike = data.strikes.find((s) => s.id === ex.strikeId);
                      return (
                        <div key={i} className="exercise-card">
                          <p className="eyebrow">Type it by hand</p>
                          <p>
                            <Link to={`/strike/${ex.strikeId}`}>{strike?.title ?? ex.strikeId}</Link>{" "}
                            {exerciseDone.has(`strike:${ex.strikeId}`) && <Badge tone="success">Passed</Badge>}
                          </p>
                          <p className="muted">{ex.why}</p>
                        </div>
                      );
                    }
                    if (ex.kind === "predict" || ex.kind === "debug") {
                      return (
                        <ChoiceQuestion
                          key={i}
                          question={ex.question}
                          kindLabel={ex.kind === "predict" ? "Predict the output" : "Find the bug"}
                          alreadyDone={exerciseDone.has(`${ex.kind}:${ex.question.id}`)}
                          onCorrect={reload}
                        />
                      );
                    }
                    return (
                      <div key={i} className="exercise-card">
                        <p className="eyebrow">Lab exercise</p>
                        <p>{ex.kind === "lab" ? ex.goal : ""} <a href="#lab">Go to the lab ↑</a></p>
                      </div>
                    );
                  })}
                </div>
                {topic.knowledgeChecks.slice(1).map((q) => <ChoiceQuestion key={q.id} question={q} kindLabel="Quick check" />)}
              </section>

              <section id="mistakes" className="studio__section">
                <h2 className="section-title">Common mistakes</h2>
                <div className="mistakes">
                  {topic.commonMistakes.map((m) => (
                    <article key={m.mistake} className="mistake">
                      <h3 className="mistake__title">{m.mistake}</h3>
                      <p><strong>You'll see:</strong> {m.symptom}</p>
                      <p><strong>Fix:</strong> <InlineText text={m.fix} /></p>
                    </article>
                  ))}
                </div>
                <h3 className="subhead">Myths</h3>
                <dl className="myths">
                  {topic.misconceptions.map((m) => (
                    <div key={m.myth}>
                      <dt>✗ {m.myth}</dt>
                      <dd>✓ {m.truth}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section id="assessment" className="studio__section">
                <h2 className="section-title">Assessment</h2>
                <p className="muted">
                  Pass with {Math.round((topic.assessment?.passingScore ?? 0.8) * 100)}% to start spaced reviews.
                  {data.progress.bestAssessmentScore !== null && ` Your best so far: ${Math.round(data.progress.bestAssessmentScore * 100)}%.`}
                </p>
                <Assessment view={data} onDone={reload} />
              </section>

              <section id="project" className="studio__section">
                <h2 className="section-title">Project: {topic.project?.title}</h2>
                <p>{topic.project?.summary}</p>
                <h3 className="subhead">Acceptance criteria</h3>
                <ul className="checklist">
                  {topic.project?.acceptanceCriteria.map((c) => <li key={c}>{c}</li>)}
                </ul>
                {data.projects.length > 0 ? (
                  <p>
                    Your project{data.projects.length > 1 ? "s" : ""}:{" "}
                    {data.projects.map((p) => (
                      <Link key={p.id} to={`/projects/${p.id}`}>{p.title} ({p.status.replace("_", " ")})</Link>
                    ))}
                  </p>
                ) : (
                  <Link to={`/projects/new?topic=${topic.id}`} className="hh-button hh-button--secondary">Start this project in the Workshop</Link>
                )}
              </section>

              <section id="interview" className="studio__section">
                <h2 className="section-title">Interview questions</h2>
                <p className="muted">{topic.interviewQuestions.length} questions. Answer each in your own words first; the model answer appears after.</p>
                <ul className="question-preview">
                  {topic.interviewQuestions.slice(0, 4).map((q) => (
                    <li key={q.id}><Badge tone="soft">{q.kind}</Badge> <InlineText text={q.prompt} /></li>
                  ))}
                </ul>
                <Link to={`/interview?topic=${topic.id}`} className="hh-button hh-button--secondary">Practise these in the Interview Arena</Link>
              </section>

              <section id="mastery" className="studio__section">
                <h2 className="section-title">Mastery: the exact rules</h2>
                <ul className="mastery">
                  {data.mastery.map((m) => (
                    <li key={m.label} className={m.met ? "is-met" : ""}>
                      <span aria-hidden="true">{m.met ? "✓" : "○"}</span> <strong>{m.label}</strong> <span className="muted">{m.detail}</span>
                      <span className="visually-hidden">{m.met ? " (met)" : " (not met yet)"}</span>
                    </li>
                  ))}
                </ul>
                <p className="muted">Review gaps: {topic.reviewRules.intervalsDays.join(", ")} days. A missed review just comes back tomorrow; nothing is reset.</p>
              </section>

              <section id="references" className="studio__section">
                <h2 className="section-title">References</h2>
                <ul className="references">
                  {topic.references.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noreferrer noopener">{r.title}</a> <Badge tone="soft">{r.kind}</Badge>
                    </li>
                  ))}
                </ul>
                <div className="durability">
                  <p><strong>Timeless:</strong> {topic.timeless.join(" ")}</p>
                  {topic.versionSpecific.length > 0 && <p><strong>Changes with versions (the radar watches these):</strong> {topic.versionSpecific.join(" ")}</p>}
                  <p className="muted">Last checked for accuracy: {topic.lastReviewedAt}.</p>
                </div>
                {data.glossary.length > 0 && (
                  <p>
                    <strong>Glossary:</strong>{" "}
                    {data.glossary.map((g, i) => (
                      <span key={g.id}>{i > 0 && " · "}<Link to={`/glossary?term=${g.id}`}>{g.term}</Link></span>
                    ))}
                  </p>
                )}
              </section>

              {data.versions.length > 0 && (
                <section id="changes" className="studio__section">
                  <h2 className="section-title">What changed</h2>
                  {data.versions.map((v) => (
                    <article key={v.version} className="version">
                      <p className="eyebrow">Version {v.previousVersion} → {v.version} · approved {formatDate(v.approvedAt)}</p>
                      <h3 className="subhead">{String(v.addendum.title ?? v.changeReason)}</h3>
                      <dl className="version__facts">
                        {v.addendum.whatChanged && (<><dt>What changed</dt><dd>{String(v.addendum.whatChanged)}</dd></>)}
                        {v.addendum.whyChanged && (<><dt>Why</dt><dd>{String(v.addendum.whyChanged)}</dd></>)}
                        {v.addendum.before && (<><dt>Before</dt><dd>{String(v.addendum.before)}</dd></>)}
                        {v.addendum.now && (<><dt>Now</dt><dd>{String(v.addendum.now)}</dd></>)}
                        {v.addendum.exercise && (<><dt>Migration exercise</dt><dd>{String(v.addendum.exercise)}</dd></>)}
                      </dl>
                      {v.migrationNotes && <p className="muted">{v.migrationNotes}</p>}
                      <p>Sources: {v.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a>)}</p>
                    </article>
                  ))}
                  <p className="muted">Your progress on this topic is kept across versions.</p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
