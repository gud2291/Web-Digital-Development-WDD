/* eslint-disable no-console */
/** Locate banned tokens in DB docs (read-only). Run: npx tsx scripts/find-banned.ts */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
for (const name of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) continue;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const banned = [/₹/u, /\bfree\b/i, /\bWDD\b/, /pricing/i, /affordable/i, /\bbudget/i, /\bquote/i, /\bcost/i, /\bprice/i];

function walk(obj: unknown, path: string, hits: string[]) {
  if (typeof obj === "string") {
    for (const b of banned) {
      const m = obj.match(b);
      if (m) {
        const i = obj.search(b);
        hits.push(`${path}: …${obj.slice(Math.max(0, i - 40), i + 50).replace(/\n/g, " ")}…`);
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, `${path}[${i}]`, hits));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      for (const b of banned) if (b.test(k)) { /* key names not rendered — ignore */ }
      walk(v, `${path}.${k}`, hits);
    }
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  for (const coll of ["homepages", "sitecontents", "services", "chatbots", "settings", "blogs", "legalpages", "seometas", "testimonials", "projects", "teams"]) {
    const docs = await db.collection(coll).find({}).toArray();
    const hits: string[] = [];
    docs.forEach((d, i) => walk(d, `${coll}[${i}]`, hits));
    if (hits.length) console.log(hits.join("\n"));
  }
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
