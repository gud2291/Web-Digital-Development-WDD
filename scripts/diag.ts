/* eslint-disable no-console */
/**
 * Diagnostic — connects with the SAME MONGODB_URI the app resolves through
 * src/config/env.ts (process.env.MONGODB_URI from .env.local) and reports the
 * live DB name/host plus the exact docs the homepage renders from.
 *
 * Run: npx tsx scripts/diag.ts
 */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
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
  await mongoose.connect(process.env.MONGODB_URI as string, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });
  const conn = mongoose.connection;
  const db = conn.db!;

  console.log("DB NAME :", db.databaseName);
  console.log("HOST    :", conn.host);

  const homepagesCount = await db.collection("homepages").countDocuments();
  console.log("homepages docs:", homepagesCount);

  // Mirror app's getHomepage(): Homepage.findOne({})
  const home = await db.collection("homepages").findOne<any>({});
  console.log("heroSlides titles:", JSON.stringify((home?.heroSlides ?? []).map((s: any) => s.title)));
  console.log("clientLogos names:", JSON.stringify((home?.clientLogos ?? []).map((l: any) => l.name)));

  // If duplicates exist, show every doc so we can spot the stale one
  if (homepagesCount > 1) {
    const all = await db.collection("homepages").find({}).toArray();
    all.forEach((d: any, i: number) =>
      console.log(`  homepage[${i}] _id=${d._id} titles=${JSON.stringify((d.heroSlides ?? []).map((s: any) => s.title))} logos=${JSON.stringify((d.clientLogos ?? []).map((l: any) => l.name))}`)
    );
  }

  console.log("Project visible count    :", await db.collection("projects").countDocuments({ visible: true }));
  console.log("Testimonial visible count:", await db.collection("testimonials").countDocuments({ visible: true }));

  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
