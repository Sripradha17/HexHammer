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
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Anything else is a surprise (a bug). Log it for me, but do not leak details to the client.
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
}
