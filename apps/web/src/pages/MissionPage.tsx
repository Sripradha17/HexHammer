// A MISSION: one topic, experienced as six steps. Only the current step is on screen; the others
// wait as a compact path at the top.
//
//   DISCOVER  the problem, in a short scenario, plus a one-line mental model and a briefing
//             (the lesson, one small card at a time)
//   SEE       the idea moving: the live scene and the worked examples, stepped
//   TRY       the interactive lab, with a clear goal
//   SOLVE     small challenges, one at a time (predict, debug, hand-typed code)
//   PROVE     the assessment, one question at a time
//   UNLOCK    what I really earned: mastery rules met, the build, the next mission
//
// The current step lives in the URL hash (#see, #prove...) so reloads and links keep it.
// Answers are always checked by the server; the browser never holds them.
import { useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { atlas, type PublicChoice, type Region, type TopicView } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { ChoiceQuestion } from "../components/ChoiceQuestion";
import { CodeBlock, InlineText, RichText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { Icon } from "../components/Icon";
import { LabHost } from "../labs/LabHost";
import { hasPipeline, MissionScene } from "../components/MissionScene";
import { NotFoundPage } from "./NotFoundPage";
import { missionNumber } from "../map/regionState";
import { formatDate, relativeDays } from "../labels";

type StepId = "discover" | "see" | "try" | "solve" | "prove" | "unlock";
const STEPS: { id: StepId; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "see", label: "See" },
  { id: "try", label: "Try" },
  { id: "solve", label: "Solve" },
  { id: "prove", label: "Prove" },
  { id: "unlock", label: "Unlock" },
];

// Old links (#lesson, #assessment...) still land on the right step.
const OLD_ANCHORS: Record<string, StepId> = {
  understand: "discover", story: "discover", model: "discover", lesson: "discover",
  examples: "see", lab: "try", experiment: "try", exercises: "solve", practise: "solve", mistakes: "solve",
  assessment: "prove", project: "unlock", interview: "unlock", mastery: "unlock", references: "unlock", changes: "unlock", apply: "unlock",
};
function stepFromHash(hash: string): StepId | null {
  const id = hash.replace("#", "");
  return (STEPS.find((s) => s.id === id)?.id ?? OLD_ANCHORS[id]) || null;
}

// Which steps are really done, judged only from what the server recorded.
function doneSteps(view: TopicView): Set<StepId> {
  const done = new Set<StepId>();
  const ex = new Set(view.progress.exercisesDone);
  const lab = view.topic.exercises.find((e) => e.kind === "lab");
  const practice = view.progress.exerciseKeys.filter((k) => !k.startsWith("lab:"));
  const passing = view.topic.assessment?.passingScore ?? 0.8;
  if (view.progress.lessonRead) done.add("discover");
  if (lab && lab.kind === "lab" && ex.has(`lab:${lab.lab}`)) done.add("try");
  if (practice.length > 0 && practice.every((k) => ex.has(k))) done.add("solve");
  if (view.progress.bestAssessmentScore !== null && view.progress.bestAssessmentScore >= passing) done.add("prove");
  if (view.status === "mastered") done.add("unlock");
  return done;
}

// Where to open when the URL names no step: the first thing not yet done.
function firstOpenStep(view: TopicView, done: Set<StepId>): StepId {
  if (!done.has("discover")) return "discover";
  if (!done.has("solve") && view.progress.exerciseKeys.length > 0) return "solve";
  if (!done.has("prove")) return "prove";
  return "unlock";
}

// ================================================================== DISCOVER

function Briefing({ view, onRead }: { view: TopicView; onRead: () => void }) {
  const sections = view.topic.lessonSections;
  const [at, setAt] = useState(0);
  const [reported, setReported] = useState(view.progress.lessonRead);
  const section = sections[at];

  function go(n: number) {
    setAt(n);
    // Reaching the last card counts as reading the lesson (the server records it once).
    if (n === sections.length - 1 && !reported) {
      setReported(true);
      onRead();
    }
  }

  return (
    <div className="briefing">
      <div className="briefing__dots" role="tablist" aria-label="Briefing cards">
        {sections.map((s, i) => (
          <button key={s.heading} type="button" role="tab" aria-selected={i === at} aria-label={`Card ${i + 1}: ${s.heading}`} className={`briefing__dot ${i < at || reported ? "is-seen" : ""}`} onClick={() => go(i)} />
        ))}
      </div>
      <article className="briefing__card" key={at} role="tabpanel">
        <p className="briefing__n">
          Card {at + 1} of {sections.length}
        </p>
        <h3 className="briefing__title">{section.heading}</h3>
        <RichText text={section.body} />
        {/* A quick check after the second card, so reading is never passive. */}
        {at === 1 && view.topic.knowledgeChecks[0] && <ChoiceQuestion question={view.topic.knowledgeChecks[0]} kindLabel="Quick check" />}
      </article>
      <div className="briefing__nav">
        <button type="button" className="cta cta--ghost cta--small" disabled={at === 0} onClick={() => go(at - 1)}>
          <Icon name="back" size={16} /> Back
        </button>
        {at < sections.length - 1 ? (
          <button type="button" className="cta cta--small" onClick={() => go(at + 1)}>
            Next card <Icon name="arrow" size={16} />
          </button>
        ) : (
          <span className="pill pill--green">
            <Icon name="check" size={14} /> Briefing complete
          </span>
        )}
      </div>
    </div>
  );
}

function Discover({ view, onRead }: { view: TopicView; onRead: () => void }) {
  const { topic } = view;
  return (
    <div className="step-grid">
      <div className="scenario">
        <p className="kicker kicker--amber">The situation</p>
        <p className="scenario__text">{topic.story}</p>
        {topic.mentalModel && (
          <div className="model">
            <p className="model__label">Think of it like this</p>
            <p className="model__plain">{topic.mentalModel.plain}</p>
            <details className="more">
              <summary>An analogy (and where it breaks)</summary>
              <p>{topic.mentalModel.analogy}</p>
              <p className="muted">{topic.mentalModel.analogyLimit}</p>
            </details>
          </div>
        )}
        <details className="more">
          <summary>After this mission you can…</summary>
          <ul className="goals">
            {topic.learningObjectives.map((o) => (
              <li key={o}>
                <Icon name="check" size={14} /> {o}
              </li>
            ))}
          </ul>
        </details>
        {view.prerequisites.some((p) => !p.met) && (
          <p className="muted small">
            Builds on{" "}
            {view.prerequisites.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ", "}
                <Link to={`/topic/${p.id}`}>{p.title}</Link>
                {p.met ? " ✓" : ""}
              </span>
            ))}
            . You can still go ahead.
          </p>
        )}
      </div>
      <Briefing view={view} onRead={onRead} />
    </div>
  );
}

// ================================================================== SEE

function WorkedExample({ example }: { example: TopicView["topic"]["codeExamples"][number] }) {
  const [step, setStep] = useState(-1);
  const last = example.steps.length - 1;
  return (
    <div className="example">
      <div className="example__code">
        <CodeBlock code={example.code} label={`${example.title} · ${example.language.toUpperCase()}`} />
        {step >= last && <CodeBlock code={example.expectedOutput} label="Output" />}
      </div>
      <div className="example__steps">
        <ol>
          {example.steps.map((s, i) => (
            <li key={i} className={i === step ? "is-current" : i < step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <InlineText text={s} />
            </li>
          ))}
        </ol>
        <div className="example__nav">
          <button type="button" className="cta cta--small" onClick={() => setStep((s) => Math.min(s + 1, last))} disabled={step >= last}>
            <Icon name="play" size={14} /> {step < 0 ? "Run it step by step" : step >= last ? "Finished" : "Next step"}
          </button>
          {step >= 0 && (
            <button type="button" className="cta cta--ghost cta--small" onClick={() => setStep(-1)}>
              Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function See({ view, region }: { view: TopicView; region: Region | null }) {
  const { topic } = view;
  const [which, setWhich] = useState(0);
  const showScene = topic.visualizationType === "binary" || hasPipeline(topic.visualizationType);
  return (
    <div className="see">
      {showScene && (
        <div className="stage-box">
          <MissionScene kind={topic.visualizationType} region={region} />
        </div>
      )}
      {topic.codeExamples.length > 0 && (
        <div className="stage-box">
          {topic.codeExamples.length > 1 && (
            <div className="tabs" role="tablist" aria-label="Worked examples">
              {topic.codeExamples.map((ex, i) => (
                <button key={ex.title} type="button" role="tab" aria-selected={i === which} className="tabs__tab" onClick={() => setWhich(i)}>
                  {ex.title}
                </button>
              ))}
            </div>
          )}
          <WorkedExample key={which} example={topic.codeExamples[which]} />
        </div>
      )}
      {topic.practicalApplication && (
        <details className="more">
          <summary>Where you meet this in real work</summary>
          <p>
            <InlineText text={topic.practicalApplication} />
          </p>
        </details>
      )}
    </div>
  );
}

// ================================================================== TRY

function Try({ view, onGoal }: { view: TopicView; onGoal: (detail: string) => void }) {
  const { topic } = view;
  const lab = topic.exercises.find((e) => e.kind === "lab");
  const reached = lab && lab.kind === "lab" && view.progress.exercisesDone.includes(`lab:${lab.lab}`);
  if (topic.visualizationType === "none") {
    return (
      <div className="stage-box">
        <p className="kicker">No lab for this one</p>
        <p>{topic.visualNote}</p>
      </div>
    );
  }
  return (
    <div className="try">
      {lab && lab.kind === "lab" && (
        <div className={`goal ${reached ? "is-reached" : ""}`}>
          <span className="goal__icon" aria-hidden="true">
            <Icon name={reached ? "check" : "spark"} size={20} />
          </span>
          <div>
            <p className="goal__task">{lab.task}</p>
            <p className="goal__goal">
              <strong>Goal:</strong> {lab.goal} {reached && <span className="pill pill--green">Reached</span>}
            </p>
          </div>
        </div>
      )}
      <div className="stage-box stage-box--lab">
        <LabHost kind={topic.visualizationType} onGoal={onGoal} />
      </div>
    </div>
  );
}

// ================================================================== SOLVE

function Solve({ view, onChanged, goTry }: { view: TopicView; onChanged: () => void; goTry: () => void }) {
  const { topic } = view;
  const done = new Set(view.progress.exercisesDone);
  // Every challenge, in order: the exercises, then the remaining quick checks.
  const items = [
    ...topic.exercises.map((ex) => ({ kind: "exercise" as const, ex })),
    ...topic.knowledgeChecks.slice(1).map((q) => ({ kind: "check" as const, q })),
  ];
  const isDone = (i: number) => {
    const it = items[i];
    if (it.kind === "check") return false;
    const ex = it.ex;
    if (ex.kind === "strike") return done.has(`strike:${ex.strikeId}`);
    if (ex.kind === "lab") return done.has(`lab:${ex.lab}`);
    return done.has(`${ex.kind}:${ex.question.id}`);
  };
  const firstOpen = items.findIndex((_, i) => !isDone(i));
  const [at, setAt] = useState(firstOpen < 0 ? 0 : firstOpen);
  const item = items[at];
  if (!item) return <p className="muted">No challenges in this mission yet.</p>;

  let body;
  if (item.kind === "check") {
    body = <ChoiceQuestion key={item.q.id} question={item.q} kindLabel="Quick check" />;
  } else if (item.ex.kind === "strike") {
    const ex = item.ex;
    const strike = view.strikes.find((s) => s.id === ex.strikeId);
    body = (
      <div className="bay-card">
        <span className="bay-card__icon" aria-hidden="true">
          <Icon name="code" size={26} />
        </span>
        <div>
          <p className="kicker">Hand-typed code · tests · 3 hints</p>
          <h3 className="bay-card__title">{strike?.title ?? ex.strikeId}</h3>
          <p className="muted">{ex.why}</p>
          <Link to={`/strike/${ex.strikeId}?mission=${topic.id}`} className="cta cta--small">
            <Icon name="terminal" size={16} /> {isDone(at) ? "Open again" : "Open the code bay"}
          </Link>
        </div>
      </div>
    );
  } else if (item.ex.kind === "lab") {
    body = (
      <div className="bay-card">
        <span className="bay-card__icon" aria-hidden="true">
          <Icon name="spark" size={26} />
        </span>
        <div>
          <p className="kicker">Lab challenge</p>
          <h3 className="bay-card__title">{item.ex.goal}</h3>
          <button type="button" className="cta cta--small" onClick={goTry}>
            Go to the lab
          </button>
        </div>
      </div>
    );
  } else {
    body = <ChoiceQuestion key={item.ex.question.id} question={item.ex.question} kindLabel={item.ex.kind === "predict" ? "Predict the output" : "Find the bug"} alreadyDone={isDone(at)} onCorrect={onChanged} />;
  }

  return (
    <div className="solve">
      <ol className="solve__dots" aria-label="Challenges">
        {items.map((_, i) => (
          <li key={i}>
            <button type="button" className={`solve__dot ${i === at ? "is-current" : ""} ${isDone(i) ? "is-done" : ""}`} aria-current={i === at ? "step" : undefined} onClick={() => setAt(i)}>
              {isDone(i) ? <Icon name="check" size={13} /> : i + 1}
              <span className="visually-hidden">Challenge {i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="stage-box challenge-box" key={at}>
        {body}
      </div>
      <div className="briefing__nav">
        <button type="button" className="cta cta--ghost cta--small" disabled={at === 0} onClick={() => setAt(at - 1)}>
          <Icon name="back" size={16} /> Previous
        </button>
        <button type="button" className="cta cta--ghost cta--small" disabled={at >= items.length - 1} onClick={() => setAt(at + 1)}>
          Next challenge <Icon name="arrow" size={16} />
        </button>
      </div>
      {topic.commonMistakes.length > 0 && (
        <details className="more">
          <summary>Stuck? Common mistakes and myths</summary>
          <ul className="mistakes">
            {topic.commonMistakes.map((m) => (
              <li key={m.mistake}>
                <strong>{m.mistake}</strong>
                <span>You'll see: {m.symptom}</span>
                <span>
                  Fix: <InlineText text={m.fix} />
                </span>
              </li>
            ))}
            {topic.misconceptions.map((m) => (
              <li key={m.myth}>
                <strong>Myth: {m.myth}</strong>
                <span>Truth: {m.truth}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ================================================================== PROVE

type AssessmentResult = Awaited<ReturnType<typeof atlas.submitAssessment>>;

function Prove({ view, onDone }: { view: TopicView; onDone: () => void }) {
  const questions = view.topic.assessment?.questions ?? [];
  const passing = view.topic.assessment?.passingScore ?? 0.8;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [at, setAt] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
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

  if (questions.length === 0) return <p className="muted">This mission has no assessment yet.</p>;

  if (result) {
    const byId = new Map(result.results.map((r) => [r.questionId, r]));
    const pct = Math.round(result.score * 100);
    return (
      <div className="result" role="status">
        <div className={`score ${result.passed ? "is-pass burst" : ""}`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="score__track" />
            <circle cx="60" cy="60" r="52" className="score__fill" style={{ strokeDasharray: `${result.score * 326.7} 326.7` }} transform="rotate(-90 60 60)" />
          </svg>
          <span className="score__n">{pct}%</span>
        </div>
        <h3 className="result__title">{result.passed ? "Proven." : "Not yet. That's useful."}</h3>
        <p className="muted">
          {result.correct} of {result.total} right · pass mark {Math.round(passing * 100)}%{result.passed && result.firstPass ? " · reviews start now" : ""}
        </p>
        {result.weakObjectives.length > 0 && (
          <div className="weak">
            <strong>Practise next:</strong>
            <ul>
              {result.weakObjectives.map((o) => (
                <li key={o.index}>{o.text}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="home__actions">
          <button type="button" className="cta cta--ghost cta--small" onClick={() => (setResult(null), setAnswers({}), setAt(0))}>
            Take it again
          </button>
        </div>
        <details className="more">
          <summary>Review every answer</summary>
          <ol className="review-list">
            {questions.map((q) => {
              const r = byId.get(q.id)!;
              return (
                <li key={q.id} className={r.correct ? "is-right" : "is-wrong"}>
                  <p>
                    <InlineText text={q.prompt} />
                  </p>
                  <p className="muted">
                    {r.correct ? "✓ Right" : `✗ You chose ${r.chosen === null ? "nothing" : `"${q.choices[r.chosen]}"`}; the answer is "${q.choices[r.answerIndex]}"`}
                  </p>
                  <p>
                    <InlineText text={r.explanation} />
                  </p>
                </li>
              );
            })}
          </ol>
        </details>
      </div>
    );
  }

  const q: PublicChoice = questions[at];
  return (
    <form className="quiz" onSubmit={(e) => (e.preventDefault(), submit())}>
      <div className="quiz__top">
        <span>
          Question {at + 1} of {questions.length}
        </span>
        <div className="meter quiz__meter" aria-hidden="true">
          <span style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
        <span className="muted">Pass: {Math.round(passing * 100)}%</span>
      </div>
      <fieldset className="quiz__q stage-box" key={q.id}>
        <legend className="quiz__prompt">
          <InlineText text={q.prompt} />
        </legend>
        {q.code && <CodeBlock code={q.code} />}
        <div className="quiz__options">
          {q.choices.map((c, i) => (
            <label key={i} className={`quiz__option ${answers[q.id] === i ? "is-picked" : ""}`}>
              <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
              <span className="quiz__letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span>
                <InlineText text={c} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="briefing__nav">
        <button type="button" className="cta cta--ghost cta--small" disabled={at === 0} onClick={() => setAt(at - 1)}>
          <Icon name="back" size={16} /> Back
        </button>
        {at < questions.length - 1 ? (
          // Different keys on purpose: without them React would turn THIS button into the submit
          // button during the click, and the browser would then submit the form early.
          <button key="next" type="button" className="cta cta--small" disabled={answers[q.id] === undefined} onClick={() => setAt(at + 1)}>
            Next question <Icon name="arrow" size={16} />
          </button>
        ) : (
          <button key="submit" type="submit" className="cta" disabled={busy || answered === 0}>
            {busy ? "Scoring…" : `Submit ${answered}/${questions.length} answers`}
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// ================================================================== UNLOCK

function Unlock({ view, nextMission }: { view: TopicView; nextMission: { id: string; title: string } | null }) {
  const { topic } = view;
  const met = view.mastery.filter((m) => m.met).length;
  const mastered = view.status === "mastered";
  return (
    <div className="unlock">
      <div className={`unlock__crest ${mastered ? "is-mastered burst" : ""}`}>
        <svg viewBox="0 0 120 136" aria-hidden="true">
          <polygon points="60,4 114,35 114,101 60,132 6,101 6,35" className="crest__shape" />
          <polygon points="60,4 114,35 114,101 60,132 6,101 6,35" className="crest__fill" style={{ clipPath: `inset(${100 - (met / view.mastery.length) * 100}% 0 0 0)` }} />
        </svg>
        <span className="unlock__count">
          {met}/{view.mastery.length}
        </span>
      </div>
      <div className="unlock__body">
        <p className="kicker kicker--amber">{mastered ? "Mastered" : "Mastery progress"}</p>
        <h3 className="unlock__title">{mastered ? "This skill is yours." : `${view.mastery.length - met} rule${view.mastery.length - met === 1 ? "" : "s"} left to master it`}</h3>
        <ul className="seals">
          {view.mastery.map((m) => (
            <li key={m.label} className={m.met ? "is-met" : ""}>
              <span className="seals__mark" aria-hidden="true">
                {m.met ? <Icon name="check" size={14} /> : null}
              </span>
              <span>
                <strong>{m.label}</strong> <span className="muted">{m.detail}</span>
                <span className="visually-hidden">{m.met ? " (met)" : " (not met yet)"}</span>
              </span>
            </li>
          ))}
        </ul>
        {view.review && (
          <p className="muted small">
            Next spaced review {relativeDays(view.review.dueAt)}. Gaps: {topic.reviewRules.intervalsDays.join(", ")} days.
          </p>
        )}
        <div className="home__actions">
          {nextMission && (
            <Link to={`/topic/${nextMission.id}`} className="cta">
              Next mission <Icon name="arrow" size={17} />
            </Link>
          )}
          {!nextMission && (
            <Link to="/map" className="cta">
              <Icon name="map" size={17} /> Return to world
            </Link>
          )}
          {view.projects.length > 0 ? (
            <Link to={`/projects/${view.projects[0].id}`} className="cta cta--ghost cta--small">
              <Icon name="workshop" size={16} /> Resume build
            </Link>
          ) : topic.project ? (
            <Link to={`/projects?start=${topic.id}`} className="cta cta--ghost cta--small">
              <Icon name="workshop" size={16} /> Build: {topic.project.title}
            </Link>
          ) : null}
          {topic.interviewQuestions.length > 0 && (
            <Link to={`/interview?topic=${topic.id}`} className="cta cta--ghost cta--small">
              <Icon name="interview" size={16} /> Challenge mode
            </Link>
          )}
        </div>
        {nextMission && <p className="muted small">Up next: {nextMission.title}</p>}
        <details className="more">
          <summary>Sources, glossary and version history</summary>
          <ul className="refs">
            {topic.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer noopener">
                  {r.title}
                </a>{" "}
                <span className="pill">{r.kind}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            Timeless: {topic.timeless.join(" ")} {topic.versionSpecific.length > 0 && `Changes with versions: ${topic.versionSpecific.join(" ")}`} Last checked {topic.lastReviewedAt}.
          </p>
          {view.glossary.length > 0 && (
            <p className="small">
              Terms:{" "}
              {view.glossary.map((g, i) => (
                <span key={g.id}>
                  {i > 0 && " · "}
                  <Link to={`/glossary?term=${g.id}`}>{g.term}</Link>
                </span>
              ))}
            </p>
          )}
          {view.versions.map((v) => (
            <p key={v.version} className="small">
              <strong>
                v{v.previousVersion} → v{v.version} ({formatDate(v.approvedAt)}):
              </strong>{" "}
              {String(v.addendum.whatChanged ?? v.changeReason)}
              {v.addendum.now && <> Now: {String(v.addendum.now)}</>}
            </p>
          ))}
        </details>
      </div>
    </div>
  );
}

// ================================================================== Outline topics

function OutlineMission({ view }: { view: TopicView }) {
  return (
    <div className="step-grid">
      <div className="scenario">
        <p className="kicker kicker--amber">Lesson not written yet</p>
        <p className="scenario__text">This mission's full lesson, lab and assessment are still being written. Here is what it will teach.</p>
        <ul className="goals">
          {view.topic.learningObjectives.map((o) => (
            <li key={o}>
              <Icon name="check" size={14} /> {o}
            </li>
          ))}
        </ul>
      </div>
      <div className="stage-box">
        <p className="kicker">Practise it by hand today</p>
        {view.strikes.length === 0 ? (
          <p className="muted">No hands-on strike covers this yet.</p>
        ) : (
          <ul className="strike-list">
            {view.strikes.map((s) => (
              <li key={s.id}>
                <Link to={`/strike/${s.id}?mission=${view.topic.id}`} className="mrow">
                  <span className={`mrow__dot ${s.status === "complete" ? "is-done" : "is-available"}`} aria-hidden="true">
                    <Icon name={s.status === "complete" ? "check" : "code"} size={13} />
                  </span>
                  <span className="mrow__title">{s.title}</span>
                  <span className="mrow__state">{s.status.replace("_", " ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ================================================================== The page

export function MissionPage() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.topic(id), atlas.map()]), [id]);
  const { celebrate } = useRewards();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading && !data) return <Loading label="Entering the mission" />;
  if (error) return error.startsWith("No topic") ? <NotFoundPage what="mission" /> : <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [view, map] = data;
  const { topic, domain } = view;
  const region = map.regions.find((r) => r.id === domain.id) ?? null;
  const number = region ? missionNumber(region, topic.id) : null;
  const done = doneSteps(view);
  const step = stepFromHash(location.hash) ?? firstOpenStep(view, done);
  const index = STEPS.findIndex((s) => s.id === step);

  // The next mission after this one: another written, open, not-yet-passed mission in this region.
  const nextMission =
    region?.modules
      .flatMap((m) => m.topics)
      .find((t) => t.id !== topic.id && t.stage === "complete" && !["locked", "assessed", "mastered"].includes(t.status)) ?? null;

  function goTo(next: StepId) {
    navigate({ hash: next }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function markRead() {
    try {
      celebrate(await atlas.markRead(topic.id));
      reload();
    } catch {
      // The briefing still shows; the server hears next time.
    }
  }
  async function labGoal(detail: string) {
    const lab = topic.exercises.find((e) => e.kind === "lab");
    if (!lab || lab.kind !== "lab") return;
    try {
      celebrate({ ...(await atlas.completeLab(topic.id, lab.lab, detail)), message: "Lab goal reached" });
      reload();
    } catch {
      // the lab keeps working locally
    }
  }

  const isOutline = topic.stage === "outline";
  return (
    <div className="mission" style={{ "--hue": domain.hue } as CSSProperties}>
      <header className="mission__head">
        <Link to={`/map/${domain.id}`} className="mission__back">
          <Icon name="back" size={16} /> {domain.short}
        </Link>
        <p className="kicker">
          Mission {number} · {topic.difficulty}
          {topic.capstone && <span className="pill pill--amber">Boss mission</span>}
          {view.progress.reviewDue && <span className="pill pill--violet">Review due</span>}
        </p>
        <h1 className="mission__title">{topic.title}</h1>
        {!isOutline && (
          <nav aria-label="Mission steps">
            <ol className="path">
              {STEPS.map((s, i) => (
                <li key={s.id} className={done.has(s.id) ? "is-done" : ""}>
                  <button type="button" className="path__step" aria-current={s.id === step ? "step" : undefined} onClick={() => goTo(s.id)}>
                    <span className="path__dot" aria-hidden="true">
                      {done.has(s.id) ? <Icon name="check" size={14} /> : i + 1}
                    </span>
                    {s.label}
                    {done.has(s.id) && <span className="visually-hidden"> (done)</span>}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </header>

      <section className="mission__step" key={isOutline ? "outline" : step} aria-label={isOutline ? "Mission" : STEPS[index].label}>
        {isOutline ? (
          <OutlineMission view={view} />
        ) : (
          <>
            {step === "discover" && <Discover view={view} onRead={markRead} />}
            {step === "see" && <See view={view} region={region} />}
            {step === "try" && <Try view={view} onGoal={labGoal} />}
            {step === "solve" && <Solve view={view} onChanged={reload} goTry={() => goTo("try")} />}
            {step === "prove" && <Prove view={view} onDone={reload} />}
            {step === "unlock" && <Unlock view={view} nextMission={nextMission} />}
          </>
        )}
      </section>

      {!isOutline && index < STEPS.length - 1 && (
        <footer className="mission__foot">
          <button type="button" className="cta cta--ghost cta--small" onClick={() => goTo(STEPS[index + 1].id)}>
            Continue to {STEPS[index + 1].label} <Icon name="arrow" size={16} />
          </button>
        </footer>
      )}
    </div>
  );
}
