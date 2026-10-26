// The ONE route in this whole app that actually executes learner code on the server. Every other
// lesson runs entirely inside the learner's own browser (a Web Worker or a sandboxed iframe).
// This route exists only for Level 5 and later, where the lesson is genuinely about server code
// (Express, middleware, real HTTP requests) that cannot be honestly taught any other way.
//
// SECURITY (see the project charter's security rule): this must be local-only, must warn
// clearly, and this app must never be deployed publicly with it switched on. isLocalOnly() below
// is the hard gate: it refuses to run unless BOTH (a) this process was started outside
// NODE_ENV=production, AND (b) the request physically arrived from this same machine's own
// loopback address (127.0.0.1 / ::1), never a real network hop. Losing either check refuses the
// request with 403, before any learner code is ever touched.
//
// I will delete this at Level 5 and rebuild it by hand from memory, alongside the middleware in
// apps/api/src/middleware (see the Rebuild Lab in the README).
import { Router, type Request } from "express";
import { validate } from "../middleware/validate";
import { runServerCode } from "./runServerCode";

export function isLocalOnly(req: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const address = req.socket.remoteAddress ?? "";
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

export function createServerRunnerRouter() {
  const router = Router();

  router.post(
    "/run-server-code",
    validate({ body: { code: "string", tests: "string" } }),
    async (req, res) => {
      if (!isLocalOnly(req)) {
        res.status(403).json({
          error:
            "The server code runner only ever runs locally, in development, from this same computer. Refusing.",
        });
        return;
      }
      const result = await runServerCode(req.body.code, req.body.tests);
      res.json(result);
    },
  );

  return router;
}
