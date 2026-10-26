import { defineConfig } from "vitest/config";

// Several test files here (runServerCode.test.ts, runSqlCode.test.ts, level5Content.test.ts,
// level5SqlContent.test.ts, ...) fork REAL child processes and share one temp folder
// (apps/api/.runner-tmp). Vitest runs different test FILES in parallel by default, which lets
// two files race on that shared folder at the same moment (one file's "did my run clean up?"
// check can catch another file's run mid-flight). Running files one at a time avoids that.
export default defineConfig({
  test: {
    fileParallelism: false,
  },
});
