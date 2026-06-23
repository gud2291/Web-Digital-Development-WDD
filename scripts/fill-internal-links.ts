/* eslint-disable no-console */
/**
 * §INTERNAL-LINKING (Part D) — one-off, idempotent seed that fills content-aware
 * internal links for ALL existing content, the way a senior SEO would:
 *
 *   - each Service  → 1–2 genuinely related services + 1–3 topical blog posts
 *   - each Blog     → the matching service(s) it's about + 2–3 related posts
 *   - each Project  → the service(s) it used (by category / description / tech)
 *
 * Matching is by MEANING — title / category / tags / keyword topic detection —
 * not random. It only writes EMPTY related fields, so anything the owner has
 * already picked in the admin panel is never overwritten. Safe to re-run.
 *
 * Run:  npx tsx scripts/fill-internal-links.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// ─── Env loading (mirrors scripts/seed.ts / audit-db-links.ts) ───────────────
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
  console.error("✗ MONGODB_URI is not set (check .env.local) — aborting.");
  process.exit(1);
}

/** Mask credentials + show only host/db so we never print secrets. */
function maskDbTarget(uri: string): string {
  try {
    const noCreds = uri.replace(/\/\/([^@/]+)@/, "//***:***@");
    const u = new URL(noCreds.replace("mongodb+srv://", "https://").replace("mongodb://", "http://"));
    const db = u.pathname.replace(/^\//, "") || "(default)";
    return `${u.protocol.startsWith("https") ? "mongodb+srv" : "mongodb"}://***@${u.host}/${db}`;
  } catch {
    return uri.replace(/\/\/([^@/]+)@/, "//***:***@");
  }
}

// ─── Loose, strict:false models so we don't depend on the full app schemas ───
const Service =
  mongoose.models.Service || mongoose.model("Service", new Schema({}, { strict: false, collection: "services" }));
const Blog =
  mongoose.models.Blog || mongoose.model("Blog", new Schema({}, { strict: false, collection: "blogs" }));
const Project =
  mongoose.models.Project || mongoose.model("Project", new Schema({}, { strict: false, collection: "projects" }));

// ─── Topic detection — the heart of the "match by meaning" logic ─────────────
type Topic = "web-design" | "web-development" | "seo" | "ecommerce" | "marketing" | "maintenance";

const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  "web-design": ["web design", "website design", "redesign", "ui", "ux", "branding", "visual", "layout", "figma", "designer"],
  "web-development": ["development", "develop", "next.js", "nextjs", "react", "wordpress", "code", "coding", "developer", "web app", "cms", "build a website", "custom website"],
  seo: ["seo", "search engine", "rank", "ranking", "google", "local seo", "keyword", "backlink", "serp", "organic"],
  ecommerce: ["e-commerce", "ecommerce", "online store", "online shop", "shopify", "woocommerce", "checkout", "cart", "payment gateway", "store"],
  marketing: ["marketing", " ads", "advertis", "campaign", "social media", "email marketing", "content marketing", "digital marketing", "google ads", "meta ads", "lead generation"],
  maintenance: ["maintenance", "support", "security", "backup", "ongoing", "speed audit", "hosting", "uptime"],
};

const ALL_TOPICS = Object.keys(TOPIC_KEYWORDS) as Topic[];

function topicsOf(text: string): Set<Topic> {
  const hay = ` ${text.toLowerCase()} `;
  const out = new Set<Topic>();
  for (const topic of ALL_TOPICS) {
    if (TOPIC_KEYWORDS[topic].some((kw) => hay.includes(kw))) out.add(topic);
  }
  return out;
}

type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).map(String) : []);
const isEmpty = (v: unknown) => !Array.isArray(v) || v.length === 0;

function serviceText(s: Doc): string {
  return [str(s.title), str(s.slug).replace(/-/g, " "), str(s.shortDescription), str(s.content), arr(s.features).join(" ")].join(" ");
}
function blogText(b: Doc): string {
  return [str(b.title), str(b.category), str(b.excerpt), arr(b.tags).join(" ")].join(" ");
}
function projectText(p: Doc): string {
  return [str(p.title), str(p.category), str(p.description), arr(p.tech).join(" "), str(p.solution), str(p.objective)].join(" ");
}

/** Overlap-score `candidates` against `topics`; return top-N slugs (excluding `selfSlug`). */
function pickBySharedTopics(
  topics: Set<Topic>,
  candidates: { slug: string; topics: Set<Topic>; order: number }[],
  n: number,
  selfSlug?: string
): string[] {
  const scored = candidates
    .filter((c) => c.slug && c.slug !== selfSlug)
    .map((c) => ({ slug: c.slug, order: c.order, score: [...c.topics].filter((t) => topics.has(t)).length }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, n).map((c) => c.slug);
}

async function main() {
  console.log(`→ DB target: ${maskDbTarget(MONGODB_URI!)}`);
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  const services = (await Service.find({}).lean()) as Doc[];
  const blogs = (await Blog.find({}).lean()) as Doc[];
  const projects = (await Project.find({}).lean()) as Doc[];

  console.log(`Found ${services.length} services, ${blogs.length} blogs, ${projects.length} projects.\n`);

  // Pre-compute topic vectors.
  const svcVec = services.map((s, i) => ({
    slug: str(s.slug),
    topics: topicsOf(serviceText(s)),
    order: typeof s.order === "number" ? (s.order as number) : i,
  }));
  const blogVec = blogs.map((b, i) => ({
    slug: str(b.slug),
    topics: topicsOf(blogText(b)),
    order: typeof b.order === "number" ? (b.order as number) : i,
  }));

  // Fallback "default" services so nothing is left orphaned: prefer development,
  // then design — whichever exists in this DB.
  const defaultServiceSlugs = svcVec
    .filter((s) => s.topics.has("web-development") || s.topics.has("web-design"))
    .map((s) => s.slug)
    .slice(0, 2);

  let updated = 0;
  let skipped = 0;

  // ── Services ────────────────────────────────────────────────────────────
  for (const s of services) {
    const slug = str(s.slug);
    const vec = svcVec.find((v) => v.slug === slug)!;
    const set: Doc = {};

    if (isEmpty(s.relatedServices)) {
      let picks = pickBySharedTopics(vec.topics, svcVec, 2, slug);
      if (picks.length === 0) {
        // No topical sibling — link the next services by admin order.
        picks = svcVec.filter((v) => v.slug && v.slug !== slug).sort((a, b) => a.order - b.order).slice(0, 1).map((v) => v.slug);
      }
      if (picks.length) set.relatedServices = picks;
    }
    if (isEmpty(s.relatedBlogs)) {
      const picks = pickBySharedTopics(vec.topics, blogVec, 3, undefined);
      if (picks.length) set.relatedBlogs = picks;
    }

    if (Object.keys(set).length) {
      await Service.updateOne({ _id: s._id }, { $set: set });
      updated++;
      console.log(`✓ service "${slug}"  →  services:[${(set.relatedServices as string[]) ?? "—"}]  blogs:[${(set.relatedBlogs as string[]) ?? "—"}]`);
    } else {
      skipped++;
    }
  }

  // ── Blogs ───────────────────────────────────────────────────────────────
  for (const b of blogs) {
    const slug = str(b.slug);
    const vec = blogVec.find((v) => v.slug === slug)!;
    const set: Doc = {};

    if (isEmpty(b.relatedServices)) {
      let picks = pickBySharedTopics(vec.topics, svcVec, 2, undefined);
      if (picks.length === 0) picks = defaultServiceSlugs.slice(0, 1);
      if (picks.length) set.relatedServices = picks;
    }
    if (isEmpty(b.relatedBlogs)) {
      let picks = pickBySharedTopics(vec.topics, blogVec, 3, slug);
      if (picks.length < 2) {
        // Top up with the most recent other posts (still relevant siblings).
        const extra = blogVec
          .filter((v) => v.slug && v.slug !== slug && !picks.includes(v.slug))
          .sort((a, b2) => a.order - b2.order)
          .map((v) => v.slug);
        for (const e of extra) {
          if (picks.length >= 3) break;
          picks.push(e);
        }
      }
      if (picks.length) set.relatedBlogs = picks.slice(0, 3);
    }

    if (Object.keys(set).length) {
      await Blog.updateOne({ _id: b._id }, { $set: set });
      updated++;
      console.log(`✓ blog    "${slug}"  →  services:[${(set.relatedServices as string[]) ?? "—"}]  blogs:[${(set.relatedBlogs as string[]) ?? "—"}]`);
    } else {
      skipped++;
    }
  }

  // ── Projects ────────────────────────────────────────────────────────────
  for (const p of projects) {
    const slug = str(p.slug) || str(p.title);
    if (!isEmpty(p.relatedServices)) {
      skipped++;
      continue;
    }
    const topics = topicsOf(projectText(p));
    let picks = pickBySharedTopics(topics, svcVec, 2, undefined);
    if (picks.length === 0) picks = defaultServiceSlugs.slice(0, 1);
    if (picks.length) {
      await Project.updateOne({ _id: p._id }, { $set: { relatedServices: picks } });
      updated++;
      console.log(`✓ project "${slug}"  →  services:[${picks}]`);
    } else {
      skipped++;
    }
  }

  console.log(`\n✓ Done — updated ${updated} document(s), left ${skipped} untouched (already had links or no match).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ fill-internal-links failed:", err);
  process.exit(1);
});
