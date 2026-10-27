// npm run radar:validate
// Fetches every registered radar source ONCE and records whether it really works (valid/invalid).
// Needs internet access. Prints an honest table of results; nothing is assumed.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { validateSource } from "./validateSource";
import type { FetchLike } from "./connectors";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });
const db = new PrismaClient();

async function main() {
  const sources = await db.techSource.findMany({ orderBy: { id: "asc" } });
  for (const source of sources) {
    const check = await validateSource(source.url, source.kind, fetch as unknown as FetchLike);
    await db.techSource.update({
      where: { id: source.id },
      data: { validationStatus: check.ok ? "valid" : "invalid", lastValidatedAt: new Date(), lastError: check.ok ? null : check.detail },
    });
    await db.auditLog.create({ data: { actor: "system", action: "validate-source", entity: "TechSource", entityId: String(source.id), detail: { ok: check.ok, detail: check.detail } } });
    console.log(`${check.ok ? "VALID  " : "INVALID"}  ${source.name.padEnd(45)} ${check.detail}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
