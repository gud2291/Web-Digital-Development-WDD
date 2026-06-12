/* eslint-disable no-console */
/**
 * Image audit — walks every collection that stores image references, and for
 * each image field reports EMPTY / BROKEN / OK. Remote (http) URLs are checked
 * with a HEAD request; site-relative paths (/assets/…) are checked against the
 * local public/ folder.
 *
 * Run: npx tsx scripts/audit-images.ts
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

type Status = "EMPTY" | "BROKEN" | "OK";
interface Row { collection: string; doc: string; field: string; value: string; status: Status }

async function checkValue(value: unknown): Promise<Status> {
  if (typeof value !== "string" || !value.trim()) return "EMPTY";
  const v = value.trim();
  if (v.startsWith("data:")) return "OK"; // inline blur placeholder
  if (/^https?:\/\//i.test(v)) {
    try {
      const res = await fetch(v, { method: "HEAD" });
      // some CDNs reject HEAD — retry with ranged GET
      if (res.ok) return "OK";
      const res2 = await fetch(v, { method: "GET", headers: { Range: "bytes=0-0" } });
      return res2.ok ? "OK" : "BROKEN";
    } catch {
      return "BROKEN";
    }
  }
  // site-relative path → look in public/
  const rel = v.startsWith("/") ? v.slice(1) : v;
  return existsSync(resolve(process.cwd(), "public", rel)) ? "OK" : "BROKEN";
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const rows: Row[] = [];

  const add = async (collection: string, doc: string, field: string, value: unknown) => {
    rows.push({ collection, doc, field, value: typeof value === "string" ? value : "", status: await checkValue(value) });
  };

  // Homepage (singleton)
  const home = await db.collection("homepages").findOne<any>({});
  if (home) {
    for (let i = 0; i < (home.heroSlides ?? []).length; i++) {
      const s = home.heroSlides[i];
      await add("Homepage", `heroSlides[${i}]`, "image", s.image);
      await add("Homepage", `heroSlides[${i}]`, "video", s.video);
    }
    for (let i = 0; i < (home.clientLogos ?? []).length; i++) {
      await add("Homepage", `clientLogos[${i}] (${home.clientLogos[i].name})`, "image", home.clientLogos[i].image);
    }
    if (home.ctaBanner && "bg" in home.ctaBanner) await add("Homepage", "ctaBanner", "bg", home.ctaBanner.bg);
  }

  // SiteContent (singleton)
  const sc = await db.collection("sitecontents").findOne<any>({});
  if (sc) {
    if (Array.isArray(sc.about?.images)) {
      for (let i = 0; i < sc.about.images.length; i++) await add("SiteContent", `about.images[${i}]`, "url", sc.about.images[i]);
    }
    if (sc.banners && typeof sc.banners === "object") {
      for (const key of Object.keys(sc.banners)) {
        const b = sc.banners[key];
        if (b && typeof b === "object" && "bg" in b) await add("SiteContent", `banners.${key}`, "bg", b.bg);
      }
    }
  }

  // Collections with one image field each
  const single: [string, string, string][] = [
    ["services", "coverImage", "title"],
    ["projects", "image", "slug"],
    ["blogs", "featuredImage", "slug"],
    ["testimonials", "clientPhoto", "clientName"],
    ["teams", "photo", "name"],
  ];
  for (const [coll, field, labelKey] of single) {
    const docs = await db.collection(coll).find({}).toArray();
    for (const d of docs) {
      const label = (d as any)[labelKey] ?? String(d._id);
      // Team: skip the owner-provided Gudia photo per task
      if (coll === "teams" && /gudia/i.test(String(label))) continue;
      await add(coll[0].toUpperCase() + coll.slice(1, -1), String(label), field, (d as any)[field]);
    }
  }

  // Registrations — flag any string field that looks like an image
  const regs = await db.collection("registrations").find({}).toArray();
  for (const d of regs) {
    for (const [k, val] of Object.entries(d)) {
      if (typeof val === "string" && /(image|photo|cover|icon|banner)/i.test(k)) {
        await add("Registration", String((d as any).slug ?? d._id), k, val);
      }
    }
  }

  // Report
  const byStatus = (s: Status) => rows.filter((r) => r.status === s);
  const empty = byStatus("EMPTY");
  const broken = byStatus("BROKEN");
  const ok = byStatus("OK");

  console.log("\n================= IMAGE AUDIT =================");
  console.log(`Total fields checked: ${rows.length}  |  OK: ${ok.length}  EMPTY: ${empty.length}  BROKEN: ${broken.length}\n`);
  const printGroup = (title: string, list: Row[]) => {
    if (!list.length) return;
    console.log(`── ${title} (${list.length}) ──`);
    for (const r of list) {
      const val = r.value ? ` ${r.value.slice(0, 70)}` : "";
      console.log(`  [${r.status}] ${r.collection} · ${r.doc} · ${r.field}${val}`);
    }
    console.log("");
  };
  printGroup("EMPTY", empty);
  printGroup("BROKEN", broken);
  console.log(`OK fields: ${ok.length} (not listed)\n`);
  // Machine-readable summary line for diffing before/after
  console.log(`SUMMARY ok=${ok.length} empty=${empty.length} broken=${broken.length} total=${rows.length}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("audit-images failed:", err);
  process.exit(1);
});
