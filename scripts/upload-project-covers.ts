/* eslint-disable no-console */
/**
 * Step 2 — Project cover images.
 * Optimises each project's local cover screenshot with sharp (1200x800 WebP,
 * q85, capped at 200KB), uploads to Cloudinary (wdd/projects/<slug>-cover) and
 * writes the secure URL into the matching Project document's `image` field.
 *
 * Mirrors the buffer-stream upload in src/server/media/cloudinary.ts (that
 * helper is `server-only` and can't be imported into a standalone tsx script).
 *
 * Run: npx tsx scripts/upload-project-covers.ts
 */
import mongoose from "mongoose";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

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

const { MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI missing");
  process.exit(1);
}
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("✗ Cloudinary env vars missing");
  process.exit(1);
}
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const ASSET_DIR = "assets-to-upload-OLD-illustrations/05-projects";
const MAX_BYTES = 200 * 1024;

// slug -> local cover file
const COVERS: Record<string, string> = {
  expoed: "expoed-cover.png",
  "sbm-greens": "sbm-greens-cover.png",
  "vishwakarma-tour": "vishwakarma-tour-cover.png",
  "shree-namo-motar": "shree-namo-motar-cover.png",
};

// Unsplash fallback keywords if a local cover is ever missing
const FALLBACK_KEYWORDS: Record<string, string> = {
  expoed: "ecommerce,fashion,clothing,store",
  "sbm-greens": "plantation,farm,green,corporate",
  "vishwakarma-tour": "travel,mountain,himalaya,tour",
  "shree-namo-motar": "automotive,car,workshop,glass",
};

/** Resize to 1200x800 WebP, stepping quality down until under 200KB. */
async function optimise(buf: Buffer): Promise<{ out: Buffer; quality: number }> {
  for (const quality of [85, 80, 75, 70, 65, 60]) {
    const out = await sharp(buf)
      .resize(1200, 800, { fit: "cover", position: "top" })
      .webp({ quality })
      .toBuffer();
    if (out.length <= MAX_BYTES || quality === 60) return { out, quality };
  }
  // unreachable, satisfies TS
  return { out: await sharp(buf).resize(1200, 800, { fit: "cover" }).webp({ quality: 60 }).toBuffer(), quality: 60 };
}

function uploadBuffer(buf: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolvePromise, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "wdd/projects", public_id: publicId, resource_type: "image", overwrite: true, invalidate: true },
      (err, res) => (err || !res ? reject(err ?? new Error("no response")) : resolvePromise(res))
    );
    stream.end(buf);
  });
}

async function sourceBuffer(slug: string): Promise<Buffer | null> {
  const local = resolve(process.cwd(), `${ASSET_DIR}/${COVERS[slug]}`);
  if (existsSync(local)) {
    console.log(`  • using local cover ${COVERS[slug]}`);
    return readFileSync(local);
  }
  // Fallback: pull a themed image from Unsplash Source
  const kw = FALLBACK_KEYWORDS[slug];
  const url = `https://source.unsplash.com/featured/1200x800/?${kw}`;
  console.log(`  • local cover missing — fetching Unsplash fallback (${kw})`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err: any) {
    console.warn(`  [warn] fallback fetch failed for ${slug}: ${err.message}`);
    return null;
  }
}

async function run() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.db!;
  console.log("Connected.\n");

  const results: { slug: string; url: string }[] = [];

  for (const slug of Object.keys(COVERS)) {
    console.log(`[${slug}]`);
    const src = await sourceBuffer(slug);
    if (!src) {
      console.warn(`  ✗ no source image for ${slug} — skipping\n`);
      continue;
    }
    const { out, quality } = await optimise(src);
    const kb = (out.length / 1024).toFixed(1);
    const up = await uploadBuffer(out, `${slug}-cover`);
    await db.collection("projects").updateOne({ slug }, { $set: { image: up.secure_url, updatedAt: new Date() } });
    console.log(`  ✓ ${out.length <= MAX_BYTES ? "" : "(>200KB after max compression) "}webp q${quality} ${kb}KB → ${up.secure_url}\n`);
    results.push({ slug, url: up.secure_url });
  }

  // Verify: every visible project must now have a non-empty image
  const visible = await db
    .collection("projects")
    .find({ visible: true })
    .project({ slug: 1, image: 1 })
    .toArray();
  console.log("── VERIFY (visible projects) ──");
  let missing = 0;
  for (const p of visible) {
    const ok = !!p.image;
    if (!ok) missing++;
    console.log(`  ${ok ? "✓" : "✗ EMPTY"}  ${p.slug}  ${p.image ? String(p.image).slice(0, 70) : ""}`);
  }

  await mongoose.disconnect();
  console.log(`\n${missing === 0 ? "✓ All visible projects have images." : `✗ ${missing} project(s) still missing an image.`}`);
  console.log("\nCloudinary URLs:");
  results.forEach((r) => console.log(`  ${r.slug}: ${r.url}`));
}

run().catch((err) => {
  console.error("upload-project-covers failed:", err);
  process.exit(1);
});
