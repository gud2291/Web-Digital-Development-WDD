/* eslint-disable no-console */
/**
 * §17.3 — seed 3 dummy team members so the About page "Meet Our Team" grid is
 * full. Idempotent:
 *   - inserts a Team doc only if one with that `name` doesn't exist
 *   - reuses an existing Cloudinary asset (checks `api.resource` before upload)
 *   - sets Gudia Yadav's order to 1 (founder first)
 *
 * Run:  npx tsx scripts/seed-team-members.ts
 *
 * Self-contained (no `@/` imports) so it runs under tsx without alias config —
 * mirrors scripts/seed.ts. Cloudinary upload uses the same v2 SDK the app's
 * uploadToCloudinary() helper wraps.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";
import sharp from "sharp";
import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from "cloudinary";

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

const { MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set");
  process.exit(1);
}

const cloudinaryReady = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

interface Member {
  name: string;
  designation: string;
  bio: string;
  linkedinUrl: string;
  order: number;
  publicId: string;
  /** Stock headshot source (Unsplash). Downloaded, squared, then uploaded. */
  stockUrl: string;
}

const STOCK = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`;

const MEMBERS: Member[] = [
  {
    name: "Rohit Sharma",
    designation: "Senior Full-Stack Developer",
    bio: "6+ years building React + Next.js apps. Lead developer on Expoed and SBM Greens. Owns our entire dev pipeline.",
    // No real LinkedIn profile yet — left blank so the seed never emits a broken
    // placeholder link. Add the real URL in the admin panel when available.
    linkedinUrl: "",
    order: 2,
    publicId: "wdd/team/placeholder-male-1",
    stockUrl: STOCK("1507003211169-0a1dd7228f2d"),
  },
  {
    name: "Priya Verma",
    designation: "Senior UI/UX Designer",
    bio: "Figma-first product designer. Translates business goals into pixel-perfect interfaces. Designs every WDD project alongside Gudia.",
    linkedinUrl: "",
    order: 3,
    publicId: "wdd/team/placeholder-female-1",
    stockUrl: STOCK("1494790108377-be9c29b29330"),
  },
  {
    name: "Arjun Kapoor",
    designation: "SEO & Digital Marketing Lead",
    bio: "Drives all SEO + paid-ads work for WDD clients. Average client ranks page-1 within 6 months on his watch.",
    linkedinUrl: "",
    order: 4,
    publicId: "wdd/team/placeholder-male-2",
    stockUrl: STOCK("1500648767791-00dcc994a43e"),
  },
  {
    name: "Neha Singh",
    designation: "Content Strategist",
    bio: "Writes content that converts — landing-page copy, SEO articles, brand voice. Former B2B SaaS content lead.",
    linkedinUrl: "",
    order: 5,
    publicId: "wdd/team/placeholder-female-2",
    stockUrl: STOCK("1438761681033-6461ffad8d80"),
  },
];

// Minimal Team schema (matches src/server/models/Team.ts).
const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "" },
    photo: { type: String, default: "" },
    bio: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

function uploadBuffer(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolveUp, rejectUp) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: "image", overwrite: false },
      (err: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
        if (err || !res) return rejectUp(err ?? new Error("No upload result"));
        resolveUp(res.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/** Resolve a member's photo URL: reuse Cloudinary asset → upload → fall back to stock. */
async function resolvePhoto(m: Member): Promise<string> {
  if (!cloudinaryReady) {
    console.log(`  • Cloudinary not configured — using stock URL for ${m.name}`);
    return m.stockUrl;
  }
  // 1) Reuse an existing asset (idempotent — no re-upload).
  try {
    const existing = await cloudinary.api.resource(m.publicId);
    console.log(`  • Cloudinary asset exists for ${m.name} (${m.publicId})`);
    return existing.secure_url;
  } catch {
    // not found — continue to upload
  }
  // 2) Download → square 400×400 webp → upload.
  try {
    const resp = await fetch(m.stockUrl);
    if (!resp.ok) throw new Error(`stock fetch ${resp.status}`);
    const raw = Buffer.from(await resp.arrayBuffer());
    const optimized = await sharp(raw).resize(400, 400, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
    const url = await uploadBuffer(optimized, m.publicId);
    console.log(`  ✓ Uploaded headshot for ${m.name} → ${m.publicId}`);
    return url;
  } catch (err) {
    console.log(`  ! Upload failed for ${m.name} (${err instanceof Error ? err.message : err}) — using stock URL`);
    return m.stockUrl;
  }
}

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  console.log("✓ Connected");

  const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

  let inserted = 0;
  let uploads = 0;
  for (const m of MEMBERS) {
    const exists = await Team.findOne({ name: m.name });
    if (exists) {
      console.log(`  • ${m.name} already exists — skipping`);
      continue;
    }
    const before = cloudinaryReady;
    const photo = await resolvePhoto(m);
    if (before && photo.includes("res.cloudinary.com")) uploads++;
    await Team.create({
      name: m.name,
      designation: m.designation,
      photo,
      bio: m.bio,
      linkedinUrl: m.linkedinUrl,
      visible: true,
      order: m.order,
    });
    inserted++;
    console.log(`  ✓ Inserted ${m.name} (order ${m.order})`);
  }

  // Founder first.
  const gudia = await Team.findOne({ name: /gudia/i });
  if (gudia && gudia.order !== 1) {
    gudia.order = 1;
    await gudia.save();
    console.log("  ✓ Set Gudia Yadav order = 1");
  } else if (!gudia) {
    console.log("  • Gudia Yadav doc not found (skipping order=1 update)");
  }

  console.log(`\n✓ Done — inserted ${inserted} member(s), ${uploads} Cloudinary upload(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ seed-team-members failed:", err);
  process.exit(1);
});
