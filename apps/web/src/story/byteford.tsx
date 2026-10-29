// QUEST: "The Broken Bridge of Byteford" (topic: cs-binary-encoding, bits, bytes, hex and text).
//
// The story: the bridge to Byteford's market went dark, and Rosa's bakery sign reads "JosÃ©'s Bakery".
// Bram teaches me that runes (bytes) are rows of lanterns (bits), how smiths name runes in hex,
// and why "é" needs two runes. I fix the sign, pass the Bridge Trial (the topic's REAL assessment,
// checked by the server) and watch the light run back across the bridge.
//
// Each chapter says what the painted stage starts with (`stage`) and what I do (`Play`).
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { atlas, type TopicView } from "../atlasApi";
import { ChoiceQuestion } from "../components/ChoiceQuestion";
import { InlineText } from "../components/RichText";
import { Dialogue, LanternPuzzle } from "./kit";
import { useStage, type StageState } from "./stage";

export interface ChapterProps {
  view: TopicView;
  next: () => void;
  markRead: () => Promise<unknown>;
  completeLab: (lab: string, detail: string) => void;
  celebrate: (r: { xpAwarded?: number; achievements?: { id: string; title: string; description: string; icon: string }[]; message?: string }) => void;
  reload: () => void;
}
export interface Chapter {
  id: string;
  title: string;
  stage: Partial<StageState>; // what the painted stage shows when the chapter starts
  Play: (p: ChapterProps) => ReactNode;
}

const GoOn = ({ next, label = "Continue" }: { next: () => void; label?: string }) => (
  <button type="button" className="btn btn--go" onClick={next}>
    {label}
  </button>
);

// ------------------------------------------------------------------ 5. The sign

const enc = new TextEncoder();
const runeHex = (s: string) => [...enc.encode(s)].map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

function SignPlay({ next, markRead, completeLab }: ChapterProps) {
  const { set, cheer } = useStage();
  const [phase, setPhase] = useState<"talk" | "find" | "fixed">("talk");
  const [wrong, setWrong] = useState<string | null>(null);
  const [word, setWord] = useState("Zoë🙂");

  function pick(ch: string) {
    if (runeHex(ch).length > 1) {
      setPhase("fixed");
      set({ signFixed: true, shot: "sign", mood: "proud" });
      cheer();
      // The whole lesson story has now been told; then the lab goal is saved (one after the other).
      markRead().finally(() => completeLab("binary", "Lit 0xA5 with the lanterns and found that é is the first letter needing 2 bytes (C3 A9)."));
    } else setWrong(ch);
  }

  if (phase === "talk")
    return (
      <Dialogue
        lines={[
          { mood: "happy", shot: "bram", text: "Here's a secret: letters are runes too! Every letter has a number. \"A\" is 65, and it fits in one rune." },
          {
            mood: "think",
            shot: "sign",
            text: "But \"é\" is number 233. Scribes write big letters with TWO runes. That way of writing is called UTF-8.",
            terms: [
              { word: "Unicode", plain: "the big book that gives every letter a number" },
              { word: "UTF-8", plain: "writing those numbers as 1 to 4 runes" },
            ],
          },
          { mood: "wow", shot: "sign", text: "Rosa's old sign-reader read each rune as its own letter. Two runes became two wrong letters: \"Ã©\"!" },
        ]}
      >
        <GoOn next={() => setPhase("find")} label="Find the broken letter" />
      </Dialogue>
    );

  if (phase === "find")
    return (
      <div className="puzzle">
        <p className="ask">Tap the letter that needs more than one rune.</p>
        <div className="tiles" role="group" aria-label="The letters of José">
          {["J", "o", "s", "é"].map((ch) => (
            <button key={ch} type="button" className={`tile ${wrong === ch ? "is-wrong" : ""}`} onClick={() => pick(ch)}>
              <span className="tile__ch">{ch}</span>
              <span className="tile__n">#{ch.codePointAt(0)}</span>
            </button>
          ))}
        </div>
        {wrong && (
          <p className="nudge">
            "{wrong}" is number {wrong.codePointAt(0)}, small enough for one rune. Try another!
          </p>
        )}
      </div>
    );

  const runes = [...word].map((ch) => ({ ch, hex: runeHex(ch) }));
  return (
    <div className="puzzle">
      <Dialogue
        lines={[
          { mood: "proud", shot: "sign", text: "Fixed! \"é\" is two runes, C3 and A9. Read one at a time they look like \"Ã\" and \"©\". Read together they mean \"é\"." },
          { mood: "happy", shot: "sign", text: "Now you play scribe. Type any word and see how many runes each letter needs. Try an emoji!" },
        ]}
      >
        <GoOn next={next} label="On to the riddles" />
      </Dialogue>
      <div className="scribe">
        <label className="scribe__input">
          <span>Write anything</span>
          <input value={word} onChange={(e) => setWord(e.target.value.slice(0, 14))} />
        </label>
        <div className="tiles tiles--small">
          {runes.map((r, i) => (
            <div key={i} className={`tile tile--static ${r.hex.length > 1 ? "is-big" : ""}`}>
              <span className="tile__ch">{r.ch === " " ? "␠" : r.ch}</span>
              <span className="tile__runes">
                {r.hex.map((h, j) => (
                  <span key={j} className="mini-rune">
                    {h}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="scribe__note">
          {[...word].length} letters · {enc.encode(word).length} runes (bytes)
          {word.length !== [...word].length && <> · JavaScript's .length says {word.length}: emoji count double there</>}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 6. Riddles (the topic's real exercises)

function RiddlesPlay({ view, next, reload }: ChapterProps) {
  const riddles = view.topic.exercises.filter((e) => e.kind === "predict" || e.kind === "debug");
  const strike = view.topic.exercises.find((e) => e.kind === "strike");
  const [at, setAt] = useState(0);
  const done = new Set(view.progress.exercisesDone);
  const r = riddles[at];
  return (
    <div className="puzzle">
      <p className="ask">
        Bram's riddle {Math.min(at + 1, riddles.length)} of {riddles.length}. Guess wrong as often as you like: that's how smiths learn.
      </p>
      {r && (r.kind === "predict" || r.kind === "debug") && (
        <div className="riddle" key={r.question.id}>
          <ChoiceQuestion question={r.question} kindLabel={r.kind === "predict" ? "What will it print?" : "Spot the bug"} alreadyDone={done.has(`${r.kind}:${r.question.id}`)} onCorrect={reload} />
        </div>
      )}
      <div className="talk__actions">
        {at < riddles.length - 1 && (
          <button type="button" className="btn btn--ghost" onClick={() => setAt(at + 1)}>
            Next riddle
          </button>
        )}
        {strike && strike.kind === "strike" && (
          <Link to={`/strike/${strike.strikeId}?mission=${view.topic.id}`} className="btn btn--ghost">
            Type it by hand
          </Link>
        )}
        <GoOn next={next} label="I'm ready for the trial" />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 7. The Bridge Trial (the real assessment)

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
      if (r.passed) {
        set({ bridgeFixed: true, shot: "bridge", mood: "proud" });
        cheer();
      } else set({ mood: "happy" });
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
          { mood: "think", shot: "bridge", text: `The Bridge Trial! ${questions.length} questions. Get ${need} right and the bridge lights up again.` },
          ...(best !== null ? [{ mood: "happy" as const, shot: "bridge" as const, text: `Your best so far is ${Math.round(best * 100)}%. Every try counts.` }] : []),
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
              ? { mood: "proud", shot: "bridge", text: `${result.correct} out of ${result.total}! Look! The light is running back across the bridge!` }
              : { mood: "happy", shot: "bridge", text: `${result.correct} out of ${result.total}. So close! You need ${need}. Let's look at the tricky ones and try again.` },
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
                  <span>{x.correct ? "You got it" : `Wrong. Answer: ${q.choices[x.answerIndex]}`}</span>
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

// ------------------------------------------------------------------ 8. Celebration

function RewardPlay({ view }: ChapterProps) {
  const { cheer } = useStage();
  useEffect(() => cheer(), [cheer]);
  const met = view.mastery.filter((m) => m.met).length;
  return (
    <Dialogue
      lines={[
        { mood: "proud", shot: "bridge", text: "The bridge shines and so does Rosa's sign. Byteford is saved, apprentice!" },
        { mood: "happy", shot: "wide", text: `You hold ${met} of ${view.mastery.length} mastery seals for this skill. I'll quiz you again in a few days so it stays sharp.` },
      ]}
    >
      <Link to="/" className="btn btn--go">
        Back to the kingdom
      </Link>
      <Link to="/projects" className="btn btn--ghost">
        Build something fun
      </Link>
    </Dialogue>
  );
}

// ------------------------------------------------------------------ The chapters, in order

export const BYTEFORD: Chapter[] = [
  {
    id: "arrive",
    title: "Arrival",
    stage: { scene: "village", shot: "wide", lanterns: false },
    Play: ({ next }) => (
      <Dialogue
        lines={[
          { mood: "happy", shot: "bram", text: "Welcome to Byteford, apprentice! I'm Bram, the oldest smith in the Kingdom of Hex." },
          { mood: "wow", shot: "bridge", text: "But look! Last night the rune-lights on our bridge went dark. Nobody dares cross to the market." },
          { mood: "wow", shot: "sign", text: "And Rosa's bakery sign has gone all wrong. It should say \"José's Bakery\"." },
          { mood: "think", shot: "bram", text: "Everything in our kingdom is built from runes, and every rune is a row of tiny lanterns. Come to my forge. I'll show you." },
        ]}
      >
        <GoOn next={next} label="Go to the forge" />
      </Dialogue>
    ),
  },
  {
    id: "lanterns",
    title: "Lanterns",
    stage: { scene: "forge", shot: "lanterns" },
    Play: ({ next }) => (
      <LanternPuzzle
        target={5}
        ask="This is a rune: 8 lanterns. Tap a lantern to light it. Each lantern has a power, written under it. Light lanterns that add up to 5!"
        hint="5 is 4 + 1. Light the 4 and the 1."
        win={[
          {
            mood: "proud",
            text: "Yes! You wrote the number 5 the way computers do: 00000101.",
            terms: [
              { word: "bit", plain: "one lantern: ON (1) or OFF (0)" },
              { word: "byte", plain: "a rune of 8 lanterns" },
              { word: "binary", plain: "numbers written with only ON and OFF" },
            ],
          },
        ]}
      >
        <GoOn next={next} />
      </LanternPuzzle>
    ),
  },
  {
    id: "biggest",
    title: "Biggest rune",
    stage: { scene: "forge", shot: "lanterns" },
    Play: ({ next }) => (
      <LanternPuzzle target={255} ask="Now make the BIGGEST number one rune can hold." hint="Light every lantern!" win={[{ mood: "wow", text: "255! Counting zero too, one rune can show 256 different numbers. That's why a byte holds 256 values." }]}>
        <GoOn next={next} />
      </LanternPuzzle>
    ),
  },
  {
    id: "hex",
    title: "Hex marks",
    stage: { scene: "forge", shot: "bram", lanterns: false },
    Play: function HexPlay({ next }) {
      const [ready, setReady] = useState(false);
      if (!ready)
        return (
          <Dialogue
            lines={[
              { mood: "think", shot: "bram", text: "Reading 8 lanterns is slow. So smiths cut every rune in half: 4 lanterns per half." },
              {
                mood: "happy",
                shot: "bram",
                text: "Each half gets one mark: 0 to 9, then A B C D E F for 10 to 15. Two marks name the whole rune.",
                terms: [{ word: "hexadecimal (hex)", plain: "counting with 16 marks: 0-9 and A-F" }],
              },
            ]}
          >
            <GoOn next={() => setReady(true)} label="Let me try" />
          </Dialogue>
        );
      return (
        <LanternPuzzle target={0xa5} showHex ask="The bridge lock needs the rune A5. Make the left half show A and the right half show 5." hint="A means 10 = 8 + 2 on the left. 5 = 4 + 1 on the right." win={[{ mood: "proud", text: "Click! The lock opens. A5 in hex is 165 in everyday numbers: 10 sixteens plus 5." }]}>
          <GoOn next={next} />
        </LanternPuzzle>
      );
    },
  },
  { id: "sign", title: "The sign", stage: { scene: "village", shot: "sign", lanterns: false }, Play: SignPlay },
  { id: "riddles", title: "Riddles", stage: { scene: "forge", shot: "bram", lanterns: false, signFixed: true }, Play: RiddlesPlay },
  { id: "trial", title: "Bridge Trial", stage: { scene: "village", shot: "bridge", signFixed: true }, Play: TrialPlay },
  { id: "reward", title: "Saved!", stage: { scene: "village", shot: "bridge", signFixed: true, bridgeFixed: true }, Play: RewardPlay },
];
