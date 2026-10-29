// RAG LAB: real retrieval over a small, fictional help-centre. Keyword scoring (a simple TF-IDF),
// semantic scoring (the lab's toy embedding, honestly labelled), and hybrid (reciprocal rank fusion).
// It assembles the exact prompt a model would receive. NO model is called: retrieval is the half
// this lab teaches, and the prompt shows what "grounded" means.
import { useMemo, useState } from "react";
import { cosine, embed, words } from "./embeddingModel";
import { LabFrame, useGoal, type LabProps } from "./shared";

// A fictional shop's help pages (not a real company).
const DOCS = [
  { id: "refunds", title: "Refund policy", text: "Refunds are issued within 14 days after a returned item arrives at our warehouse. Digital purchases cannot be refunded once the download has started. Reimbursement goes back to the original payment method." },
  { id: "shipping", title: "Shipping", text: "Standard delivery takes 3 to 5 business days. Express delivery arrives the next working day if you order before noon. Parcels are tracked by our courier." },
  { id: "account", title: "Account help", text: "You can change your password from the account page. If you think your account was hacked, reset your password and contact support immediately. Login codes expire after 10 minutes." },
  { id: "cancel", title: "Cancelling", text: "You can cancel a subscription at any time from the billing page. Orders can be cancelled until they are shipped. After shipping, start a return instead." },
  { id: "damaged", title: "Damaged items", text: "If an item arrives broken or damaged, send a photo within 7 days. We will send a replacement or give your money back." },
];

const QUESTIONS = [
  { q: "How long until I get my money back?", answer: "refunds" },
  { q: "Can I get reimbursed for an ebook I already downloaded?", answer: "refunds" },
  { q: "When will my parcel arrive?", answer: "shipping" },
  { q: "Someone stole my login, what do I do?", answer: "account" },
  { q: "My order came smashed", answer: "damaged" },
];

type Mode = "keyword" | "semantic" | "hybrid";

// Split each document into chunks of N sentences, each remembering its document and title.
export function chunk(sentencesPerChunk: number) {
  return DOCS.flatMap((d) => {
    const sentences = d.text.match(/[^.]+\./g) ?? [d.text];
    const out = [];
    for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
      out.push({ id: `${d.id}#${i / sentencesPerChunk + 1}`, doc: d.id, title: d.title, text: sentences.slice(i, i + sentencesPerChunk).join(" ").trim() });
    }
    return out;
  });
}

export function rank(question: string, chunks: ReturnType<typeof chunk>, mode: Mode) {
  const stop = new Set(["a", "an", "the", "is", "are", "do", "i", "my", "to", "of", "for", "how", "what", "can", "it", "in", "on", "and", "you", "your", "get", "until", "will", "when", "already", "someone", "came"]);
  const qWords = words(question).filter((w) => !stop.has(w));
  // Keyword: TF-IDF. Words found in fewer chunks count for more.
  const df = new Map<string, number>();
  for (const c of chunks) for (const w of new Set(words(c.text))) df.set(w, (df.get(w) ?? 0) + 1);
  const keyword = chunks.map((c) => {
    const tokens = words(c.text);
    return qWords.reduce((s, w) => s + (tokens.filter((t) => t === w).length * Math.log(1 + chunks.length / (df.get(w) ?? chunks.length))), 0);
  });
  const qv = embed(question);
  const semantic = chunks.map((c) => cosine(qv, embed(`${c.title} ${c.text}`)));
  // Hybrid: reciprocal rank fusion, 1/(60 + rank) from each list, added up.
  const rankOf = (scores: number[]) => {
    const order = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
    const r = new Array(scores.length);
    order.forEach((i, pos) => (r[i] = pos + 1));
    return r as number[];
  };
  const kr = rankOf(keyword), sr = rankOf(semantic);
  const scores = chunks.map((_, i) => (mode === "keyword" ? keyword[i] : mode === "semantic" ? semantic[i] : 1 / (60 + kr[i]) + 1 / (60 + sr[i])));
  return chunks.map((c, i) => ({ ...c, score: scores[i] })).filter((c) => c.score > 0).sort((a, b) => b.score - a.score);
}

export default function RagLab({ onGoal }: LabProps) {
  const [mode, setMode] = useState<Mode>("keyword");
  const [size, setSize] = useState(1);
  const [k, setK] = useState(3);
  const [qi, setQi] = useState(0);
  const chunks = useMemo(() => chunk(size), [size]);
  const results = QUESTIONS.map((q) => rank(q.q, chunks, mode).slice(0, k));
  const hits = QUESTIONS.map((q, i) => results[i].some((c) => c.doc === q.answer));
  const allInTop3 = k <= 3 && hits.every(Boolean);
  const goal = useGoal(allInTop3, `${mode} retrieval, ${size} sentence(s) per chunk, k = ${k}: all 5 questions found their source.`, onGoal);

  const top = results[qi];
  const prompt = [
    "Answer ONLY from the sources below. If they do not contain the answer, say you don't know. Cite source ids like [refunds#1].",
    ...top.map((c) => `[${c.id}] ${c.text}`),
    `Question: ${QUESTIONS[qi].q}`,
  ].join("\n");

  return (
    <LabFrame title="Retrieval-augmented generation" note="Real retrieval maths (TF-IDF, cosine, reciprocal rank fusion) over a fictional help centre. Semantic search uses the toy embedding from the Embeddings lab. No model is called." goalMet={goal}>
      <div className="lab__controls" role="group" aria-label="Retrieval mode">
        {(["keyword", "semantic", "hybrid"] as Mode[]).map((m) => (
          <button key={m} type="button" className="hh-chip" aria-pressed={m === mode} onClick={() => setMode(m)}>{m}</button>
        ))}
        <label className="lab__field lab__field--small">Sentences per chunk
          <select className="hh-select" value={size} onChange={(e) => setSize(Number(e.target.value))}>{[1, 2, 3].map((v) => <option key={v}>{v}</option>)}</select>
        </label>
        <label className="lab__field lab__field--small">Top k
          <select className="hh-select" value={k} onChange={(e) => setK(Number(e.target.value))}>{[1, 2, 3, 5].map((v) => <option key={v}>{v}</option>)}</select>
        </label>
      </div>
      <ul className="rag-questions">
        {QUESTIONS.map((q, i) => (
          <li key={q.q}>
            <button type="button" className={`rag-q ${i === qi ? "is-current" : ""}`} aria-pressed={i === qi} onClick={() => setQi(i)}>
              <span aria-hidden="true">{hits[i] ? "Found:" : "Missed:"}</span> {q.q}
              <span className="visually-hidden">{hits[i] ? " (source found)" : " (source missed)"}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="lab__readout" aria-live="polite">{hits.filter(Boolean).length} of 5 questions retrieved their correct source in the top {k}.</p>
      <div className="lab__grid">
        <ol className="rag-results">
          {top.length === 0 && <li className="muted">Nothing matched. With nothing retrieved, a grounded model must say it does not know.</li>}
          {top.map((c) => (
            <li key={c.id} className={c.doc === QUESTIONS[qi].answer ? "is-right" : ""}>
              <code>[{c.id}]</code> <strong>{c.title}</strong> <span className="muted">score {c.score.toFixed(3)}</span>
              <p>{c.text}</p>
            </li>
          ))}
        </ol>
        <div>
          <h4>The prompt a model would receive</h4>
          <pre className="lab__code lab__code--wrap">{prompt}</pre>
        </div>
      </div>
    </LabFrame>
  );
}
