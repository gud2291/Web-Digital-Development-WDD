/* eslint-disable no-console */
/**
 * Clear-content script — DELETES all content seeded by scripts/seed-content.ts
 * so you can re-seed cleanly.
 *
 * Run:  npx tsx scripts/clear-content.ts
 *
 * Requires an exact typed confirmation ("YES DELETE ALL") before it touches
 * anything. Only the content collections are wiped — Admin, Contact (inquiries)
 * and Media are deliberately left untouched.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";
import mongoose from "mongoose";

// ─── Env loading (mirrors scripts/seed.ts) ───────────────────────────────────
function loadEnvLocal() {
  const candidates = [".env.local", ".env"];
  for (const name of candidates) {
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}
loadEnvLocal();

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set (check .env.local)");
  process.exit(1);
}

// Collections written by seed-content.ts (mongoose default pluralised names).
const COLLECTIONS = [
  "settings",
  "sitecontents",
  "homepages",
  "services",
  "projects",
  "teams",
  "testimonials",
  "registrations",
  "blogs",
  "legalpages",
  "seometas",
  "chatbots",
];

function confirm(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (answer) => { rl.close(); res(answer); }));
}

async function main() {
  console.log("⚠ This will DELETE all seeded content from these collections:");
  console.log(`  ${COLLECTIONS.join(", ")}`);
  console.log("  (Admin, Contact/inquiries and Media are NOT touched.)\n");

  process.stdout.write("Type 'YES DELETE ALL' to confirm: ");
  const answer = await confirm("");

  if (answer !== "YES DELETE ALL") {
    console.log("✗ Confirmation did not match. Aborted — nothing was deleted.");
    process.exit(0);
  }

  console.log("\n→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  console.log("✓ Connected\n");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("✗ No database handle available");
    process.exit(1);
  }

  let totalDeleted = 0;
  for (const name of COLLECTIONS) {
    try {
      const exists = await db.listCollections({ name }).hasNext();
      if (!exists) {
        console.log(`  – ${name}: collection does not exist, skipped`);
        continue;
      }
      const { deletedCount } = await db.collection(name).deleteMany({});
      totalDeleted += deletedCount ?? 0;
      console.log(`  ✓ ${name}: deleted ${deletedCount} document(s)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
    }
  }

  await mongoose.disconnect();
  console.log(`\n✓ Done — ${totalDeleted} document(s) deleted in total.`);
}

main().catch((err) => {
  console.error("✗ Clear failed:", err);
  process.exit(1);
});
