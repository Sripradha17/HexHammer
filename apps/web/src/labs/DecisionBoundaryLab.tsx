// DECISION BOUNDARY LAB: real logistic regression on two features, trained by real gradient
// descent in your browser. Click the canvas to add points; watch the boundary line move and the loss
// fall (or explode, if the learning rate is too big).
import { useEffect, useRef, useState } from "react";
import { Button } from "@hexhammer/design-system";
import { LabFrame, seeded, useGoal, type LabProps } from "./shared";

type Point = { x: number; y: number; label: 0 | 1 };
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function startingPoints(): Point[] {
  const rand = seeded(3);
  const pts: Point[] = [];
  for (let i = 0; i < 18; i++) pts.push({ x: 0.1 + rand() * 0.55, y: 0.1 + rand() * 0.6, label: 0 });
  for (let i = 0; i < 18; i++) pts.push({ x: 0.35 + rand() * 0.55, y: 0.3 + rand() * 0.6, label: 1 });
  // The two classes overlap on purpose: real data is noisy, and it means a best answer exists.
  return pts;
}

// One full-batch gradient descent step. Features are centred and scaled to about -2..2 (standardised),
// which is what you would do with real features too.
const scale = (v: number) => (v - 0.5) * 4;
export function step(w: [number, number, number], pts: Point[], lr: number) {
  let g0 = 0, g1 = 0, g2 = 0, loss = 0;
  for (const p of pts) {
    const x1 = scale(p.x), x2 = scale(p.y);
    const pred = sigmoid(w[0] * x1 + w[1] * x2 + w[2]);
    const err = pred - p.label;
    g0 += err * x1;
    g1 += err * x2;
    g2 += err;
    const clipped = Math.min(1 - 1e-12, Math.max(1e-12, pred));
    loss += -(p.label * Math.log(clipped) + (1 - p.label) * Math.log(1 - clipped));
  }
  const n = pts.length;
  return { w: [w[0] - (lr * g0) / n, w[1] - (lr * g1) / n, w[2] - (lr * g2) / n] as [number, number, number], loss: loss / n, gradNorm: Math.hypot(g0 / n, g1 / n, g2 / n) };
}

export default function DecisionBoundaryLab({ onGoal }: LabProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>(startingPoints);
  const [weights, setWeights] = useState<[number, number, number]>([0, 0, 0]);
  const [losses, setLosses] = useState<number[]>([]);
  const [lr, setLr] = useState(1);
  const [addLabel, setAddLabel] = useState<0 | 1>(1);
  const [seen, setSeen] = useState({ converged: "", diverged: "" });

  function train(steps: number) {
    let w = weights;
    const out: number[] = [];
    let convergedAt = -1;
    for (let i = 0; i < steps; i++) {
      const r = step(w, points, lr);
      w = r.w;
      out.push(r.loss);
      // Converged: the slope is almost flat (gradient length under 0.005), so steps barely move.
      if (convergedAt === -1 && r.gradNorm < 0.005) convergedAt = losses.length + i;
      if (!Number.isFinite(r.loss)) break;
    }
    const all = [...losses, ...out];
    setWeights(w);
    setLosses(all);
    if (convergedAt !== -1 && convergedAt < 300 && !seen.converged) setSeen((s) => ({ ...s, converged: `learning rate ${lr} converged at step ${convergedAt}` }));
    // Diverged: the loss shot above twice its starting value (or became infinite): steps overshoot.
    if (all.some((l) => !Number.isFinite(l) || l > 2 * all[0]) && !seen.diverged) setSeen((s) => ({ ...s, diverged: `learning rate ${lr} diverged (loss above ${(2 * all[0]).toFixed(2)})` }));
  }

  function reset() {
    setWeights([0, 0, 0]);
    setLosses([]);
  }

  const goal = useGoal(Boolean(seen.converged && seen.diverged), `${seen.converged}; ${seen.diverged}.`, onGoal);

  // Draw points, the probability background and the 0.5 boundary line.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const cell = 12;
    for (let px = 0; px < W; px += cell) {
      for (let py = 0; py < H; py += cell) {
        const p = sigmoid(weights[0] * scale(px / W) + weights[1] * scale(1 - py / H) + weights[2]);
        ctx.fillStyle = `rgba(${p > 0.5 ? "245,154,27" : "95,208,236"},${Math.abs(p - 0.5) * 0.5})`;
        ctx.fillRect(px, py, cell, cell);
      }
    }
    if (Math.abs(weights[1]) > 1e-9) {
      ctx.strokeStyle = "#ffb547";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const xEdge of [0, 1]) {
        const y = -(weights[0] * scale(xEdge) + weights[2]) / (4 * weights[1]) + 0.5; // solve w0·x1 + w1·x2 + b = 0 for y
        if (xEdge === 0) ctx.moveTo(0, (1 - y) * H);
        else ctx.lineTo(W, (1 - y) * H);
      }
      ctx.stroke();
    }
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x * W, (1 - p.y) * H, 6, 0, Math.PI * 2);
      ctx.fillStyle = p.label ? "#f59a1b" : "#0a6c8d";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [points, weights]);

  function addPoint(e: React.MouseEvent<HTMLCanvasElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    setPoints([...points, { x: (e.clientX - box.left) / box.width, y: 1 - (e.clientY - box.top) / box.height, label: addLabel }]);
  }

  const last = losses[losses.length - 1];
  return (
    <LabFrame title="Decision boundary" note="Real logistic regression and real gradient descent on the points you see. Orange = class 1, blue = class 0; the shading is the model's predicted probability." goalMet={goal}>
      <div className="lab__grid">
        <div>
          <canvas
            ref={canvas}
            width={420}
            height={320}
            className="lab__canvas"
            onClick={addPoint}
            role="img"
            aria-label={`Scatter plot with ${points.length} points and the current decision boundary. Loss ${last?.toFixed(3) ?? "not trained yet"}.`}
          />
          <p className="muted">Click to add a point of the selected class.</p>
        </div>
        <div>
          <div className="lab__controls" role="group" aria-label="Class for new points">
            <button type="button" className="hh-chip" aria-pressed={addLabel === 1} onClick={() => setAddLabel(1)}>Add orange (1)</button>
            <button type="button" className="hh-chip" aria-pressed={addLabel === 0} onClick={() => setAddLabel(0)}>Add blue (0)</button>
          </div>
          <label className="lab__field">
            Learning rate
            <select className="hh-select" value={lr} onChange={(e) => (setLr(Number(e.target.value)), reset())}>
              {[0.01, 0.1, 1, 5, 20, 60, 200].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <div className="lab__controls">
            <Button size="small" onClick={() => train(1)}>1 step</Button>
            <Button size="small" variant="secondary" onClick={() => train(100)}>100 steps</Button>
            <Button size="small" variant="ghost" onClick={reset}>Reset weights</Button>
          </div>
          <p className="lab__readout" aria-live="polite">
            Steps: {losses.length} · loss: {last === undefined ? "—" : Number.isFinite(last) ? last.toFixed(4) : "blew up (∞)"}
          </p>
          <svg className="sparkline" viewBox="0 0 200 60" role="img" aria-label="Loss per step">
            <polyline
              fill="none"
              points={losses
                .slice(-200)
                .filter(Number.isFinite)
                .map((l, i, arr) => `${(i / Math.max(1, arr.length - 1)) * 200},${60 - Math.min(1, l / Math.max(...arr, 1e-9)) * 56}`)
                .join(" ")}
            />
          </svg>
          <ul className="goal-checks">
            <li className={seen.converged ? "is-met" : ""}>{seen.converged ? `Done: ${seen.converged}` : "To do: Find a learning rate that converges in under 300 steps"}</li>
            <li className={seen.diverged ? "is-met" : ""}>{seen.diverged ? `Done: ${seen.diverged}` : "To do: Find one that diverges"}</li>
          </ul>
        </div>
      </div>
    </LabFrame>
  );
}
