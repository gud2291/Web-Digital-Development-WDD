/* eslint-disable no-console */
/** Read-only DB export for content audit. Run: npx tsx scripts/export-db-audit.ts */
import mongoose from "mongoose";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf8");
    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}
loadEnvLocal();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const names = (await db.listCollections().toArray()).map((c) => c.name);
  console.log("collections:", names.join(", "));
  mkdirSync("tmp-db-audit", { recursive: true });
  for (const name of names) {
    if (["sessions", "accounts", "users", "inquiries", "registrations"].includes(name)) continue;
    const docs = await db.collection(name).find({}).toArray();
    writeFileSync(`tmp-db-audit/${name}.json`, JSON.stringify(docs, null, 2));
    console.log(`${name}: ${docs.length} docs`);
  }
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
