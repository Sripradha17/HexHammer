// The SQL twin of serverRunnerRoute.ts. Same hard local-only gate (isLocalOnly, imported from
// there rather than duplicated), same shape of request/response — the only real difference is
// what runs underneath: an in-memory database instead of a real Express app, so this route is
// safe even in ways the Express one is not (see runSqlCode.ts).
import { Router } from "express";
import { validate } from "../middleware/validate";
import { isLocalOnly } from "./serverRunnerRoute";
import { runSqlCode } from "./runSqlCode";

export function createSqlRunnerRouter() {
  const router = Router();

  router.post(
    "/run-sql-code",
    validate({ body: { code: "string", seedSql: "string", tests: "string" } }),
    async (req, res) => {
      if (!isLocalOnly(req)) {
        res.status(403).json({
          error:
            "The SQL runner only ever runs locally, in development, from this same computer. Refusing.",
        });
        return;
      }
      const result = await runSqlCode(req.body.code, req.body.seedSql, req.body.tests);
      res.json(result);
    },
  );

  return router;
}
