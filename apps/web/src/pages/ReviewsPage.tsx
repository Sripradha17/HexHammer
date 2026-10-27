// REVIEW MISSIONS: today's spaced reviews. Topic reviews ask a few questions; question reviews ask me
// to answer an interview question again and rate myself. I always give my confidence first.
import { useState } from "react";
import { Link } from "react-router";
import { Badge, Button, EmptyState } from "@hexhammer/design-system";
import { atlas, type ReviewMission } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { CodeBlock, InlineText } from "../components/RichText";
import { useRewards } from "../components/Rewards";
import { relativeDays } from "../labels";

function Confidence({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <fieldset className="confidence">
      <legend>How sure do you feel? (before checking)</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="confidence__option">
          <input type="radio" name="confidence" checked={value === n} onChange={() => onChange(n)} />
          <span>{["Guessing", "Unsure", "Okay", "Fairly sure", "Certain"][n - 1]}</span>
        </label>
      ))}
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
      <div role="status">
        <p className="review-result">
          {result.result === "good" ? "✓ Solid. " : result.result === "hard" ? "Partly there. " : "This one slipped, and that's normal. "}
          Next review {relativeDays(result.nextDueAt)} ({result.days} day{result.days > 1 ? "s" : ""}).
        </p>
        <ol className="assessment-review">
          {questions.map((q) => {
            const f = fb.get(q.id);
            return (
              <li key={q.id} className={f?.correct ? "is-right" : "is-wrong"}>
                <p><InlineText text={q.prompt} /></p>
                <p className="muted">{f?.correct ? "✓ Right" : `✗ The answer is "${q.choices[f?.answerIndex ?? 0]}"`}</p>
                {f && <p><InlineText text={f.explanation} /></p>}
              </li>
            );
          })}
        </ol>
        <Button onClick={onDone}>Next review</Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), submit())}>
      {questions.map((q) => (
        <fieldset key={q.id} className="choice">
          <legend className="choice__legend"><span className="choice__prompt"><InlineText text={q.prompt} /></span></legend>
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
      <Confidence value={confidence} onChange={setConfidence} />
      <Button type="submit" disabled={Object.keys(answers).length < questions.length}>Check my review</Button>
      {error && <p className="field-error" role="alert">{error}</p>}
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
      <p className="question-prompt"><InlineText text={q.prompt} /></p>
      {q.code && <CodeBlock code={q.code} />}
      {!reveal ? (
        <>
          <label className="lab__field">
            Your answer, in your own words
            <textarea className="hh-textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <Confidence value={confidence} onChange={setConfidence} />
          <Button onClick={submitAnswer} disabled={answer.trim().length < 20}>Reveal the model answer</Button>
        </>
      ) : (
        <div className="reveal">
          <h4>Model answer</h4>
          <p>{reveal.modelAnswer}</p>
          <h4>A strong answer covers</h4>
          <ul>{reveal.expectedElements.map((e) => <li key={e}>{e}</li>)}</ul>
          {done ? (
            <p role="status">{done} <Button size="small" onClick={onDone}>Next review</Button></p>
          ) : (
            <div className="actions" role="group" aria-label="Rate yourself">
              <Button variant="secondary" onClick={() => rate("missed")}>I missed it</Button>
              <Button variant="secondary" onClick={() => rate("partial")}>Partly</Button>
              <Button onClick={() => rate("nailed")}>Nailed it</Button>
            </div>
          )}
        </div>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
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
    <div className="page-narrow">
      <p className="eyebrow">Spaced repetition</p>
      <h1 className="page-title">Today's review mission</h1>
      <p className="lead">Short, spaced practice is what turns "I read it once" into "I know it". Missing a day never resets anything.</p>
      {missions.length === 0 || !mission ? (
        <EmptyState title={missions.length === 0 ? "Nothing due today" : "All done for today"} action={<Link to="/" className="hh-button hh-button--secondary">Back to Mission Control</Link>}>
          Reviews appear after you pass a topic's assessment, and after you rate yourself on interview questions.
        </EmptyState>
      ) : (
        <article className="review-card" key={mission.id}>
          <p className="eyebrow">
            Review {index + 1} of {missions.length} · {mission.kind === "topic" ? "topic" : "interview question"} · <Link to={`/topic/${mission.topicId}`}>{mission.title}</Link>
          </p>
          <Badge tone="review">Stage {mission.step + 1}</Badge>
          {mission.kind === "topic" ? <TopicReview mission={mission} onDone={() => setIndex(index + 1)} /> : <QuestionReview mission={mission} onDone={() => setIndex(index + 1)} />}
        </article>
      )}
    </div>
  );
}
