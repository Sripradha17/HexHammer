// CHALLENGE: interview practice as a focused game mode.
//
//   1. Pick a mode (Coding, Algorithms, SQL, Debugging, System design, Explain it, Behavioral).
//      Each mode tile shows my REAL record in it: how many I've answered and how many I nailed.
//   2. One challenge at a time fills the arena. I commit an answer in my own words first;
//      only then the model answer, the key points and the follow-ups are revealed.
//   3. I rate myself honestly. That schedules the question for spaced review.
//
// Search and filters are still here, tucked into "Browse all", so they never take over.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { atlas, type BankQuestion, type Reveal } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { CodeBlock, InlineText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { Icon, type IconName } from "../components/Icon";
import { relativeDays } from "../labels";

// The modes, and which questions belong to each (by question kind, tag or region).
interface Mode {
  id: string;
  label: string;
  icon: IconName;
  blurb: string;
  match: (q: BankQuestion) => boolean;
}
const ALGO_TAGS = ["big-o", "sorting", "search", "arrays", "data-structures", "amortised", "space"];
const MODES: Mode[] = [
  { id: "due", label: "Due today", icon: "reviews", blurb: "Spaced reviews waiting", match: (q) => Boolean(q.dueAt && new Date(q.dueAt) <= new Date()) },
  { id: "coding", label: "Coding", icon: "code", blurb: "Read and write code", match: (q) => q.kind === "implementation" || q.kind === "code-reading" },
  { id: "algorithms", label: "Algorithms", icon: "analytics", blurb: "Big-O and data structures", match: (q) => q.tags.some((t) => ALGO_TAGS.includes(t)) },
  { id: "sql", label: "SQL", icon: "glossary", blurb: "Queries, joins, data", match: (q) => q.domainId === "db" || q.tags.some((t) => ["sql", "joins", "aggregation", "databases"].includes(t)) },
  { id: "debugging", label: "Debugging", icon: "test", blurb: "Find what's broken", match: (q) => q.kind === "debugging" },
  { id: "design", label: "System design", icon: "map", blurb: "Trade-offs and scale", match: (q) => q.kind === "design" || q.kind === "scenario" },
  { id: "explain", label: "Explain it", icon: "interview", blurb: "Concepts out loud", match: (q) => q.kind === "concept" || q.kind === "misconception" },
  { id: "behavioral", label: "Behavioral", icon: "trophy", blurb: "Stories from real work", match: (q) => q.kind === "behavioral" },
];

// The next question to face: due first, then never answered, then the ones I got wrong.
function pickNext(pool: BankQuestion[], skip: Set<string>) {
  const open = pool.filter((q) => !skip.has(q.id));
  const rank = (q: BankQuestion) => (q.dueAt && new Date(q.dueAt) <= new Date() ? 0 : !q.stats ? 1 : q.stats.last === "missed" ? 2 : q.stats.last === "partial" ? 3 : 4);
  return [...open].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

function Arena({ question, onNext, onRated }: { question: BankQuestion; onNext: () => void; onRated: () => void }) {
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [hit, setHit] = useState<string[]>([]);
  const [rated, setRated] = useState("");
  const [error, setError] = useState("");
  const { celebrate } = useRewards();

  async function commit() {
    try {
      setReveal(await atlas.answerInterview(question.id, answer, confidence));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function rate(rating: string) {
    if (!reveal) return;
    try {
      const r = await atlas.rateAttempt(reveal.attemptId, rating, hit);
      celebrate(r);
      setRated(`Saved. It comes back ${relativeDays(r.nextDueAt)}.`);
      onRated();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <article className="arena glass" aria-labelledby="arena-q">
      <p className="arena__meta">
        <span className="pill pill--cyan">{question.kind}</span>
        <span className="pill">{question.difficulty}</span>
        <Link to={`/topic/${question.topicId}`} className="arena__topic">
          {question.topicTitle}
        </Link>
        {question.stats && (
          <span className="pill">
            last: {question.stats.last} · {question.stats.attempts}×
          </span>
        )}
      </p>
      <h2 id="arena-q" className="arena__q">
        <InlineText text={question.prompt} />
      </h2>
      {question.code && <CodeBlock code={question.code} />}

      {!reveal ? (
        <div className="arena__answer">
          <label className="finish__field">
            <span>
              Your answer · say it out loud, then type it · aim for about {question.expectedCount} key points
            </span>
            <textarea className="hh-textarea arena__text" rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <div className="arena__commit">
            <div className="confid" role="radiogroup" aria-label="Confidence before revealing">
              <span className="muted small">Confidence</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={confidence === n} className="confid__n" onClick={() => setConfidence(n)}>
                  {n}
                </button>
              ))}
            </div>
            <button type="button" className="cta cta--small" onClick={commit} disabled={answer.trim().length < 20}>
              <Icon name="check" size={15} /> Commit answer
            </button>
          </div>
          {answer.trim().length < 20 && <p className="muted small">Write a sentence or two first. The reveal is earned.</p>}
        </div>
      ) : (
        <div className="arena__reveal">
          <div className="arena__cols">
            <div>
              <p className="kicker">Which points did you hit?</p>
              <ul className="checks">
                {reveal.expectedElements.map((e) => (
                  <li key={e}>
                    <label className={`checks__item ${hit.includes(e) ? "is-done" : ""}`}>
                      <input type="checkbox" checked={hit.includes(e)} onChange={() => setHit(hit.includes(e) ? hit.filter((x) => x !== e) : [...hit, e])} />
                      <span className="checks__box" aria-hidden="true">
                        {hit.includes(e) && <Icon name="check" size={13} />}
                      </span>
                      {e}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker kicker--amber">Model answer</p>
              <p>{reveal.modelAnswer}</p>
              <details className="more">
                <summary>Why · common wrong answers · follow-ups</summary>
                <p>{reveal.explanation}</p>
                {reveal.commonWrongAnswers.length > 0 && <p className="small">Wrong turns: {reveal.commonWrongAnswers.join(" · ")}</p>}
                {reveal.followUps.length > 0 && <p className="small">Next they may ask: {reveal.followUps.join(" · ")}</p>}
              </details>
              <details className="more">
                <summary>Your answer</summary>
                <p className="arena__mine">{answer}</p>
              </details>
            </div>
          </div>
          {rated ? (
            <div className="arena__commit">
              <p role="status" className="pill pill--green">
                {rated}
              </p>
              <button type="button" className="cta cta--small" onClick={onNext}>
                Next challenge <Icon name="arrow" size={15} />
              </button>
            </div>
          ) : (
            <div className="rate" role="group" aria-label="Rate yourself honestly">
              <button type="button" className="rate__btn is-miss" onClick={() => rate("missed")}>
                Missed it
              </button>
              <button type="button" className="rate__btn is-part" onClick={() => rate("partial")}>
                Partly · {hit.length}/{reveal.expectedElements.length}
              </button>
              <button type="button" className="rate__btn is-nail" onClick={() => rate("nailed")}>
                Nailed it
              </button>
            </div>
          )}
        </div>
      )}
      {!reveal && (
        <button type="button" className="arena__skip" onClick={onNext}>
          Skip this one
        </button>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

export function ChallengePage() {
  const [params, setParams] = useSearchParams();
  const { data, error, loading, reload } = useLoad(() => atlas.interviewBank());
  const [modeId, setModeId] = useState<string>(params.get("topic") ? "topic" : "explain");
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const topicFilter = params.get("topic");

  const questions = useMemo(() => data?.questions ?? [], [data]);
  const mode = MODES.find((m) => m.id === modeId);
  const pool = useMemo(() => (modeId === "topic" ? questions.filter((q) => q.topicId === topicFilter) : questions.filter((q) => mode?.match(q))), [questions, modeId, mode, topicFilter]);

  if (loading && !data) return <Loading label="Opening the arena" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const current = pool.find((q) => q.id === chosenId) ?? pickNext(pool, skipped);
  const record = (list: BankQuestion[]) => {
    const tried = list.filter((q) => q.stats);
    return { tried: tried.length, nailed: tried.filter((q) => q.stats!.last === "nailed").length };
  };
  const q = query.trim().toLowerCase();
  const browse = q ? questions.filter((x) => x.prompt.toLowerCase().includes(q) || x.topicTitle.toLowerCase().includes(q) || x.tags.some((t) => t.includes(q))) : pool;

  function choose(id: string) {
    setModeId(id);
    setChosenId(null);
    setSkipped(new Set());
    if (topicFilter) setParams({});
  }
  function next() {
    if (current) setSkipped((s) => new Set(s).add(current.id));
    setChosenId(null);
  }

  return (
    <div className="challenge">
      <header className="screen-head">
        <div>
          <p className="kicker">Challenge mode · {data.questions.length} challenges</p>
          <h1 className="screen-title">Answer first. Then check.</h1>
        </div>
      </header>

      <div className="modes" role="tablist" aria-label="Modes">
        {topicFilter && (
          <button type="button" role="tab" aria-selected={modeId === "topic"} className="mode" onClick={() => setModeId("topic")}>
            <Icon name="mission" size={20} />
            <span className="mode__label">This mission</span>
            <span className="mode__count">{questions.filter((x) => x.topicId === topicFilter).length}</span>
          </button>
        )}
        {MODES.map((m) => {
          const list = questions.filter(m.match);
          const r = record(list);
          return (
            <button key={m.id} type="button" role="tab" aria-selected={modeId === m.id} className="mode" onClick={() => choose(m.id)} disabled={list.length === 0}>
              <Icon name={m.icon} size={20} />
              <span className="mode__label">{m.label}</span>
              <span className="mode__count">{list.length}</span>
              <span className="mode__record">{r.tried ? `${r.nailed}/${r.tried} nailed` : m.blurb}</span>
            </button>
          );
        })}
      </div>

      {current ? (
        <Arena key={current.id} question={current} onNext={next} onRated={reload} />
      ) : (
        <div className="arena glass">
          <h2 className="arena__q">{pool.length ? "You've been through every challenge in this mode." : "Nothing here right now."}</h2>
          <button type="button" className="cta cta--small" onClick={() => setSkipped(new Set())}>
            Go round again
          </button>
        </div>
      )}

      <details className="more browse">
        <summary>
          <Icon name="search" size={15} /> Browse all challenges
        </summary>
        <label className="browse__search">
          <span className="visually-hidden">Search challenges</span>
          <input className="hh-input" type="search" placeholder="Search: idempotency, event loop, JOIN…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <ul className="browse__list">
          {browse.slice(0, 60).map((x) => (
            <li key={x.id}>
              <button type="button" className="mrow" onClick={() => (setChosenId(x.id), !pool.some((p) => p.id === x.id) && setModeId(MODES.find((m) => m.match(x) && m.id !== "due")?.id ?? "explain"), window.scrollTo({ top: 0, behavior: "smooth" }))}>
                <span className={`mrow__dot ${x.stats?.last === "nailed" ? "is-done" : x.stats ? "is-progress" : "is-available"}`} aria-hidden="true">
                  {x.stats?.last === "nailed" ? <Icon name="check" size={13} /> : "?"}
                </span>
                <span className="mrow__title">
                  <InlineText text={x.prompt} />
                </span>
                <span className="mrow__state">{x.kind}</span>
              </button>
            </li>
          ))}
        </ul>
        {browse.length > 60 && <p className="muted small">Showing 60 of {browse.length}. Search to narrow it down.</p>}
      </details>
    </div>
  );
}
