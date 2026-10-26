// Shared plumbing behind BOTH server-side runners (the real Express one in runServerCode.ts and
// the in-memory SQL one in runSqlCode.ts): fork the given entry script, wait for it to either
// process.send() one result message or time out, and always kill the child afterwards. The two
// runners differ only in what files they write into the temp folder beforehand; this part —
// fork, wait, time out, clean up — is identical either way, so it lives here once.
import { fork } from "node:child_process";

export interface ForkResult {
  results: { name: string; passed: boolean; message: string }[];
  consoleLines: string[];
  error: string | null;
  timedOut: boolean;
}

export function forkAndCollect(
  entryPath: string,
  argv: string[],
  cwd: string,
  timeoutMs: number,
): Promise<ForkResult> {
  return new Promise((resolve) => {
    const child = fork(entryPath, argv, { cwd, silent: true });
    let settled = false;

    const finish = (result: ForkResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.removeAllListeners();
      child.kill();
      resolve(result);
    };

    // If the child is still busy after the timeout (an endless loop? a hung request?), give up.
    const timer = setTimeout(() => {
      finish({ results: [], consoleLines: [], error: null, timedOut: true });
    }, timeoutMs);

    child.on("message", (message) => {
      const data = message as Omit<ForkResult, "timedOut">;
      finish({ ...data, timedOut: false });
    });

    child.on("error", (error) => {
      finish({
        results: [],
        consoleLines: [],
        error: "The runner had a problem: " + error.message,
        timedOut: false,
      });
    });

    child.on("exit", (exitCode) => {
      // The child normally reports via "message" first and then exits 0. If it exits WITHOUT
      // ever sending a message, something crashed before its own try/catch could run at all
      // (a native error, a bad import) — that is still a real answer, not a hang.
      if (exitCode !== 0) {
        finish({
          results: [],
          consoleLines: [],
          error: "The runner process crashed unexpectedly before it could report anything.",
          timedOut: false,
        });
      }
    });
  });
}
