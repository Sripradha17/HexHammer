import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s32",
  level: 5,
  order: 32,
  title: "File uploads",
  runner: "server",

  look: `A file upload arrives as multipart/form-data, a different shape from the plain JSON bodies you have been reading with express.json() all level. multer is the standard middleware for parsing it: it reads the incoming file into req.file, ready to use.

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 } });
  app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ bytes: req.file.size });
  });

upload.single("file") expects ONE file, sent under the field name "file". limits: { fileSize: 1000 } caps it at 1000 bytes — multer itself refuses anything larger BEFORE your route even runs, by triggering an error that reaches your error-handling middleware.`,

  type: `Finish POST /upload:
1. Register upload.single("file") as middleware for this one route (right before its own handler).
2. Inside the handler, respond 201 with JSON { bytes: req.file.size, name: req.file.originalname }.`,

  break: `Break it on purpose: register upload.single("file") with app.use(...) instead of scoping it to just this one route. Now EVERY route in the app expects a multipart upload before it can run, including ones that were never meant to receive a file at all. Scope it to the one route that actually needs it, as an extra argument right before that route's own handler.`,

  say: `In one sentence: what does the limits option on multer actually protect your server from?`,

  starterCode: `import express from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 } });

export function buildApp() {
  const app = express();

  app.post("/upload", (req, res) => {
    // your code here
  });

  app.use((err, req, res, next) => {
    res.status(413).json({ error: "File too big" });
  });

  return app;
}
`,

  tests: `test("a small file uploads successfully", async () => {
  const res = await request(buildApp())
    .post("/upload")
    .attach("file", Buffer.from("hello world"), "test.txt");
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ bytes: 11, name: "test.txt" });
});

test("a file over the size limit is refused with 413", async () => {
  const res = await request(buildApp())
    .post("/upload")
    .attach("file", Buffer.alloc(2000, "x"), "big.txt");
  expect(res.status).toBe(413);
  expect(res.body).toEqual({ error: "File too big" });
});
`,

  hints: [
    'Add upload.single("file") as a second argument to app.post, right before the route\'s own handler function.',
    "req.file.size is the real byte count multer already worked out for you.",
    "res.status(201).json({ bytes: req.file.size, name: req.file.originalname });",
  ],

  solution: `=== CODE ===
import express from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 } });

export function buildApp() {
  const app = express();

  app.post("/upload", upload.single("file"), (req, res) => {
    res.status(201).json({ bytes: req.file.size, name: req.file.originalname });
  });

  app.use((err, req, res, next) => {
    res.status(413).json({ error: "File too big" });
  });

  return app;
}
=== LINE BY LINE ===
upload.single("file"), scoped to just this ONE route, runs BEFORE the route's own handler: by the time your code runs, req.file already exists, fully parsed, with size and originalname ready to read.
When a file is over limits.fileSize, multer itself throws an error before your route ever runs, which Express 5 routes straight to the error-handling middleware — the same four-parameter pattern from the error-handling strike, just triggered by multer instead of your own code this time.
memoryStorage() keeps the uploaded file in memory (in req.file.buffer, not used here) rather than writing it to disk — a reasonable choice for a small file you are about to process and discard, though a real app handling large files would usually stream to disk or straight to cloud storage instead.`,
};
