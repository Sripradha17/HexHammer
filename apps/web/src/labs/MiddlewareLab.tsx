// MIDDLEWARE PIPELINE LAB: put the stages in an order, send requests, watch what runs.
// The pipeline is a real (tiny) use()/next() runner written below, the same idea Express uses.
import { useState } from "react";
import { Button } from "@hexhammer/design-system";
import { LabFrame, move, useGoal, type LabProps } from "./shared";

interface Req {
  token: boolean;
  validBody: boolean;
  handlerThrows: boolean;
}
interface Ctx {
  req: Req;
  requestId?: string;
  userId?: string;
  status?: number;
  body?: string;
  log: string[];
  ran: string[];
  headers: Record<string, string>;
}
type Stage = { id: string; label: string; error?: boolean; run: (ctx: Ctx, next: (err?: Error) => void, err?: Error) => void };

const STAGES: Record<string, Stage> = {
  requestId: { id: "requestId", label: "Request id", run: (c, next) => ((c.requestId = "req-7f3c"), (c.headers["x-request-id"] = "req-7f3c"), next()) },
  logger: {
    id: "logger",
    label: "Logger (logs when it runs)",
    run: (c, next) => {
      c.log.push(JSON.stringify({ msg: "request", requestId: c.requestId ?? null, userId: c.userId ?? null }));
      next();
    },
  },
  auth: {
    id: "auth",
    label: "Auth (needs a token)",
    run: (c, next) => {
      if (!c.req.token) {
        c.status = 401;
        c.body = '{"error":"Unauthorized"}';
        return; // short-circuit: respond, do NOT call next()
      }
      c.userId = "user-42";
      next();
    },
  },
  validate: {
    id: "validate",
    label: "Validate body",
    run: (c, next) => {
      if (!c.req.validBody) {
        c.status = 400;
        c.body = '{"error":"title is required"}';
        return;
      }
      next();
    },
  },
  handler: {
    id: "handler",
    label: "Route handler",
    run: (c, next) => {
      if (c.req.handlerThrows) return next(new Error("database timeout"));
      c.status = 200;
      c.body = '{"ok":true}';
    },
  },
  errors: {
    id: "errors",
    label: "Error handler (err, req, res, next)",
    error: true,
    run: (c, _next, err) => {
      c.status = 500;
      c.body = JSON.stringify({ error: "Something went wrong", requestId: c.requestId ?? null, detail: err ? "hidden from clients" : undefined });
    },
  },
};

// The runner: call each stage in order. A stage calls next() to continue, next(err) to jump to the
// next ERROR stage, or responds and stops. Error stages are skipped while there is no error.
export function runPipeline(order: string[], req: Req): Ctx {
  const ctx: Ctx = { req, log: [], ran: [], headers: {} };
  let index = 0;
  function next(err?: Error) {
    while (index < order.length) {
      const stage = STAGES[order[index++]];
      if (Boolean(stage.error) !== Boolean(err)) continue; // skip stages of the other kind
      ctx.ran.push(stage.id);
      stage.run(ctx, next, err);
      return;
    }
    if (err && ctx.status === undefined) {
      ctx.status = 500;
      ctx.body = "<pre>Error: database timeout\n    at handler (app.js:31)</pre>  ← framework default page leaks a stack trace";
    }
    if (ctx.status === undefined) {
      ctx.status = 404;
      ctx.body = "Cannot GET /notes (no stage responded)";
    }
  }
  next();
  return ctx;
}

const REQUESTS: { name: string; req: Req }[] = [
  { name: "No token", req: { token: false, validBody: true, handlerThrows: false } },
  { name: "Token, invalid body", req: { token: true, validBody: false, handlerThrows: false } },
  { name: "Token, valid body", req: { token: true, validBody: true, handlerThrows: false } },
  { name: "Token, handler throws", req: { token: true, validBody: true, handlerThrows: true } },
];

export default function MiddlewareLab({ onGoal }: LabProps) {
  const [order, setOrder] = useState(["logger", "validate", "auth", "handler", "errors", "requestId"]);
  const [selected, setSelected] = useState(0);
  const results = REQUESTS.map((r) => runPipeline(order, r.req));
  const r = results[selected];

  // The goal, checked against ALL four requests (not just the one on screen).
  const anonOk = results[0].status === 401 && !results[0].ran.includes("validate");
  const userLogged = results[2].status === 200 && results[2].log.some((l) => l.includes('"userId":"user-42"'));
  const idEverywhere = results.every((x) => x.headers["x-request-id"]);
  const errorsHandled = results[3].status === 500 && results[3].ran.includes("errors");
  const goal = useGoal(anonOk && userLogged && idEverywhere && errorsHandled, `Order: ${order.join(" → ")}`, onGoal);

  return (
    <LabFrame title="Middleware pipeline" note="A real, tiny use()/next() runner (code in this lab's source). Reorder with the arrow buttons; every request below is re-run instantly." goalMet={goal}>
      <ol className="pipeline" aria-label="Pipeline order">
        {order.map((id, i) => (
          <li key={id} className={`pipeline__stage ${r.ran.includes(id) ? "is-ran" : ""}`}>
            <span className="pipeline__num">{i + 1}</span>
            <span className="pipeline__label">{STAGES[id].label}</span>
            <span className="pipeline__ran">{r.ran.includes(id) ? "ran" : "skipped"}</span>
            <span className="pipeline__moves">
              <button type="button" className="icon-btn" aria-label={`Move ${STAGES[id].label} up`} disabled={i === 0} onClick={() => setOrder(move(order, i, -1))}>Up</button>
              <button type="button" className="icon-btn" aria-label={`Move ${STAGES[id].label} down`} disabled={i === order.length - 1} onClick={() => setOrder(move(order, i, 1))}>Down</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="lab__controls" role="group" aria-label="Which request to show">
        {REQUESTS.map((q, i) => (
          <button key={q.name} type="button" className="hh-chip" aria-pressed={i === selected} onClick={() => setSelected(i)}>
            {q.name}
          </button>
        ))}
      </div>
      <div className="lab__readout" aria-live="polite">
        <p><strong>Status {r.status}</strong> · body <code>{r.body}</code></p>
        <p>x-request-id header: <code>{r.headers["x-request-id"] ?? "missing"}</code></p>
        <p>Log lines: {r.log.length ? r.log.map((l) => <code key={l}>{l} </code>) : <span className="muted">none</span>}</p>
      </div>
      <ul className="goal-checks">
        <li className={anonOk ? "is-met" : ""}>{anonOk ? "Done:" : "To do:"} No token → 401, and the validator never runs</li>
        <li className={userLogged ? "is-met" : ""}>{userLogged ? "Done:" : "To do:"} A logged-in request's log line includes its user id</li>
        <li className={idEverywhere ? "is-met" : ""}>{idEverywhere ? "Done:" : "To do:"} Every response carries an x-request-id</li>
        <li className={errorsHandled ? "is-met" : ""}>{errorsHandled ? "Done:" : "To do:"} A thrown error reaches the error handler (no stack trace leaked)</li>
      </ul>
      <Button variant="ghost" size="small" onClick={() => setOrder(["logger", "validate", "auth", "handler", "errors", "requestId"])}>Reset order</Button>
    </LabFrame>
  );
}
