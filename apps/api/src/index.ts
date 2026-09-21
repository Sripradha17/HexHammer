// Starts the API server. Local only: no auth, so never expose this to the internet.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";

// Load the .env file that lives at the repo root (before we create the database client).
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const db = new PrismaClient();
const port = Number(process.env.API_PORT ?? 4000);

createApp(db).listen(port, () => {
  console.log(`Hexhammer API is listening on http://localhost:${port}`);
});
