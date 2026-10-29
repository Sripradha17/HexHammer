// REVIEW MISSIONS: the memory garden. Today's spaced reviews, one at a time. Topic reviews ask a
// few quick questions; question reviews ask me to answer an interview question again and rate
// myself. I always say how sure I feel BEFORE checking: guessing honestly is part of learning.
//
// The row of orbs at the top is today's reviews: done ones glow teal, the current one amber.
import { useState } from "react";
import { Link } from "react-router";
import { atlas, type ReviewMission } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { CodeBlock, InlineText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { BramFace } from "../art/Bram";
import { relativeDays } from "../labels";

// How sure do I feel? Five plain steps, from guessing to certain.
const SURE = [
  { label: "Guessing" },
  { label: "Unsure" },
  { label: "Okay" },
  { label: "Fairly sure" },
  { label: "Certain" },
];

function Confidence({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <fieldset className="sure">
      <legend>How sure do you feel? Pick before you check.</legend>
      <div className="sure__row">
        {SURE.map((s, i) => (
          <label key={s.label} className={`sure__option ${value === i + 1 ? "is-on" : ""}`}>
            <input type="radio" name="confidence" checked={value === i + 1} onChange={() => onChange(i + 1)} />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TopicReview({ mission, onDone }: { mission: ReviewMission; onDone: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState(3);
  const [result, setResult] = useState<Awaited<ReturnType<typeof atlas.submitReview>> | null>(null);
  const [error, setError] = useState("");
  const { celebrate } = useRewards();
  const questions = mission.questions ?? [];

  async function submit() {
    try {
      const r = await atlas.submitReview(mission.id, { answers, confidence });
      setResult(r);
      celebrate(r);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (result) {
    const fb = new Map(result.feedback.map((f) => [f.id, f]));
    return (
      <div role="status" className="memory-result">
        <p className={`memory-result__head is-${result.result}`}>
          <BramFace mood={result.result === "good" ? "proud" : result.result === "hard" ? "think" : "oops"} size={52} />
          <span>
            <strong>{result.result === "good" ? "Solid! That memory is getting stronger." : result.result === "hard" ? "Partly there. A little more practice soon." : "This one slipped, and that's completely normal."}</strong>
            <span className="memory-result__next">
              Next review {relativeDays(result.nextDueAt)} ({result.days} day{result.days > 1 ? "s" : ""}).
            </span>
          </span>
        </p>
        <ol className="memory-answers">
          {questions.map((q) => {
            const f = fb.get(q.id);
            return (
              <li key={q.id} className={f?.correct ? "is-right" : "is-wrong"}>
                <p className="memory-answers__q">
                  <InlineText text={q.prompt} />
                </p>
                <p className="memory-answers__verdict">{f?.correct ? "Right" : `Wrong: the answer is "${q.choices[f?.answerIndex ?? 0]}"`}</p>
                {f && (
                  <p className="memory-answers__why">
                    <InlineText text={f.explanation} />
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        <button type="button" className="btn btn--go" onClick={onDone}>
          Next review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), submit())}>
      {questions.map((q, n) => (
        <fieldset key={q.id} className="memory-q">
          <legend className="memory-q__prompt">
            <span className="memory-q__n">{n + 1}</span>
            <InlineText text={q.prompt} />
          </legend>
          {q.code && <CodeBlock code={q.code} />}
          <div className="memory-q__options">
            {q.choices.map((c, i) => (
              <label key={i} className={`memory-q__option ${answers[q.id] === i ? "is-picked" : ""}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
                <span className="memory-q__letter" aria-hidden="true">
                  {"ABCDE"[i]}
                </span>
                <span>
                  <InlineText text={c} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Confidence value={confidence} onChange={setConfidence} />
      <div className="memory__actions">
        <button type="submit" className="btn btn--go" disabled={Object.keys(answers).length < questions.length}>
          Check my memory
        </button>
      </div>
      {error && (
        <p className="nudge" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function QuestionReview({ mission, onDone }: { mission: ReviewMission; onDone: () => void }) {
  const q = mission.question!;
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [reveal, setReveal] = useState<Awaited<ReturnType<typeof atlas.answerInterview>> | null>(null);
  const [done, setDone] = useState<string>("");
  const [error, setError] = useState("");
  const { celebrate } = useRewards();

  async function submitAnswer() {
    try {
      setReveal(await atlas.answerInterview(q.id, answer, confidence));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function rate(rating: string) {
    try {
      const r = await atlas.submitReview(mission.id, { selfRating: rating, confidence });
      celebrate(r);
      setDone(`Next review ${relativeDays(r.nextDueAt)}.`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <p className="memory-q__prompt memory-q__prompt--big">
        <InlineText text={q.prompt} />
      </p>
      {q.code && <CodeBlock code={q.code} />}
      {!reveal ? (
        <>
          <label className="memory-answer">
            <span>Your answer, in your own words (say it out loud first)</span>
            <textarea className="memory-answer__box" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} />
          </label>
          <Confidence value={confidence} onChange={setConfidence} />
          <div className="memory__actions">
            <button type="button" className="btn btn--go" onClick={submitAnswer} disabled={answer.trim().length < 20}>
              Reveal the model answer
            </button>
          </div>
        </>
      ) : (
        <div className="memory-reveal">
          <h3>Model answer</h3>
          <p>{reveal.modelAnswer}</p>
          <h3>A strong answer covers</h3>
          <ul>
            {reveal.expectedElements.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {done ? (
            <p role="status" className="memory__actions">
              {done}{" "}
              <button type="button" className="btn btn--go" onClick={onDone}>
                Next review
              </button>
            </p>
          ) : (
            <div className="memory-rate" role="group" aria-label="Rate yourself">
              <button type="button" className="btn btn--ghost" onClick={() => rate("missed")}>
                I missed it
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => rate("partial")}>
                Partly
              </button>
              <button type="button" className="btn btn--go" onClick={() => rate("nailed")}>
                Nailed it
              </button>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="nudge" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ReviewsPage() {
  const { data, error, loading, reload } = useLoad(() => atlas.reviewsDue());
  const [index, setIndex] = useState(0);

  if (loading && !data) return <Loading label="Gathering today's reviews" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const missions = data?.missions ?? [];
  const mission = missions[index];

  return (
    <div className="memory">
      <header className="memory__head">
        <p className="realm__eyebrow">The memory garden</p>
        <h1 className="memory__title">Today's reviews</h1>
        <p className="memory__lead">Remembering something just before you forget it is the fastest way to keep it for good. Missing a day never resets anything.</p>
        {missions.length > 0 && (
          <ol className="memory__orbs" aria-label={`Review ${Math.min(index + 1, missions.length)} of ${missions.length}`}>
            {missions.map((m, i) => (
              <li key={m.id} className={i < index ? "is-done" : i === index ? "is-now" : ""} title={m.title} />
            ))}
          </ol>
        )}
      </header>

      {missions.length === 0 || !mission ? (
        <section className="memory__card memory__empty rm-panel">
          <BramFace mood="proud" size={88} />
          <h2>{missions.length === 0 ? "Nothing to review today" : "All done for today!"}</h2>
          <p>
            {missions.length === 0
              ? "Reviews appear after you pass a quest's trial, and after you rate yourself on interview questions. Come back tomorrow, or keep learning."
              : "Every memory you refreshed today will last longer. See you tomorrow."}
          </p>
          <div className="memory__actions">
            <Link to="/" className="btn btn--go">
              Continue your quest
            </Link>
            <Link to="/interview" className="btn btn--ghost">
              Practise a challenge
            </Link>
          </div>
        </section>
      ) : (
        <article className="memory__card rm-panel" key={mission.id}>
          <div className="memory__who">
            <BramFace mood="think" size={56} />
            <p>
              <span className="memory__kicker">
                Review {index + 1} of {missions.length} · {mission.kind === "topic" ? "Quick questions" : "Say it again"} · Memory level {mission.step + 1}
              </span>
              <span className="memory__topic">
                Do you still remember <Link to={`/topic/${mission.topicId}`}>{mission.title}</Link>? Try before you peek.
              </span>
            </p>
          </div>
          {mission.kind === "topic" ? <TopicReview mission={mission} onDone={() => setIndex(index + 1)} /> : <QuestionReview mission={mission} onDone={() => setIndex(index + 1)} />}
        </article>
      )}
    </div>
  );
}
