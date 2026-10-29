// THE SHARED QUEST: turns ANY written topic into a story quest, told by Bram, using the topic's own
// real content. No topic needs hand-written story code; a new lesson in the Atlas is a new quest.
//
//   1. Arrival   in the town's own painting: the topic's story (why it matters) and today's goals
//   2. Learn     the mental model, then each lesson card, one at a time   -> marks the lesson read
//   3. Example   read the worked example, PREDICT the output, then run it and walk the steps
//   4. Practice  the topic's riddles (predict, spot the bug, quick checks), its lab, its strikes
//   5. Trial     the topic's real assessment, scored by the server
//   6. Reward    mastery seals, and where to go next (build it, interview practice, the map)
//
// Every reward comes from the server: reading, exercises, labs and the trial each save real
// progress. Animations follow results; they never cause them.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { atlas } from "../atlasApi";
import { ChoiceQuestion } from "../components/ChoiceQuestion";
import { CodeBlock, InlineText, RichText } from "../components/RichText";
import { LabHost } from "../labs/LabHost";
import { BramFace, type Mood } from "../art/Bram";
import { regionArt } from "../art/realm";
import { Dialogue, type Line } from "./kit";
import { useStage } from "./stage";
import type { Chapter, ChapterProps } from "./byteford";

const GoOn = ({ next, label = "Continue" }: { next: () => void; label?: string }) => (
  <button type="button" className="btn btn--go" onClick={next}>
    {label} <span aria-hidden="true">→</span>
  </button>
);

// Bram's face and name, above a card that is not a spoken line.
function Speaker({ mood }: { mood: Mood }) {
  return (
    <p className="talk__who">
      <BramFace mood={mood} /> Bram
    </p>
  );
}

// Split a paragraph into short spoken lines of one or two sentences each.
function toLines(text: string, moods: Mood[]): Line[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')]?/g)?.map((s) => s.trim()) ?? [text];
  const lines: Line[] = [];
  for (let i = 0; i < sentences.length; i += 2) lines.push({ mood: moods[lines.length % moods.length], text: sentences.slice(i, i + 2).join(" ") });
  return lines;
}

// ------------------------------------------------------------------ 1. Arrival

function ArrivePlay({ view, next }: ChapterProps) {
  const { set } = useStage();
  const { topic, domain, glossary } = view;
  // The town's own painting (this chapter's stage is only known once the topic has loaded).
  useEffect(() => set({ painting: regionArt(domain.id).scene }), [domain.id, set]);
  const goals = topic.learningObjectives.slice(0, 3);
  return (
    <Dialogue
      lines={[
        { mood: "happy", shot: "bram", text: `Welcome back to ${domain.short}, apprentice! Today's quest: ${topic.title}.` },
        ...toLines(topic.story ?? "", ["wow", "think"]),
        {
          mood: "proud",
          text: `By the end you'll be able to: ${goals.map((g) => g.replace(/\.$/, "")).join("; ")}.`,
          terms: glossary.slice(0, 3).map((g) => ({ word: g.term, plain: g.simple })),
        },
      ]}
    >
      <GoOn next={next} label="Let's learn" />
    </Dialogue>
  );
}

// ------------------------------------------------------------------ 2. Learn

const CARD_MOODS: Mood[] = ["think", "happy", "wow", "proud"];

function LearnPlay({ view, next, markRead }: ChapterProps) {
  const { set } = useStage();
  const { topic } = view;
  const model = topic.mentalModel; // every written topic has one (the curriculum audit checks it)
  const cards = [...(model ? [{ heading: "The big idea", body: "" }] : []), ...topic.lessonSections];
  const [at, setAt] = useState(0);
  const mood = CARD_MOODS[at % CARD_MOODS.length];
  useEffect(() => {
    set({ mood, talking: true });
    const t = setTimeout(() => set({ talking: false }), 1600);
    return () => clearTimeout(t);
  }, [at, mood, set]);
  const last = at === cards.length - 1;
  const card = cards[at];

  return (
    <div className="lesson-card" key={at}>
      <Speaker mood={mood} />
      <p className="lesson-card__count">
        Card {at + 1} of {cards.length}
      </p>
      <h2 className="lesson-card__title">{card.heading}</h2>
      {model && at === 0 ? (
        <div className="lesson-card__body">
          <p>
            <InlineText text={model.plain} />
          </p>
          <p className="lesson-card__aside">
            <strong>Think of it like this:</strong> <InlineText text={model.analogy} />
          </p>
          <p className="lesson-card__aside lesson-card__aside--limit">
            <strong>Where the picture breaks:</strong> <InlineText text={model.analogyLimit} />
          </p>
        </div>
      ) : (
        <RichText text={card.body} className="lesson-card__body" />
      )}
      <div className="talk__actions">
        {at > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setAt(at - 1)}>
            Back
          </button>
        )}
        {!last ? (
          <GoOn next={() => setAt(at + 1)} label="Next card" />
        ) : (
          // The whole lesson has been read: that is real progress, saved on the server.
          <GoOn next={() => (markRead(), next())} label="I've got it" />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 3. Example

function ExamplePlay({ view, next }: ChapterProps) {
  const { set, cheer } = useStage();
  const examples = view.topic.codeExamples;
  const [at, setAt] = useState(0);
  const [ran, setRan] = useState(false);
  const ex = examples[at];
  const lastExample = at === examples.length - 1;

  function run() {
    setRan(true);
    set({ mood: "wow" });
    cheer();
  }

  return (
    <div className="qexample">
      {!ran && (
        <>
          <Speaker mood="think" />
          <p className="talk__text">
            Read this slowly. Before we run it, say out loud what you think it prints. Guessing first is what makes it stick.
          </p>
        </>
      )}
      <h2 className="lesson-card__title">{ex.title}</h2>
      <CodeBlock code={ex.code} />
      {!ran ? (
        <div className="talk__actions">
          <button type="button" className="btn btn--go" onClick={run}>
            I've guessed. Run it ▶
          </button>
        </div>
      ) : (
        <>
          <p className="qexample__label">It prints</p>
          <pre className="qexample__output">{ex.expectedOutput}</pre>
          <Dialogue lines={ex.steps.map((s, i) => ({ mood: (i % 2 ? "happy" : "think") as Mood, text: s }))}>
            {lastExample ? (
              <GoOn next={next} label="Time to practise" />
            ) : (
              <GoOn next={() => (setAt(at + 1), setRan(false))} label="Next example" />
            )}
          </Dialogue>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 4. Practice

function PracticePlay({ view, next, reload, completeLab }: ChapterProps) {
  const { topic, strikes, progress } = view;
  const riddles = [
    ...topic.exercises.flatMap((e) => (e.kind === "predict" || e.kind === "debug" ? [{ key: `${e.kind}:${e.question.id}`, label: e.kind === "predict" ? "What will it print?" : "Spot the bug", question: e.question }] : [])),
    ...topic.knowledgeChecks.map((q) => ({ key: `check:${q.id}`, label: "Quick check", question: q })),
  ];
  const lab = topic.exercises.find((e) => e.kind === "lab");
  const [at, setAt] = useState(0);
  const [showLab, setShowLab] = useState(false);
  const done = new Set(progress.exercisesDone);
  const r = riddles[at];

  return (
    <div className="puzzle">
      <Speaker mood="happy" />
      <p className="ask">
        Riddle {Math.min(at + 1, riddles.length)} of {riddles.length}. Guess wrong as often as you like: that's how smiths learn.
      </p>
      {r && (
        <div className="riddle" key={r.key}>
          <ChoiceQuestion question={r.question} kindLabel={r.label} alreadyDone={done.has(r.key)} onCorrect={reload} />
        </div>
      )}
      {lab && lab.kind === "lab" && (
        <div className="practice-lab">
          <button type="button" className="btn btn--ghost" aria-expanded={showLab} onClick={() => setShowLab(!showLab)}>
            🔬 {showLab ? "Close the lab" : "Open the lab"}
          </button>
          {showLab && (
            <>
              <p className="practice-lab__goal">
                <strong>Goal:</strong> {lab.goal}
              </p>
              <LabHost kind={lab.lab} onGoal={(detail) => completeLab(lab.lab, detail)} />
            </>
          )}
        </div>
      )}
      {strikes.length > 0 && (
        <p className="practice-strikes">
          ⚒ Type it by hand:{" "}
          {strikes.slice(0, 3).map((s, i) => (
            <span key={s.id}>
              {i > 0 && " · "}
              <Link to={`/strike/${s.id}?mission=${topic.id}`}>{s.title}</Link>
            </span>
          ))}
        </p>
      )}
      <div className="talk__actions">
        {at < riddles.length - 1 && (
          <button type="button" className="btn btn--ghost" onClick={() => setAt(at + 1)}>
            Next riddle
          </button>
        )}
        <GoOn next={next} label="I'm ready for the trial" />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 5. The trial (the real assessment)

type Result = Awaited<ReturnType<typeof atlas.submitAssessment>>;

function TrialPlay({ view, next, celebrate, reload }: ChapterProps) {
  const { set, cheer } = useStage();
  const questions = view.topic.assessment?.questions ?? [];
  const passing = view.topic.assessment?.passingScore ?? 0.8;
  const need = Math.ceil(passing * questions.length);
  const [started, setStarted] = useState(false);
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const best = view.progress.bestAssessmentScore;

  async function submit(final: Record<string, number>) {
    setBusy(true);
    setError("");
    try {
      const r = await atlas.submitAssessment(view.topic.id, final);
      setResult(r);
      celebrate(r);
      set({ mood: r.passed ? "proud" : "happy" });
      if (r.passed) cheer();
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function choose(i: number) {
    if (busy) return;
    const q = questions[at];
    const final = { ...answers, [q.id]: i };
    setAnswers(final);
    // A short pause so I see my pick, then the next question. The last answer submits.
    setTimeout(() => (at < questions.length - 1 ? setAt(at + 1) : submit(final)), 380);
  }

  if (!started)
    return (
      <Dialogue
        lines={[
          { mood: "think", text: `The trial! ${questions.length} questions. Get ${need} right and you've proved it.` },
          ...(best !== null ? [{ mood: "happy" as const, text: `Your best so far is ${Math.round(best * 100)}%. Every try counts.` }] : []),
        ]}
      >
        <GoOn next={() => setStarted(true)} label="Begin the trial" />
      </Dialogue>
    );

  if (result) {
    const byId = new Map(result.results.map((x) => [x.questionId, x]));
    return (
      <div className="puzzle">
        <Dialogue
          lines={[
            result.passed
              ? { mood: "proud", text: `${result.correct} out of ${result.total}! You proved it, apprentice.` }
              : { mood: "happy", text: `${result.correct} out of ${result.total}. So close! You need ${need}. Read the tricky ones below and try again.` },
          ]}
        >
          {result.passed ? (
            <GoOn next={next} label="Celebrate" />
          ) : (
            <button type="button" className="btn btn--go" onClick={() => (setResult(null), setAnswers({}), setAt(0))}>
              Try again
            </button>
          )}
        </Dialogue>
        <details className="review">
          <summary>See every answer explained</summary>
          <ol>
            {questions.map((q) => {
              const x = byId.get(q.id)!;
              return (
                <li key={q.id} className={x.correct ? "is-right" : "is-wrong"}>
                  <strong>
                    <InlineText text={q.prompt} />
                  </strong>
                  <span>{x.correct ? "✓ You got it" : `✗ Answer: ${q.choices[x.answerIndex]}`}</span>
                  <span>
                    <InlineText text={x.explanation} />
                  </span>
                </li>
              );
            })}
          </ol>
        </details>
      </div>
    );
  }

  const q = questions[at];
  return (
    <div className="trial">
      <div className="trial__progress" aria-label={`Question ${at + 1} of ${questions.length}`}>
        {questions.map((x, i) => (
          <span key={x.id} className={i < at ? "is-done" : i === at ? "is-now" : ""} />
        ))}
      </div>
      <p className="trial__q" key={q.id}>
        <InlineText text={q.prompt} />
      </p>
      {q.code && <pre className="trial__code">{q.code}</pre>}
      <div className="trial__choices">
        {q.choices.map((c, i) => (
          <button key={`${q.id}-${i}`} type="button" className={`choice-btn ${answers[q.id] === i ? "is-picked" : ""}`} onClick={() => choose(i)} disabled={busy}>
            <span className="choice-btn__letter">{"ABCDE"[i]}</span>
            <span>
              <InlineText text={c} />
            </span>
          </button>
        ))}
      </div>
      {error && <p className="nudge">{error}</p>}
    </div>
  );
}

// ------------------------------------------------------------------ 6. Reward

function RewardPlay({ view }: ChapterProps) {
  const { cheer } = useStage();
  useEffect(() => cheer(), [cheer]);
  const met = view.mastery.filter((m) => m.met).length;
  return (
    <Dialogue
      lines={[
        { mood: "proud", text: `Quest complete: ${view.topic.title}!` },
        { mood: "happy", text: `You hold ${met} of ${view.mastery.length} mastery seals. Build something with it, then explain it out loud: that's how it becomes yours for interviews.` },
      ]}
    >
      <Link to={`/map/${view.domain.id}`} className="btn btn--go">
        Next quest on the map
      </Link>
      <Link to={`/projects?start=${view.topic.id}`} className="btn btn--ghost">
        ⚒ Build it
      </Link>
      <Link to="/interview" className="btn btn--ghost">
        🎤 Interview practice
      </Link>
    </Dialogue>
  );
}

// ------------------------------------------------------------------ the chapters, in order

// Each chapter stands in its own painted place (picture numbers from assets/webdesign).
export const AUTO_CHAPTERS: Chapter[] = [
  { id: "arrive", title: "Arrival", icon: "🗺", stage: { painting: 21, shot: "bram", mood: "happy" }, Play: ArrivePlay },
  { id: "learn", title: "Learn", icon: "📖", stage: { painting: 7, shot: "wide", mood: "think" }, Play: LearnPlay },
  { id: "example", title: "See it run", icon: "⚙", stage: { painting: 24, shot: "wide", mood: "think" }, Play: ExamplePlay },
  { id: "practice", title: "Practice", icon: "🎯", stage: { painting: 3, shot: "wide", mood: "happy" }, Play: PracticePlay },
  { id: "trial", title: "Trial", icon: "⚖", stage: { painting: 17, shot: "wide", mood: "think" }, Play: TrialPlay },
  { id: "reward", title: "Victory", icon: "🏆", stage: { painting: 19, shot: "wide", mood: "proud" }, Play: RewardPlay },
];
