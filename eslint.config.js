// ESLint (flat config). Small on purpose: recommended rules + React hooks rules.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "apps/api/prisma/migrations/**",
      // Generated vendor bundle (React + ReactDOM + Babel standalone), rebuilt by
      // apps/web/scripts/build-react-env.mjs. Never hand-edited, never linted.
      "apps/web/public/react-env.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["apps/api/**/*.ts", "apps/api/**/*.mjs", "apps/web/scripts/**/*.mjs", "*.config.{js,ts}", "scripts/**/*.mjs", "e2e/**/*.ts", "packages/content/scripts/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    // The screenshot script runs some code inside the browser page (page.evaluate).
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
