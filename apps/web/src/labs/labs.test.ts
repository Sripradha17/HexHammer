// Tests for the labs' logic. Each lab claims to compute something real; these check the claims, and
// check that every lab GOAL is actually reachable (an impossible goal would be a broken promise).
import { describe, expect, it } from "vitest";
import { simulate } from "./EventLoopLab";
import { replay, makePattern } from "./CacheLab";
import { contrast } from "./ContrastLab";
import { runPipeline as runMiddleware } from "./MiddlewareLab";
import { runPipeline as runCi } from "./CiPipelineLab";
import { runGlued } from "./InjectionLab";
import { join, groupCount } from "./SqlJoinLab";
import { runQueue } from "./QueueLab";
import { journey } from "./HttpJourneyLab";
import { makeTraces, percentile } from "./LogTraceLab";
import { step } from "./DecisionBoundaryLab";
import { chunk, rank } from "./RagLab";
import { cosine, embed, sharedWords } from "./embeddingModel";
import { outcome } from "./PromptInjectionLab";

describe("event loop simulator", () => {
  it("prints the classic puzzle in the order real JavaScript does", () => {
    const ops = [{ log: "A" }, { timeout: [{ log: "B" }] }, { then: [{ log: "C" }] }, { microtask: [{ log: "D" }] }, { asyncFn: [{ log: "E" }, { await: true as const }, { log: "F" }] }, { log: "G" }];
    expect(simulate(ops).at(-1)!.output.join("")).toBe("AEGCDFB");
  });
  it("runs microtasks queued by microtasks before earlier timers", () => {
    const ops = [{ timeout: [{ log: "1" }] }, { then: [{ log: "2" }, { timeout: [{ log: "3" }] }, { then: [{ log: "4" }] }] }, { log: "5" }];
    expect(simulate(ops).at(-1)!.output.join(" ")).toBe("5 2 4 1 3");
  });
});

describe("cache", () => {
  it("a full scan through a slightly-too-small LRU never hits", () => {
    expect(replay(makePattern("scan"), 59).hits).toBe(0);
  });
  it("the hot-products goal (60% hit rate) is reachable", () => {
    const capacity = [...Array(60).keys()].map((c) => c + 1).find((c) => replay(makePattern("hot"), c).hitRate >= 0.6);
    expect(capacity).toBeDefined();
    expect(capacity!).toBeLessThan(60);
  });
});

describe("contrast", () => {
  it("matches the known WCAG values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });
  it("a grey between 4.5 and 5:1 on the dark surface exists (goal reachable)", () => {
    const greys = [...Array(256).keys()].map((v) => `#${v.toString(16).padStart(2, "0").repeat(3)}`);
    expect(greys.some((g) => contrast(g, "#10131a") >= 4.5 && contrast(g, "#10131a") <= 5)).toBe(true);
  });
});

describe("middleware runner", () => {
  const order = ["requestId", "auth", "logger", "validate", "handler", "errors"];
  it("short-circuits auth and never runs the validator", () => {
    const r = runMiddleware(order, { token: false, validBody: true, handlerThrows: false });
    expect(r.status).toBe(401);
    expect(r.ran).toEqual(["requestId", "auth"]);
  });
  it("routes a thrown error to the error handler, skipping nothing else", () => {
    expect(runMiddleware(order, { token: true, validBody: true, handlerThrows: true }).status).toBe(500);
  });
  it("leaks a stack trace page when the error handler comes too early", () => {
    const bad = runMiddleware(["errors", "requestId", "auth", "handler"], { token: true, validBody: true, handlerThrows: true });
    expect(bad.body).toContain("stack trace");
  });
});

describe("CI pipeline", () => {
  it("a good order blocks all bugs with an average under 5 minutes (goal reachable)", () => {
    const r = runCi(["lint", "types", "security", "unit", "integration"]);
    expect(r.every((x) => x.caughtAt)).toBe(true);
    expect(r.reduce((n, x) => n + x.minutes, 0) / r.length).toBeLessThan(5);
  });
  it("an e2e-only pipeline lets bugs escape", () => {
    expect(runCi(["e2e"]).filter((x) => !x.caughtAt).length).toBeGreaterThan(0);
  });
});

describe("injection evaluator", () => {
  it("glued input can return every row", () => {
    expect(runGlued("x' OR '1'='1").rows).toHaveLength(3);
  });
  it("a normal email returns one row and a stray quote is a syntax error", () => {
    expect(runGlued("ada@example.com").rows).toHaveLength(1);
    expect(runGlued("o'brien").rows).toBeNull();
  });
});

describe("SQL join lab", () => {
  it("matches the pg-mem-verified results in the lesson", () => {
    expect(groupCount(join("left"), "column")).toEqual([{ name: "Ada", book_count: 2 }, { name: "Grace", book_count: 1 }, { name: "Linus", book_count: 0 }]);
    expect(groupCount(join("left"), "star").find((r) => r.name === "Linus")!.book_count).toBe(1);
  });
});

describe("queue lab", () => {
  it("lost acks cause duplicates unless the consumer is idempotent", () => {
    expect(runQueue({ lostAckRate: 0.3, idempotent: false, crashRate: 0 }).duplicates).toBeGreaterThan(0);
    const safe = runQueue({ lostAckRate: 0.3, idempotent: true, crashRate: 0 });
    expect(safe.duplicates).toBe(0);
    expect(safe.ordersEmailed).toBe(100);
  });
});

describe("http journey", () => {
  it("a fresh cached repeat skips the network entirely", () => {
    const p = journey({ dnsCached: true, keepAlive: true, cache: "fresh", first: false, serverMs: 40, rttMs: 40, bodyKb: 100 });
    expect(p.reduce((n, x) => n + x.ms, 0)).toBe(0);
  });
  it("keep-alive removes both handshakes on a repeat", () => {
    const p = journey({ dnsCached: true, keepAlive: true, cache: "none", first: false, serverMs: 40, rttMs: 40, bodyKb: 100 });
    expect(p.find((x) => x.name === "TCP handshake")!.ms).toBe(0);
    expect(p.find((x) => x.name === "TLS handshake")!.ms).toBe(0);
  });
});

describe("logs and traces", () => {
  it("has slow requests above 800 ms that push p99 far above p50", () => {
    const totals = makeTraces().map((t) => t.totalMs);
    expect(percentile(totals, 99)).toBeGreaterThan(800);
    expect(percentile(totals, 50)).toBeLessThan(150);
  });
});

describe("decision boundary", () => {
  const pts = [
    { x: 0.2, y: 0.2, label: 0 as const },
    { x: 0.3, y: 0.4, label: 0 as const },
    { x: 0.7, y: 0.6, label: 1 as const },
    { x: 0.8, y: 0.8, label: 1 as const },
    { x: 0.45, y: 0.5, label: 1 as const },
    { x: 0.55, y: 0.45, label: 0 as const },
  ];
  it("gradient descent lowers the loss with a sensible learning rate", () => {
    let w: [number, number, number] = [0, 0, 0];
    const first = step(w, pts, 1).loss;
    for (let i = 0; i < 200; i++) w = step(w, pts, 1).w;
    expect(step(w, pts, 1).loss).toBeLessThan(first);
  });
});

describe("RAG and embeddings", () => {
  it("some retrieval setting finds all five sources in the top 3 (goal reachable)", () => {
    const qs = [
      ["How long until I get my money back?", "refunds"],
      ["Can I get reimbursed for an ebook I already downloaded?", "refunds"],
      ["When will my parcel arrive?", "shipping"],
      ["Someone stole my login, what do I do?", "account"],
      ["My order came smashed", "damaged"],
    ];
    const settings = (["keyword", "semantic", "hybrid"] as const).flatMap((m) => [1, 2, 3].map((s) => [m, s] as const));
    const works = settings.filter(([m, s]) => qs.every(([q, doc]) => rank(q, chunk(s), m).slice(0, 3).some((c) => c.doc === doc)));
    expect(works.length).toBeGreaterThan(0);
    // ...and pure keyword search is NOT enough at the smallest chunk size (that is the lesson).
    expect(works.some(([m, s]) => m === "keyword" && s === 1)).toBe(false);
  });
  it("refund and reimbursement are close in meaning with no shared words", () => {
    expect(cosine(embed("How do I get a refund?"), embed("Where is my reimbursement?"))).toBeGreaterThan(0.8);
    expect(sharedWords("How do I get a refund?", "Where is my reimbursement?")).toEqual([]);
  });
});

describe("prompt injection defences", () => {
  it("code defences stop every attack even when the model is fully fooled", () => {
    const all = { delimit: false, allowList: true, validateArgs: true, approval: true, noRemoteImages: true };
    const doc = { name: "x", text: "", injected: { tool: "sendEmail", args: { to: "ops@example.com", body: "payroll" } }, obvious: false };
    expect(outcome(doc, all).result).toBe("approval");
    expect(outcome({ ...doc, injected: { tool: "deleteFiles", args: {} } }, all).result).toBe("blocked");
  });
  it("delimiting alone does not stop a disguised attack", () => {
    const d = { delimit: true, allowList: false, validateArgs: false, approval: false, noRemoteImages: false };
    const doc = { name: "x", text: "", injected: { tool: "sendEmail", args: { to: "a@attacker.example", body: "" } }, obvious: false };
    expect(outcome(doc, d).result).toBe("action");
  });
});
