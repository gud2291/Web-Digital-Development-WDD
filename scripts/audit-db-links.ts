/* eslint-disable no-console */
/**
 * READ-ONLY audit of DB-stored external links for the Semrush "broken external
 * links" fix (SEMRUSH-FIXES.md Part 3). Connects with the existing MONGODB_URI +
 * mongoose pattern and ONLY reads — it never writes/updates/deletes anything.
 *
 * It flags:
 *   - Team members with a missing or placeholder LinkedIn URL
 *   - Projects whose live-preview URL is empty, points at the old
 *     webdigitaldevelopment.in domain, or otherwise looks dead
 *
 * Run:  npx tsx scripts/audit-db-links.ts
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
  console.error("✗ MONGODB_URI is not set in .env.local — cannot run the read-only audit.");
  process.exit(1);
}

// Loose, read-only schemas (strict:false) so we never depend on the full model.
const Team = mongoose.models.Team || mongoose.model("Team", new Schema({}, { strict: false, collection: "teams" }));
const Project =
  mongoose.models.Project || mongoose.model("Project", new Schema({}, { strict: false, collection: "projects" }));

function isPlaceholderOrEmptyLinkedIn(url: unknown): boolean {
  const v = String(url ?? "").trim();
  if (!v) return true;
  return /placeholder/i.test(v) || !/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(v);
}

function isSuspectLiveUrl(url: unknown): { bad: boolean; reason: string } {
  const v = String(url ?? "").trim();
  if (!v) return { bad: true, reason: "empty (no live URL)" };
  if (/webdigitaldevelopment\.in/i.test(v)) return { bad: true, reason: "points at old webdigitaldevelopment.in domain" };
  if (/placeholder|example\.com|localhost/i.test(v)) return { bad: true, reason: "placeholder / non-production URL" };
  if (!/^https?:\/\//i.test(v)) return { bad: true, reason: "not an absolute http(s) URL" };
  return { bad: false, reason: "" };
}

async function main() {
  console.log("→ Connecting to MongoDB (read-only audit)…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  const team = await Team.find({}).lean();
  const projects = await Project.find({}).lean();

  console.log("━━━ Team members — LinkedIn ━━━");
  for (const m of team as Array<Record<string, unknown>>) {
    const flag = isPlaceholderOrEmptyLinkedIn(m.linkedinUrl);
    console.log(
      `${flag ? "❌" : "✅"} ${String(m.name ?? "(no name)")} — linkedinUrl: ${JSON.stringify(m.linkedinUrl ?? "")}`
    );
  }

  console.log("\n━━━ Projects — live-preview URL ━━━");
  for (const p of projects as Array<Record<string, unknown>>) {
    const { bad, reason } = isSuspectLiveUrl(p.liveUrl);
    console.log(
      `${bad ? "❌" : "✅"} ${String(p.title ?? "(no title)")} — liveUrl: ${JSON.stringify(p.liveUrl ?? "")}${
        bad ? `  → ${reason}` : ""
      }`
    );
  }

  console.log("\n✓ Audit complete (no data was modified).");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ audit-db-links failed:", err);
  process.exit(1);
});
