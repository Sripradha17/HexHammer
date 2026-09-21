// MIDDLEWARE 1 of 2: request validation.
//
// I will delete this at Level 5 and rebuild it by hand from memory.
//
// A middleware is a function with three inputs: (req, res, next).
// This one checks that the request has the fields we expect. If not, it calls next(error),
// which skips the rest of the route and jumps to the error-handling middleware.
// If everything is fine, it calls next() with no argument, so the route handler runs.
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../httpError";

// "string" and "boolean" check the type. "numeric" means a string made only of digits
// (URL params like /cards/12 always arrive as strings).
type FieldType = "string" | "boolean" | "numeric";
type Rules = Record<string, FieldType>;

interface Schema {
  params?: Rules;
  body?: Rules;
}

// Returns a sentence describing the first problem, or null when all is fine.
function findProblem(
  values: Record<string, unknown> | undefined,
  rules: Rules,
): string | null {
  for (const field of Object.keys(rules)) {
    const value = values?.[field];
    const wanted = rules[field];

    if (wanted === "numeric") {
      if (typeof value !== "string" || !/^\d+$/.test(value)) {
        return `"${field}" must be a whole number`;
      }
    } else if (typeof value !== wanted) {
      return `"${field}" must be a ${wanted}`;
    }
  }
  return null;
}

export function validate(schema: Schema) {
  // We return the real middleware function. That lets each route say what it needs.
  return (req: Request, _res: Response, next: NextFunction) => {
    const problem =
      (schema.params && findProblem(req.params, schema.params)) ||
      (schema.body && findProblem(req.body, schema.body));

    if (problem) {
      next(new HttpError(400, problem)); // stop here and go to the error handler
      return;
    }
    next(); // all good, carry on to the route
  };
}
