/* eslint-disable no-console */
/**
 * Replace every public-website image with real photography (Pexels CDN),
 * optimised to WebP < 200KB, uploaded to Cloudinary, and linked in MongoDB.
 *
 * Run:  npx tsx scripts/replace-all-images.ts
 *
 * Idempotent: fixed Cloudinary public_ids (overwrite:true) + findOneAndUpdate,
 * so re-running simply refreshes the same slots.
 *
 * Sourcing strategy (no API key):
 *   1. Pexels direct CDN URL (primary — IDs are pre-vetted, no people).
 *      Note: Unsplash Source (source.unsplash.com) was shut down in 2024, so it
 *      is NOT used.
 *   2. Brand-gradient placeholder generated with sharp (guaranteed fallback so a
 *      slot is NEVER left empty — used for non-rendered slots and on any failure).
 *
 * Standalone by necessity: src/server/* modules begin with `import "server-only"`
 * and pull in env.ts (which validates all server secrets and throws under tsx).
 * This script therefore loads .env.local itself and configures cloudinary +
 * mongoose directly, mirroring scripts/seed.ts and scripts/seed-content.ts.
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

// ─── Env ─────────────────────────────────────────────────────────────────────
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
for (const [k, v] of Object.entries({ MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET })) {
  if (!v) {
    console.error(`✗ ${k} is not set (check .env.local)`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Schemas (mirror src/server/models/*; same model names → same collections) ─
const HeroSlideSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaUrl: { type: String, default: "" },
  },
  { _id: false }
);
const HomepageSchema = new Schema(
  { heroSlides: { type: [HeroSlideSchema], default: [] } },
  { timestamps: true, strict: false }
);
const ServiceSchema = new Schema(
  { slug: String, title: String, coverImage: String },
  { timestamps: true, strict: false }
);
const BlogSchema = new Schema(
  { slug: String, title: String, featuredImage: String },
  { timestamps: true, strict: false }
);
const SiteContentSchema = new Schema(
  { banners: { type: Schema.Types.Mixed, default: {} } },
  { timestamps: true, strict: false }
);
// Read-only models used only by the verification scan.
const ProjectSchema = new Schema({ slug: String, title: String, image: String }, { strict: false });
const TeamSchema = new Schema({ name: String, photo: String }, { strict: false });
const TestimonialSchema = new Schema({ clientName: String, clientPhoto: String }, { strict: false });

const Homepage = mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
const SiteContent = mongoose.models.SiteContent || mongoose.model("SiteContent", SiteContentSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);

// ─── Bookkeeping ───────────────────────────────────────────────────────────--
interface Row {
  section: string;
  slug: string;
  source: "pexels" | "placeholder" | "video";
  bytes: number;
  url: string;
}
const rows: Row[] = [];
const warnings: string[] = [];
const manifest: Record<string, string> = {};
const MAX_BYTES = 200 * 1024;

// ─── Sourcing + processing ────────────────────────────────────────────────────
const pexelsUrl = (id: number, w = 1920) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 WDD-image-bot" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Suspiciously small response (${buf.length}b) for ${url}`);
  return buf;
}

/** Resize (cover) + WebP, keeping the highest quality that stays < 200KB.
 *  Guarantees the cap: if even low quality at full size is too big, it shrinks
 *  the dimensions as a last resort. */
async function toWebp(input: Buffer, w: number, h: number): Promise<Buffer> {
  for (const quality of [85, 78, 70, 62, 54, 46, 38]) {
    const out = await sharp(input).resize(w, h, { fit: "cover", position: "attention" }).webp({ quality }).toBuffer();
    if (out.length <= MAX_BYTES) return out;
  }
  // Last resort: drop to 80% dimensions at moderate quality (always well under cap).
  return sharp(input)
    .resize(Math.round(w * 0.8), Math.round(h * 0.8), { fit: "cover", position: "attention" })
    .webp({ quality: 58 })
    .toBuffer();
}

/** Guaranteed brand-gradient placeholder (no people, on-brand) so no slot is ever empty. */
async function placeholderWebp(w: number, h: number, label: string): Promise<Buffer> {
  const safe = label.replace(/[<>&]/g, "");
  const fontSize = Math.round(Math.min(w, h) / 14);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1B4DA8"/><stop offset="60%" stop-color="#2563EB"/><stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif"
      font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${safe}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer();
}

/** Try Pexels (primary id + alternates); on total failure return a brand placeholder. */
async function sourceImage(
  primaryId: number,
  alternates: number[],
  w: number,
  h: number,
  label: string
): Promise<{ buffer: Buffer; source: "pexels" | "placeholder" }> {
  const ids = [primaryId, ...alternates];
  for (let attempt = 0; attempt < ids.length; attempt++) {
    try {
      const raw = await fetchBuffer(pexelsUrl(ids[attempt], 1920));
      const webp = await toWebp(raw, w, h);
      return { buffer: webp, source: "pexels" };
    } catch (err) {
      warnings.push(`Pexels id ${ids[attempt]} failed for "${label}": ${(err as Error).message}`);
    }
  }
  warnings.push(`All Pexels sources failed for "${label}" — using brand placeholder.`);
  return { buffer: await placeholderWebp(w, h, label), source: "placeholder" };
}

function uploadBuffer(buffer: Buffer, folder: string, publicId: string): Promise<{ url: string; bytes: number }> {
  return new Promise((res, rej) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
        eager: [{ fetch_format: "auto", quality: "auto" }],
      },
      (err, result) => (err || !result ? rej(err || new Error("no result")) : res({ url: result.secure_url, bytes: result.bytes }))
    );
    stream.end(buffer);
  });
}

/** Process one image slot end-to-end: source → upload → record. */
async function doImage(opts: {
  section: string;
  slug: string;
  pexelsId: number;
  alternates?: number[];
  w: number;
  h: number;
  folder: string;
  publicId: string;
  label: string;
}): Promise<string> {
  const { buffer, source } = await sourceImage(opts.pexelsId, opts.alternates ?? [], opts.w, opts.h, opts.label);
  const { url, bytes } = await uploadBuffer(buffer, opts.folder, opts.publicId);
  rows.push({ section: opts.section, slug: opts.slug, source, bytes, url });
  manifest[`${opts.section}/${opts.slug}`] = url;
  console.log(`✓ [${opts.section}] ${opts.slug} → ${source}, ${(bytes / 1024).toFixed(0)}KB → ${url}`);
  return url;
}

/** Pure brand-placeholder slot (for non-rendered DB fields we still must not leave empty). */
async function doPlaceholder(section: string, slug: string, w: number, h: number, folder: string, publicId: string, label: string): Promise<string> {
  const buffer = await placeholderWebp(w, h, label);
  const { url, bytes } = await uploadBuffer(buffer, folder, publicId);
  rows.push({ section, slug, source: "placeholder", bytes, url });
  manifest[`${section}/${slug}`] = url;
  console.log(`✓ [${section}] ${slug} → placeholder, ${(bytes / 1024).toFixed(0)}KB → ${url}`);
  return url;
}

// ════════════════════════════════════════════════════════════════════════════
//  IMAGE MAP (dimensions + Pexels IDs from IMAGE_REPLACEMENT.md)
// ════════════════════════════════════════════════════════════════════════════
const HERO_IMAGES = [
  { id: 326502, alt: [1181244, 38568], label: "Workspace" },
  { id: 6803490, alt: [669610, 590022], label: "Analytics" },
  { id: 11035471, alt: [11035380, 1181271], label: "Code" },
];

const SERVICE_IMAGES: { slug: string; id: number; alt: number[]; label: string }[] = [
  { slug: "website-designing", id: 196645, alt: [196644, 326502], label: "Web Design" },
  { slug: "website-development", id: 11035380, alt: [11035471, 270348], label: "Development" },
  { slug: "seo-services", id: 6803490, alt: [669610, 590022], label: "SEO" },
  { slug: "digital-marketing", id: 267350, alt: [1591056, 590022], label: "Marketing" },
  { slug: "ecommerce-development", id: 230544, alt: [34577, 5632402], label: "E-commerce" },
  { slug: "graphic-designing", id: 1109541, alt: [196645, 326502], label: "Graphic Design" },
  { slug: "wordpress-website", id: 4144222, alt: [11035380, 270348], label: "WordPress" },
  { slug: "mobile-first-design", id: 1092644, alt: [699122, 5077047], label: "Mobile-First" },
];

const BLOG_IMAGES: { slug: string; id: number; alt: number[]; label: string }[] = [
  { slug: "why-every-business-needs-a-website-2026", id: 1181263, alt: [1181244, 326502], label: "Small Business" },
  { slug: "how-a-good-website-pays-for-itself", id: 6802049, alt: [6803490, 669610], label: "Website ROI" },
  { slug: "essential-website-features-2026", id: 6802049, alt: [590022, 196645], label: "Website Checklist" },
];

// Non-rendered banner bgs (page banners use a CSS gradient). We fill the explicitly
// requested "about" with a real photo, and the rest with brand placeholders so no DB
// field is left empty without polluting invisible slots with guessed stock photos.
const ABOUT_BANNER = { id: 1170412, alt: [380769, 273209], label: "Modern Office" };
// Includes "registrations" — an orphan banner key left in the DB from the
// (now-removed) Registrations page; filled so no banner field is left empty.
const OTHER_BANNERS = ["services", "projects", "blog", "contact", "reviews", "legal", "registrations"];

// Slide-4 video candidates (best-effort without the Pexels API). On failure we fall
// back to a code-themed image so the hero still has 4 filled slides.
const VIDEO_CANDIDATES = [
  "https://www.pexels.com/video/854248/download/",
  "https://www.pexels.com/video/855413/download/",
];

// ─── Video (Part 5) ────────────────────────────────────────────────────────--
async function trySourceVideo(): Promise<{ video: string; poster: string } | null> {
  for (const url of VIDEO_CANDIDATES) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        resource_type: "video",
        folder: "wdd/hero",
        public_id: "hero-showcase",
        overwrite: true,
        invalidate: true,
      });
      if (result?.secure_url) {
        const poster = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_0,f_jpg,q_auto/wdd/hero/hero-showcase.jpg`;
        console.log(`✓ [Hero] slide-4 video → ${result.secure_url}`);
        return { video: result.secure_url, poster };
      }
    } catch (err) {
      warnings.push(`Video candidate failed (${url}): ${(err as Error).message}`);
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  // ── Homepage hero slides 1-3 (images) ──────────────────────────────────────
  console.log("── Hero slides ──");
  const heroUrls: string[] = [];
  for (let i = 0; i < HERO_IMAGES.length; i++) {
    const h = HERO_IMAGES[i];
    heroUrls.push(
      await doImage({
        section: "Hero",
        slug: `slide-${i + 1}`,
        pexelsId: h.id,
        alternates: h.alt,
        w: 1920,
        h: 1080,
        folder: "wdd/hero",
        publicId: `slide-${i + 1}`,
        label: h.label,
      })
    );
  }

  // ── Hero slide 4 (video, or image fallback) ─────────────────────────────────
  const video = await trySourceVideo();
  let slide4: { type: string; image: string; video: string } ;
  if (video) {
    slide4 = { type: "video", image: video.poster, video: video.video };
    rows.push({ section: "Hero", slug: "slide-4 (video)", source: "video", bytes: 0, url: video.video });
    manifest["Hero/slide-4-video"] = video.video;
    manifest["Hero/slide-4-poster"] = video.poster;
  } else {
    warnings.push(
      "Hero video could not be auto-sourced (Pexels video download needs the API; no ffmpeg). " +
        "Slide 4 set as a code-themed IMAGE so the slot is filled. To add the real video later: " +
        "get a free Pexels API key OR upload an MP4 to Cloudinary as wdd/hero/hero-showcase, then set " +
        "heroSlides[3].type='video' and heroSlides[3].video=<url>."
    );
    const posterUrl = await doImage({
      section: "Hero",
      slug: "slide-4 (image fallback)",
      pexelsId: 11035471,
      alternates: [11035380, 270348],
      w: 1920,
      h: 1080,
      folder: "wdd/hero",
      publicId: "slide-4",
      label: "Our Process",
    });
    slide4 = { type: "image", image: posterUrl, video: "" };
  }

  // ── Persist hero slides into Homepage (preserve existing slide text) ─────────
  {
    let hp = await Homepage.findOne({});
    if (!hp) hp = new Homepage({ heroSlides: [] });
    const slides: any[] = Array.isArray(hp.heroSlides) ? hp.heroSlides : [];
    const SLIDE_TEXT = [
      { title: "A website your customers actually **find.** Not just a digital business card.", subtitle: "Custom-coded design, SEO-ready development and honest fixed-price quotes. 150+ websites shipped.", ctaText: "Get a Free Quote", ctaUrl: "/contact" },
      { title: "Reach Google's first page. Then **stay there.**", subtitle: "On-page, technical, content and ethical backlinks — the full SEO stack, with monthly reports you can verify.", ctaText: "Free SEO Audit", ctaUrl: "/contact" },
      { title: "From the first wireframe to the **first sale.**", subtitle: "Design, development, content, SEO and support — one team in Delhi, same WhatsApp, same people.", ctaText: "Start a Project", ctaUrl: "/contact" },
      { title: "From wireframe to launch — see how we actually build.", subtitle: "A 15-second look at our real workflow.", ctaText: "See Our Process", ctaUrl: "/projects" },
    ];
    const ensure = (i: number) => {
      if (!slides[i]) slides[i] = { type: "image", image: "", video: "", ...SLIDE_TEXT[i] };
      return slides[i];
    };
    for (let i = 0; i < 3; i++) {
      const s = ensure(i);
      s.type = "image";
      s.image = heroUrls[i];
      if (!s.title) s.title = SLIDE_TEXT[i].title;
      if (!s.subtitle) s.subtitle = SLIDE_TEXT[i].subtitle;
      if (!s.ctaText) s.ctaText = SLIDE_TEXT[i].ctaText;
      if (!s.ctaUrl) s.ctaUrl = SLIDE_TEXT[i].ctaUrl;
    }
    const s4 = ensure(3);
    s4.type = slide4.type;
    s4.image = slide4.image;
    s4.video = slide4.video;
    if (!s4.title) s4.title = SLIDE_TEXT[3].title;
    if (!s4.subtitle) s4.subtitle = SLIDE_TEXT[3].subtitle;
    if (!s4.ctaText) s4.ctaText = SLIDE_TEXT[3].ctaText;
    if (!s4.ctaUrl) s4.ctaUrl = SLIDE_TEXT[3].ctaUrl;
    hp.heroSlides = slides.slice(0, 4);
    hp.markModified("heroSlides");
    await hp.save();
    console.log("✓ Homepage.heroSlides updated (4 slides)\n");
  }

  // ── Service covers ──────────────────────────────────────────────────────────
  console.log("── Service covers ──");
  for (const s of SERVICE_IMAGES) {
    const url = await doImage({
      section: "Service",
      slug: s.slug,
      pexelsId: s.id,
      alternates: s.alt,
      w: 1200,
      h: 630,
      folder: "wdd/services",
      publicId: s.slug,
      label: s.label,
    });
    const res = await Service.findOneAndUpdate({ slug: s.slug }, { $set: { coverImage: url } });
    if (!res) warnings.push(`No Service doc with slug "${s.slug}" — uploaded but no DB row to update.`);
  }

  // ── Blog featured ─────────────────────────────────────────────────────────--
  console.log("\n── Blog featured ──");
  for (const b of BLOG_IMAGES) {
    const url = await doImage({
      section: "Blog",
      slug: b.slug,
      pexelsId: b.id,
      alternates: b.alt,
      w: 1200,
      h: 630,
      folder: "wdd/blog",
      publicId: b.slug,
      label: b.label,
    });
    const res = await Blog.findOneAndUpdate({ slug: b.slug }, { $set: { featuredImage: url } });
    if (!res) warnings.push(`No Blog doc with slug "${b.slug}" — uploaded but no DB row to update.`);
  }

  // ── About (banner + ourStory) ───────────────────────────────────────────────
  console.log("\n── About ──");
  const aboutBannerUrl = await doImage({
    section: "About",
    slug: "banner",
    pexelsId: ABOUT_BANNER.id,
    alternates: ABOUT_BANNER.alt,
    w: 1920,
    h: 500,
    folder: "wdd/about",
    publicId: "banner",
    label: ABOUT_BANNER.label,
  });
  // ourStory drives the two hardcoded <img> on home + about (repointed by hand
  // after this run, then the local assets-to-upload folder is archived).
  await doImage({
    section: "About",
    slug: "our-story",
    pexelsId: 380769,
    alternates: [273209, 1170412],
    w: 1200,
    h: 800,
    folder: "wdd/about",
    publicId: "our-story",
    label: "Our Story",
  });

  // ── Page banners in SiteContent (about = real photo; others = brand placeholder) ─
  console.log("\n── Page banners (SiteContent.banners.*.bg) ──");
  {
    let sc = await SiteContent.findOne({});
    if (!sc) sc = new SiteContent({ banners: {} });
    const banners: Record<string, any> = (sc.banners as Record<string, any>) || {};
    banners.about = { ...(banners.about || {}), bg: aboutBannerUrl };
    for (const key of OTHER_BANNERS) {
      const url = await doPlaceholder("Banner", key, 1600, 500, "wdd/banners", key, key.charAt(0).toUpperCase() + key.slice(1));
      banners[key] = { ...(banners[key] || {}), bg: url };
    }
    sc.banners = banners;
    sc.markModified("banners");
    await sc.save();
    console.log("✓ SiteContent.banners.*.bg updated\n");
  }

  // Persist manifest (used to repoint the two hardcoded <img> srcs).
  writeFileSync(resolve(process.cwd(), "scripts/.image-manifest.json"), JSON.stringify(manifest, null, 2));

  // ── PART 3 — verification scan ──────────────────────────────────────────────
  console.log("══════════════════════════════════════════════");
  console.log("  VERIFICATION SCAN (empty/​missing image fields)");
  console.log("══════════════════════════════════════════════");
  const empties: string[] = [];
  const filled: string[] = [];

  const hp2 = await Homepage.findOne({}).lean<{ heroSlides?: any[] }>();
  (hp2?.heroSlides || []).forEach((s: any, i: number) => {
    const ok = s.type === "video" ? !!s.video || !!s.image : !!s.image;
    (ok ? filled : empties).push(`Homepage.heroSlides[${i}] (${s.type})`);
  });
  const services = await Service.find({}).lean<{ slug: string; coverImage?: string }[]>();
  services.forEach((s) => ((s.coverImage ? filled : empties).push(`Service.coverImage [${s.slug}]`)));
  const blogs = await Blog.find({}).lean<{ slug: string; featuredImage?: string }[]>();
  blogs.forEach((b) => ((b.featuredImage ? filled : empties).push(`Blog.featuredImage [${b.slug}]`)));
  const sc2 = await SiteContent.findOne({}).lean<{ banners?: Record<string, any> }>();
  Object.entries(sc2?.banners || {}).forEach(([k, v]) => ((v?.bg ? filled : empties).push(`SiteContent.banners.${k}.bg`)));

  // Skipped-by-rule (report only).
  const projects = await Project.find({}).lean<{ slug: string; image?: string }[]>();
  const testimonials = await Testimonial.find({}).lean<{ clientName: string; clientPhoto?: string }[]>();
  const team = await Team.find({}).lean<{ name: string; photo?: string }[]>();
  const skipped: string[] = [];
  projects.forEach((p) => skipped.push(`Project.image [${p.slug}] = ${p.image ? "set" : "EMPTY (kept — real client screenshot policy)"}`));
  testimonials.forEach((t) => skipped.push(`Testimonial.clientPhoto [${t.clientName}] = ${t.clientPhoto ? "set" : "EMPTY (initials-avatar fallback; not replaced per rule)"}`));
  team.forEach((m) => skipped.push(`Team.photo [${m.name}] = ${m.photo ? "set" : "EMPTY (owner provides)"}`));

  console.log(`\nFILLED (${filled.length}):`);
  filled.forEach((f) => console.log(`  ✓ ${f}`));
  console.log(`\nEMPTY public image slots (should be 0): ${empties.length}`);
  empties.forEach((e) => console.log(`  ✗ ${e}`));
  console.log(`\nSKIPPED BY RULE (informational):`);
  skipped.forEach((s) => console.log(`  • ${s}`));

  // ── Summary table ────────────────────────────────────────────────────────--
  console.log("\n══════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════");
  console.log("SECTION    SLUG                                  SRC          SIZE     URL");
  for (const r of rows) {
    console.log(
      `${r.section.padEnd(10)} ${r.slug.padEnd(37)} ${r.source.padEnd(11)} ${(r.bytes ? (r.bytes / 1024).toFixed(0) + "KB" : "-").padEnd(8)} ${r.url}`
    );
  }
  console.log(`\nTotal assets processed: ${rows.length}`);
  console.log(`Warnings: ${warnings.length}`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log("\nManifest written: scripts/.image-manifest.json");

  await mongoose.disconnect();
  console.log("\n✓ Done.");
  if (empties.length > 0) {
    console.log(`\n✗ ${empties.length} public image slot(s) still empty — review above.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("✗ replace-all-images failed:", err);
  process.exit(1);
});
