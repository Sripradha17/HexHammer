// This file is the Web Worker. It runs in its own thread, away from the page.
// It waits for one message {code, tests}, runs it, and sends the results back.
import { executeLesson } from "./execute";

self.onmessage = async (event: MessageEvent<{ code: string; tests: string }>) => {
  const { code, tests } = event.data;
  self.postMessage(await executeLesson(code, tests));
};
