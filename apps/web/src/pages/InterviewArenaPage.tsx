// THE INTERVIEW ARENA: a searchable question bank linked to the curriculum. Answer in your own words
// first; then the model answer, the points a strong answer covers, and common wrong answers appear.
// Rate yourself honestly; that schedules the question for spaced review.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Badge, Button, Chip, EmptyState } from "@hexhammer/design-system";
import { atlas, type BankQuestion, type Reveal } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { CodeBlock, InlineText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { relativeDays } from "../labels";

const KINDS = ["concept", "code-reading", "debugging", "scenario", "design", "misconception", "implementation", "behavioral"];
const DIFFICULTIES = ["foundation", "core", "advanced"];

function Practice({ question, onRated }: { question: BankQuestion; onRated: () => void }) {
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [hit, setHit] = useState<string[]>([]);
  const [rated, setRated] = useState("");
  const [error, setError] = useState("");
  const { celebrate } = useRewards();

  async function submit() {
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
      setRated(`Saved. You'll see this again ${relativeDays(r.nextDueAt)}.`);
      onRated();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <article className="practice" aria-labelledby="practice-q">
      <p className="eyebrow">
        {question.kind} · {question.difficulty} · <Link to={`/topic/${question.topicId}`}>{question.topicTitle}</Link>
      </p>
      <h2 id="practice-q" className="practice__q"><InlineText text={question.prompt} /></h2>
      {question.code && <CodeBlock code={question.code} />}
      {!reveal ? (
        <>
          <label className="lab__field">
            Your answer (out loud first, then type it). A strong answer covers about {question.expectedCount} points.
            <textarea className="hh-textarea" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <label className="lab__field lab__field--small">
            Confidence before revealing
            <select className="hh-select" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>
              {["1 · guessing", "2 · unsure", "3 · okay", "4 · fairly sure", "5 · certain"].map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
            </select>
          </label>
          <Button onClick={submit} disabled={answer.trim().length < 20}>Commit my answer and reveal</Button>
          {answer.trim().length < 20 && <p className="muted">Write at least a sentence or two first; the reveal is earned.</p>}
        </>
      ) : (
        <div className="reveal">
          <h3 className="subhead">Your answer</h3>
          <p className="reveal__mine">{answer}</p>
          <h3 className="subhead">Which of these did you cover?</h3>
          <ul className="element-checks">
            {reveal.expectedElements.map((e) => (
              <li key={e}>
                <label className="check">
                  <input type="checkbox" checked={hit.includes(e)} onChange={() => setHit(hit.includes(e) ? hit.filter((x) => x !== e) : [...hit, e])} /> {e}
                </label>
              </li>
            ))}
          </ul>
          <h3 className="subhead">Model answer</h3>
          <p>{reveal.modelAnswer}</p>
          <details>
            <summary>Why, common wrong answers and follow-ups</summary>
            <p>{reveal.explanation}</p>
            {reveal.commonWrongAnswers.length > 0 && <p><strong>Common wrong answers:</strong> {reveal.commonWrongAnswers.join(" · ")}</p>}
            {reveal.followUps.length > 0 && <p><strong>Likely follow-ups:</strong> {reveal.followUps.join(" · ")}</p>}
          </details>
          {rated ? (
            <p role="status">{rated}</p>
          ) : (
            <div className="actions" role="group" aria-label="Rate yourself honestly">
              <Button variant="secondary" onClick={() => rate("missed")}>Missed it</Button>
              <Button variant="secondary" onClick={() => rate("partial")}>Partly ({hit.length}/{reveal.expectedElements.length})</Button>
              <Button onClick={() => rate("nailed")}>Nailed it</Button>
            </div>
          )}
        </div>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
    </article>
  );
}

export function InterviewArenaPage() {
  const [params, setParams] = useSearchParams();
  const { data, error, loading, reload } = useLoad(() => atlas.interviewBank());
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [focus, setFocus] = useState<"all" | "due" | "weak" | "new">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const topicFilter = params.get("topic");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.questions ?? []).filter((x) => {
      if (topicFilter && x.topicId !== topicFilter) return false;
      if (kinds.length && !kinds.includes(x.kind)) return false;
      if (difficulty.length && !difficulty.includes(x.difficulty)) return false;
      if (focus === "due" && !(x.dueAt && new Date(x.dueAt) <= new Date())) return false;
      if (focus === "weak" && x.stats?.last !== "missed" && x.stats?.last !== "partial") return false;
      if (focus === "new" && x.stats) return false;
      return !q || x.prompt.toLowerCase().includes(q) || x.topicTitle.toLowerCase().includes(q) || x.tags.some((t) => t.includes(q));
    });
  }, [data, query, kinds, difficulty, focus, topicFilter]);

  if (loading && !data) return <Loading label="Opening the arena" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const selected = filtered.find((q) => q.id === selectedId) ?? null;
  const toggle = (list: string[], v: string, set: (l: string[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="arena">
      <header className="page-head">
        <p className="eyebrow">Interview Arena · {data.questions.length} questions across {data.topicsWithQuestions} topics</p>
        <h1 className="page-title">Say it out loud, then check.</h1>
        <p className="lead">
          The bank grows with the curriculum (target: {data.target} questions per written topic; the coverage report shows where it is below that).{" "}
          <Link to="/interview/flashcards">Classic level flashcards →</Link>
        </p>
        <label className="search">
          <span className="visually-hidden">Search questions</span>
          <input className="hh-input search__input" type="search" placeholder="Search: idempotency, event loop, JOIN, cache…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </header>

      <div className="filters" role="group" aria-label="Filters">
        {(["all", "due", "weak", "new"] as const).map((f) => (
          <Chip key={f} pressed={focus === f} onToggle={() => setFocus(f)}>
            {f === "all" ? "All" : f === "due" ? "Due for review" : f === "weak" ? "Weak areas" : "Never answered"}
          </Chip>
        ))}
        <span className="filters__sep" aria-hidden="true" />
        {DIFFICULTIES.map((d) => (
          <Chip key={d} pressed={difficulty.includes(d)} onToggle={() => toggle(difficulty, d, setDifficulty)}>{d}</Chip>
        ))}
        <span className="filters__sep" aria-hidden="true" />
        {KINDS.map((k) => (
          <Chip key={k} pressed={kinds.includes(k)} onToggle={() => toggle(kinds, k, setKinds)}>{k}</Chip>
        ))}
        {topicFilter && (
          <Button variant="ghost" size="small" onClick={() => (params.delete("topic"), setParams(params))}>
            Topic: {data.questions.find((q) => q.topicId === topicFilter)?.topicTitle ?? topicFilter} ✕
          </Button>
        )}
      </div>

      <div className="arena__layout">
        <section aria-label="Questions">
          <p className="muted" aria-live="polite">{filtered.length} question{filtered.length === 1 ? "" : "s"}</p>
          {filtered.length === 0 ? (
            <EmptyState title="No questions match">Clear a filter or try a different word.</EmptyState>
          ) : (
            <ul className="question-list">
              {filtered.map((q) => (
                <li key={q.id}>
                  <button type="button" className={`question-item ${q.id === selectedId ? "is-current" : ""}`} aria-pressed={q.id === selectedId} onClick={() => setSelectedId(q.id)}>
                    <span className="question-item__prompt"><InlineText text={q.prompt} /></span>
                    <span className="question-item__meta">
                      <Badge tone="soft">{q.kind}</Badge> <span className="muted">{q.topicTitle}</span>
                      {q.stats && <Badge tone={q.stats.last === "nailed" ? "success" : q.stats.last === "missed" ? "danger" : "review"}>{q.stats.last} · {q.stats.attempts}×</Badge>}
                      {q.dueAt && new Date(q.dueAt) <= new Date() && <Badge tone="review">due</Badge>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-label="Practice" className="arena__practice">
          {selected ? <Practice key={selected.id} question={selected} onRated={reload} /> : <EmptyState title="Pick a question">Choose one on the left. You will answer first; the model answer comes after.</EmptyState>}
        </section>
      </div>
    </div>
  );
}
