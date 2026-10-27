// Before the end-to-end run: build a fresh, empty test schema (hexhammer_e2e) with the real
// migrations and seed. Refuses to run against any other schema.
import { execSync } from "node:child_process";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

export default async function globalSetup() {
  config({ path: ".env" });
  const url = (process.env.DATABASE_URL ?? "").replace(/schema=[^&]+/, "schema=hexhammer_e2e");
  if (!url.includes("schema=hexhammer_e2e")) throw new Error("Refusing to run: DATABASE_URL has no schema parameter to replace.");
  const db = new PrismaClient({ datasourceUrl: url });
  await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS hexhammer_e2e CASCADE");
  await db.$disconnect();
  const env = { ...process.env, DATABASE_URL: url };
  execSync("npx prisma migrate deploy", { env, stdio: "ignore" });
  execSync("npx tsx prisma/seed.ts", { env, stdio: "ignore", cwd: "apps/api" });
}
