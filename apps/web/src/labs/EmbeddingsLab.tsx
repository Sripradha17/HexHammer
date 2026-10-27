// EMBEDDINGS LAB: cosine similarity between sentence vectors, compared with plain word overlap.
import { useState } from "react";
import { CONCEPTS, cosine, embed, sharedWords } from "./embeddingModel";
import { LabFrame, useGoal, type LabProps } from "./shared";

export default function EmbeddingsLab({ onGoal }: LabProps) {
  const [a, setA] = useState("How do I get a refund?");
  const [b, setB] = useState("Where is my reimbursement?");
  const va = embed(a);
  const vb = embed(b);
  const sim = cosine(va, vb);
  const shared = sharedWords(a, b);
  const goal = useGoal(sim >= 0.8 && shared.length === 0, `"${a}" vs "${b}": cosine ${sim.toFixed(2)} with no shared words.`, onGoal);

  return (
    <LabFrame
      title="Embeddings"
      note="HONEST LABEL: a toy, hand-made embedding (8 concept dimensions from a small word list), not a trained model. The cosine similarity maths is the real thing."
      goalMet={goal}
    >
      <div className="lab__grid">
        <label className="lab__field">Sentence A<input className="hh-input" value={a} onChange={(e) => setA(e.target.value)} /></label>
        <label className="lab__field">Sentence B<input className="hh-input" value={b} onChange={(e) => setB(e.target.value)} /></label>
      </div>
      <p className="lab__readout" aria-live="polite">
        Cosine similarity <strong>{sim.toFixed(2)}</strong> · shared words (ignoring little words): <strong>{shared.length ? shared.join(", ") : "none"}</strong>
      </p>
      <table className="data-table">
        <caption className="visually-hidden">Concept vectors for both sentences</caption>
        <thead>
          <tr><th scope="col">Concept</th><th scope="col">A</th><th scope="col">B</th></tr>
        </thead>
        <tbody>
          {CONCEPTS.map((c, i) => (
            <tr key={c} className={va[i] && vb[i] ? "is-shared" : ""}>
              <th scope="row">{c}</th>
              <td className="num">{va[i].toFixed(1)}</td>
              <td className="num">{vb[i].toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Keyword search compares words; embedding search compares meaning. This is why "refund" and "reimbursement" can match without sharing a single word.</p>
    </LabFrame>
  );
}
