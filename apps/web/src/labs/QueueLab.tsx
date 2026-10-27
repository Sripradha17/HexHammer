// QUEUE LAB: at-least-once delivery with lost acknowledgements, with and without an idempotent
// consumer. Each run really processes 100 messages through a queue simulation with a fixed seed.
import { useMemo, useState } from "react";
import { LabFrame, seeded, useGoal, type LabProps } from "./shared";

export function runQueue(opts: { lostAckRate: number; idempotent: boolean; crashRate: number }) {
  const rand = seeded(7);
  const queue: { id: string; attempts: number }[] = Array.from({ length: 100 }, (_, i) => ({ id: `order-${i + 1}`, attempts: 0 }));
  const processedIds = new Set<string>(); // the consumer's "already done" table (used only if idempotent)
  const emails = new Map<string, number>(); // side effects: how many emails each order caused
  let deliveries = 0;
  let deadLetters = 0;
  while (queue.length) {
    const msg = queue.shift()!;
    msg.attempts++;
    deliveries++;
    // The consumer crashes BEFORE doing anything: the message is redelivered.
    if (rand() < opts.crashRate) {
      if (msg.attempts >= 5) deadLetters++;
      else queue.push(msg);
      continue;
    }
    if (!(opts.idempotent && processedIds.has(msg.id))) {
      emails.set(msg.id, (emails.get(msg.id) ?? 0) + 1); // the side effect
      processedIds.add(msg.id);
    }
    // The work is done, but the acknowledgement may be lost: the broker delivers it again.
    if (rand() < opts.lostAckRate && msg.attempts < 5) queue.push(msg);
  }
  const duplicates = [...emails.values()].reduce((n, c) => n + Math.max(0, c - 1), 0);
  return { deliveries, emailsSent: [...emails.values()].reduce((a, b) => a + b, 0), ordersEmailed: emails.size, duplicates, deadLetters };
}

export default function QueueLab({ onGoal }: LabProps) {
  const [lostAck, setLostAck] = useState(30);
  const [crash, setCrash] = useState(5);
  const [idempotent, setIdempotent] = useState(false);
  const r = useMemo(() => runQueue({ lostAckRate: lostAck / 100, idempotent, crashRate: crash / 100 }), [lostAck, crash, idempotent]);
  const goal = useGoal(lostAck > 0 && r.ordersEmailed === 100 && r.duplicates === 0, `With ${lostAck}% lost acks: 100 orders, 0 duplicate emails (${r.deliveries} deliveries).`, onGoal);

  return (
    <LabFrame title="Message queue" note="A queue simulation with at-least-once delivery: unacknowledged messages come back. Fixed seed, so results are repeatable." goalMet={goal}>
      <div className="lab__grid">
        <label className="lab__field">Lost acknowledgements: {lostAck}%<input type="range" min={0} max={60} value={lostAck} onChange={(e) => setLostAck(Number(e.target.value))} /></label>
        <label className="lab__field">Consumer crashes before work: {crash}%<input type="range" min={0} max={30} value={crash} onChange={(e) => setCrash(Number(e.target.value))} /></label>
        <label className="check"><input type="checkbox" checked={idempotent} onChange={(e) => setIdempotent(e.target.checked)} /> Idempotent consumer (record processed message ids, skip repeats)</label>
      </div>
      <div className="stat-row" aria-live="polite">
        <p><span className="stat-row__big">{r.deliveries}</span> deliveries for 100 orders</p>
        <p><span className="stat-row__big">{r.ordersEmailed}</span> orders emailed</p>
        <p className={r.duplicates ? "is-bad" : "is-good"}><span className="stat-row__big">{r.duplicates}</span> duplicate emails</p>
        <p><span className="stat-row__big">{r.deadLetters}</span> dead letters</p>
      </div>
      <p className="muted">Duplicates come from lost acknowledgements: the work happened, the broker did not hear about it, so it delivers the same message again.</p>
    </LabFrame>
  );
}
