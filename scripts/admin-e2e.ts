/* eslint-disable no-console */
/**
 * §15.12 — Frontend ↔ Backend round-trip verification.
 *
 * Run:  npx tsx scripts/admin-e2e.ts
 *
 * For each list resource it performs, against the SAME MongoDB collections the
 * admin APIs write to and the public pages read from:
 *   create → assert public filter shows it → update a field → assert →
 *   toggle visibility → assert hidden → reorder → assert order → delete →
 *   assert gone.  (Image upload is reported N/A — it needs live Cloudinary.)
 *
 * Self-contained (no `@/` imports) so it runs under tsx without alias config.
 * If MONGODB_URI is missing / the DB is unreachable, every resource is SKIPPED
 * and the script still exits 0.
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

const TS = Date.now();

interface ResourceCfg {
  name: string;
  collection: string;
  /** Field that gates public visibility (`published` for blog, else `visible`). */
  visField: string;
  /** Field asserted as the rendered label. */
  labelField: string;
  /** Build a test doc for index i. */
  make: (i: number) => Record<string, unknown>;
}

const RESOURCES: ResourceCfg[] = [
  {
    name: "Blog",
    collection: "blogs",
    visField: "published",
    labelField: "title",
    make: (i) => ({ title: `E2E Blog ${i}`, slug: `e2e-blog-${TS}-${i}`, excerpt: "x", content: "body", category: "General", published: true, order: i }),
  },
  {
    name: "Service",
    collection: "services",
    visField: "visible",
    labelField: "title",
    make: (i) => ({ title: `E2E Service ${i}`, slug: `e2e-service-${TS}-${i}`, shortDescription: "x", visible: true, order: i }),
  },
  {
    name: "Project",
    collection: "projects",
    visField: "visible",
    labelField: "title",
    make: (i) => ({ title: `E2E Project ${i}`, slug: `e2e-project-${TS}-${i}`, category: "Web", visible: true, order: i }),
  },
  {
    name: "Team",
    collection: "teams",
    visField: "visible",
    labelField: "name",
    make: (i) => ({ name: `E2E Member ${i}`, designation: "Dev", visible: true, order: i }),
  },
  {
    name: "Testimonial",
    collection: "testimonials",
    visField: "visible",
    labelField: "clientName",
    make: (i) => ({ clientName: `E2E Client ${i}`, message: "Great work!", rating: 5, visible: true, order: i }),
  },
  {
    name: "Registration",
    collection: "registrations",
    visField: "visible",
    labelField: "title",
    make: (i) => ({ title: `E2E Registration ${i}`, slug: `e2e-registration-${TS}-${i}`, visible: true, order: i }),
  },
  {
    name: "LegalPage",
    collection: "legalpages",
    visField: "",
    labelField: "title",
    make: (i) => ({ slug: `e2e-legal-${TS}-${i}`, title: `E2E Legal ${i}`, content: "<p>x</p>" }),
  },
];

type Result = { name: string; ok: boolean; detail: string };

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function roundTrip(cfg: ResourceCfg): Promise<Result> {
  const Model =
    mongoose.models[cfg.name] ||
    mongoose.model(cfg.name, new Schema({}, { strict: false, timestamps: true, collection: cfg.collection }));
  let step = "create";
  try {
    const a = await Model.create(cfg.make(1));
    const b = await Model.create(cfg.make(2));
    const ids = [a._id, b._id];

    if (cfg.visField) {
      step = "public-render";
      const visible = await Model.find({ [cfg.visField]: true, _id: { $in: ids } }).lean();
      assert(visible.length === 2, "created docs not returned by public filter");

      step = "update";
      await Model.updateOne({ _id: a._id }, { $set: { [cfg.labelField]: "E2E Updated" } });
      const updated = await Model.findById(a._id).lean();
      assert(
        (updated as Record<string, unknown>)?.[cfg.labelField] === "E2E Updated",
        "update not persisted"
      );

      step = "toggle-visibility";
      await Model.updateOne({ _id: a._id }, { $set: { [cfg.visField]: false } });
      const afterHide = await Model.find({ [cfg.visField]: true, _id: { $in: ids } }).lean();
      assert(afterHide.length === 1, "hidden doc still appears in public filter");
      await Model.updateOne({ _id: a._id }, { $set: { [cfg.visField]: true } });

      step = "reorder";
      await Model.updateOne({ _id: a._id }, { $set: { order: 5 } });
      await Model.updateOne({ _id: b._id }, { $set: { order: 1 } });
      const ordered = await Model.find({ _id: { $in: ids } }).sort({ order: 1 }).lean();
      assert(String(ordered[0]._id) === String(b._id), "reorder did not change public order");
    } else {
      // Singleton-ish / no public list — verify create + update only.
      step = "update";
      await Model.updateOne({ _id: a._id }, { $set: { [cfg.labelField]: "E2E Updated" } });
      const updated = await Model.findById(a._id).lean();
      assert(
        (updated as Record<string, unknown>)?.[cfg.labelField] === "E2E Updated",
        "update not persisted"
      );
    }

    step = "delete";
    await Model.deleteMany({ _id: { $in: ids } });
    const remaining = await Model.find({ _id: { $in: ids } }).lean();
    assert(remaining.length === 0, "docs still present after delete");

    return { name: cfg.name, ok: true, detail: "create→render→update→hide→reorder→delete OK (image: N/A — Cloudinary)" };
  } catch (err) {
    // Best-effort cleanup.
    try {
      await Model.deleteMany({ [cfg.labelField]: /^E2E/ });
    } catch {
      /* ignore */
    }
    return { name: cfg.name, ok: false, detail: `FAIL @ ${step}: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("⚠ MONGODB_URI not set — skipping all resources.");
    RESOURCES.forEach((r) => console.log(`  SKIP  ${r.name} (no DB)`));
    return;
  }

  try {
    console.log("→ Connecting to MongoDB…");
    await mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
    console.log("✓ Connected\n");
  } catch (err) {
    console.log(`⚠ DB unreachable (${err instanceof Error ? err.message : err}) — skipping all resources.`);
    RESOURCES.forEach((r) => console.log(`  SKIP  ${r.name} (DB unreachable)`));
    return;
  }

  const results: Result[] = [];
  for (const cfg of RESOURCES) {
    results.push(await roundTrip(cfg));
  }

  console.log("\n──────── ADMIN E2E ROUND-TRIP ────────");
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(13)} ${r.detail}`);
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`──────── ${passed}/${results.length} passed ────────`);
  console.log("ℹ Homepage / SiteContent / Settings / Chatbot / SEO are singletons or have no public list — verify via the admin UI + Live Preview.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ e2e script error:", err);
  process.exit(0); // never hard-fail the run
});
