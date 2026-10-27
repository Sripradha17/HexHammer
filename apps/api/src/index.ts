// Starts the API server. Local only: no auth, so never expose this to the internet.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { startRadarScheduler } from "./radar/scheduler";
import type { FetchLike } from "./radar/connectors";

// Load the .env file that lives at the repo root (before we create the database client).
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const db = new PrismaClient();
const port = Number(process.env.API_PORT ?? 4000);

createApp(db).listen(port, () => {
  console.log(`Hexhammer API is listening on http://localhost:${port}`);
  // The Tech Radar checks due sources every 15 minutes, but ONLY while this process runs.
  // Set RADAR_SCHEDULER=off in .env to disable it (manual "check now" still works).
  if (process.env.RADAR_SCHEDULER !== "off") {
    startRadarScheduler(db, fetch as unknown as FetchLike);
    console.log("Tech Radar scheduler started (runs only while the API is running).");
  }
});
