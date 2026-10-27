// Builds the Express app. It is a function that takes the database, so tests can pass in a fake one.
// `fetchImpl` is how the Tech Radar reaches the internet; tests pass a fake so they never go online.
import express from "express";
import type { PrismaClient } from "@prisma/client";
import { createRouter } from "./routes";
import { createServerRunnerRouter } from "./serverRunner/serverRunnerRoute";
import { createSqlRunnerRouter } from "./serverRunner/sqlRunnerRoute";
import { createAtlasRouter } from "./atlas/atlasRoutes";
import { createProjectRouter } from "./projects/projectRoutes";
import { createRadarRouter } from "./radar/radarRoutes";
import type { FetchLike } from "./radar/connectors";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(db: PrismaClient, fetchImpl: FetchLike = fetch as unknown as FetchLike) {
  const app = express();

  app.use(express.json({ limit: "200kb" })); // read JSON request bodies into req.body (with a size limit)
  app.use(createServerRunnerRouter()); // Level 5+: runs real Express code, local-only
  app.use(createSqlRunnerRouter()); // Level 5+: runs SQL in-memory, local-only
  app.use(createRouter(db)); // levels, strikes, flashcards, streak
  app.use(createAtlasRouter(db)); // the 16-domain Atlas: map, topics, reviews, interview, analytics
  app.use(createProjectRouter(db)); // Project Workshop + Portfolio
  app.use(createRadarRouter(db, fetchImpl)); // Technology Radar
  app.use((_req, res) => res.status(404).json({ error: "No such API route." })); // nothing matched
  app.use(errorHandler); // LAST: catches every error from the routes above

  return app;
}
