// MIDDLEWARE 2 of 2: the central error handler.
//
// I will delete this at Level 5 and rebuild it by hand from memory.
//
// Express knows this is an error handler because it has FOUR inputs: (err, req, res, next).
// It must be added LAST, after all the routes. Any error passed to next(err), or thrown inside
// a route, ends up here. One place, one reply format: { error: "message" }.
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../httpError";

// Express needs all four inputs to treat this as an error handler, even though we do not use `next`.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    // An error we threw on purpose (like "not found"): safe to show its message.
    res.status(err.status).json(err.fields ? { error: err.message, fields: err.fields } : { error: err.message });
    return;
  }

  // express.json() could not read the body (broken JSON). That is the client's mistake: 400, not 500.
  if ((err as { type?: string })?.type === "entity.parse.failed") {
    res.status(400).json({ error: "The request body is not valid JSON." });
    return;
  }

  // Anything else is a surprise (a bug). Log it for me, but do not leak details to the client.
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
}
