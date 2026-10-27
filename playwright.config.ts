// End-to-end tests: a real browser drives the real app. They run against their OWN API (port 4190)
// and their OWN throwaway database schema (hexhammer_e2e), so my real progress is never touched.
// Needs Docker's PostgreSQL running. Run: npm run test:e2e
import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env" });
const e2eDatabaseUrl = (process.env.DATABASE_URL ?? "").replace(/schema=[^&]+/, "schema=hexhammer_e2e");

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false, // the journeys build on each other's data, in order
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./e2e/globalSetup.ts",
  use: {
    baseURL: "http://localhost:5190",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    {
      command: "npx tsx apps/api/src/index.ts",
      port: 4190,
      reuseExistingServer: false,
      env: { DATABASE_URL: e2eDatabaseUrl, API_PORT: "4190", RADAR_SCHEDULER: "off" },
      timeout: 120_000,
    },
    {
      command: "npx vite --port 5190 --strictPort",
      cwd: "apps/web",
      port: 5190,
      reuseExistingServer: false,
      env: { API_URL: "http://localhost:4190" },
      timeout: 120_000,
    },
  ],
});
