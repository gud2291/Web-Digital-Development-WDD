/* eslint-disable no-console */
/** Surgical fix: replace ONLY the `excerpt` of blog "website-maintenance-cost-india".
 *  The old excerpt near-verbatim restated the body's snippet-ready opening sentence,
 *  and the blog template renders excerpt directly above content — duplicate opener.
 *  Touches nothing else. Run: npx tsx scripts/fix-maintenance-cost-excerpt.ts */
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
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const slug = "website-maintenance-cost-india";

const newExcerpt =
  "Wondering what a website actually costs to maintain in India? Here's the full 2026 breakdown — what you're really paying for, real price tables by site type, and what skipping maintenance ends up costing instead.";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  const before: any = await db.collection("blogs").findOne({ slug }, { projection: { excerpt: 1 } });
  if (!before) {
    console.error("✗ blog not found:", slug);
    process.exit(1);
  }
  console.log("BEFORE excerpt:", JSON.stringify(before.excerpt));

  await db.collection("blogs").updateOne(
    { slug },
    { $set: { excerpt: newExcerpt, updatedAt: new Date() } }
  );

  const after: any = await db.collection("blogs").findOne({ slug }, { projection: { excerpt: 1, title: 1, published: 1 } });
  console.log("AFTER excerpt:", JSON.stringify(after.excerpt));
  console.log("✓ updated | title:", after.title, "| published:", after.published,
    "| excerpt changed:", after.excerpt === newExcerpt);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
