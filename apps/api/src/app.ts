// Builds the Express app. It is a function that takes the database, so tests can pass in a fake one.
import express from "express";
import type { PrismaClient } from "@prisma/client";
import { createRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(db: PrismaClient) {
  const app = express();

  app.use(express.json()); // read JSON request bodies into req.body
  app.use(createRouter(db)); // all the routes
  app.use(errorHandler); // LAST: catches every error from the routes above

  return app;
}
