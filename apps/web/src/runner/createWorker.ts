// Makes the real browser Web Worker. Kept in its own file so tests never need a real Worker.
import type { WorkerLike } from "./runCode";

export function createWorker(): WorkerLike {
  return new Worker(new URL("./runner.worker.ts", import.meta.url), {
    type: "module",
  }) as unknown as WorkerLike;
}
