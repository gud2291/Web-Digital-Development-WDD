/* eslint-disable no-console */
/**
 * One-off WRITE script: fix the placeholder LinkedIn URLs on team members
 * (SEMRUSH-FIXES.md Part 3 / SEMRUSH-DB-LINKS.md). Updates ONLY the `linkedinUrl`
 * field of the named team members — nothing else is touched.
 *
 * - Tushar Ahlawat → real LinkedIn URL (tracking params stripped)
 * - Dimple, Sumit Kandpal, Putul Kumari → cleared ("" — no real URL available,
 *   "remove rather than fake")
 *
 * Reads MONGODB_URI from .env.local (same pattern as scripts/audit-db-links.ts).
 * Run:  npx tsx scripts/fix-team-linkedin.ts
 * Safe + idempotent: running it twice produces the same result.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
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

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// name → new linkedinUrl. "" means clear the link (renders no link — safe).
const UPDATES: Record<string, string> = {
  "Tushar Ahlawat": "https://www.linkedin.com/in/tushar-ahlawat-7ab682348",
  Dimple: "",
  "Sumit Kandpal": "",
  "Putul Kumari": "",
};

const Team =
  mongoose.models.Team || mongoose.model("Team", new Schema({}, { strict: false, collection: "teams" }));

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  for (const [name, url] of Object.entries(UPDATES)) {
    const before = await Team.findOne({ name }).select("name linkedinUrl").lean();
    if (!before) {
      console.log(`⚠ Not found: "${name}" (skipped)`);
      continue;
    }
    const res = await Team.updateOne({ name }, { $set: { linkedinUrl: url } });
    console.log(
      `✓ ${name}: ${JSON.stringify((before as Record<string, unknown>).linkedinUrl ?? "")} → ${JSON.stringify(url)}` +
        (res.modifiedCount ? "" : " (already set)")
    );
  }

  console.log("\n✓ Done — only linkedinUrl fields were updated.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ fix-team-linkedin failed:", err);
  process.exit(1);
});
