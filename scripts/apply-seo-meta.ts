/* eslint-disable no-console */
/**
 * apply-seo-meta.ts — one-time, idempotent SEO push (APPLY-SEO-DB.md / SEO-DB-TODO.md).
 *
 * Upserts the shortened title/description from SEO-DB-TODO.md into the `SeoMeta`
 * collection (keyed by pageSlug), and — as a fallback layer — sets
 * seoTitle/seoDescription on the matching service/blog/location entity ONLY where
 * those fields are currently empty.
 *
 *   npx tsx scripts/apply-seo-meta.ts --dry-run   # default-safe: print changes, no writes
 *   npx tsx scripts/apply-seo-meta.ts --commit    # actually write
 *
 * Standalone (loads .env.local, connects mongoose directly) because src/server/*
 * modules import "server-only"/env.ts which throw under tsx — same pattern as
 * scripts/check-db-slugs.ts and scripts/backfill-service-icons.ts.
 *
 * Rules (see APPLY-SEO-DB.md): only touches SEO fields, never deletes a document,
 * never sets noIndex:true on a public page, never clobbers a non-empty
 * ogImage/canonical. Titles are stored WITHOUT the "| Web Digital Development"
 * brand suffix (buildMetadata appends it). Slugs whose service/blog/location does
 * not exist in the DB are skipped + logged so no orphan SeoMeta rows are created.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// ── env (.env.local → .env), same loader as the other scripts ────────────────
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
  console.error("✗ MONGODB_URI is not set (check .env.local)");
  process.exit(1);
}

// ── flags ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const COMMIT = argv.includes("--commit");
const DRY_RUN = argv.includes("--dry-run") || !COMMIT; // default-safe: anything that is not --commit is a dry run

// ── brand suffix math (buildMetadata appends " | Web Digital Development") ─────
const BRAND_SUFFIX = " | Web Digital Development";
const MAX_TITLE = 60;
const DESC_MIN = 120;
const DESC_MAX = 155;
const renderedTitleLen = (stored: string) => stored.length + BRAND_SUFFIX.length;

// ── the data, taken verbatim from SEO-DB-TODO.md ──────────────────────────────
interface SeoEntry {
  pageSlug: string;
  title: string;
  description: string;
  keywords?: string[];
}

// Static pages render via metadataFromDb("<slug>") — routes always exist, so no
// entity lookup is needed for these.
const STATIC_ENTRIES: SeoEntry[] = [
  {
    pageSlug: "home",
    title: "Website Design Company in Delhi",
    description:
      "Delhi web design & development studio building fast, responsive sites that turn visitors into paying customers. 400+ delivered — get a free quote.",
  },
  {
    pageSlug: "about",
    title: "About Our Delhi Web Design Studio",
    description:
      "Delhi web design & development studio since 2019 — 400+ sites delivered for 250+ clients across India and abroad. Meet the team behind your next site.",
  },
  {
    pageSlug: "blog",
    title: "Web Design & SEO Blog",
    description:
      "Practical web design, development and SEO tips for Indian businesses — trends, how-tos and guides to help your website rank higher and convert more.",
  },
  {
    pageSlug: "contact",
    title: "Contact Our Delhi Web Design Team",
    description:
      "Talk to Web Digital Development about your website, SEO or e-commerce project. We reply within 4 business hours — call, WhatsApp or send the form.",
  },
  {
    pageSlug: "legal",
    title: "Legal & Policies",
    description:
      "Read the Privacy Policy, Terms of Service and Refund Policy for Web Digital Development — how we handle your data, payments and project agreements.",
  },
  {
    pageSlug: "reviews",
    title: "Client Reviews & Ratings",
    description:
      "Unedited reviews from real clients in Delhi and abroad — each links to the client's live website so you can verify every word. See why 130+ trust us.",
  },
  {
    pageSlug: "services",
    title: "Web Design & Development Services",
    description:
      "Website design, development, SEO, e-commerce and digital marketing for Indian businesses — everything to launch, rank and grow. Get a free quote.",
  },
  {
    pageSlug: "projects",
    title: "Website Design Portfolio",
    description:
      "Browse 400+ websites we've shipped — e-commerce, tourism, corporate and automotive — each with a live link you can open and check for yourself.",
  },
];

// Services — /services/<slug>
const SERVICE_ENTRIES: SeoEntry[] = [
  {
    pageSlug: "services/website-designing",
    title: "Website Design Services in Delhi",
    description:
      "Mobile-first, conversion-focused website design in Delhi. 400+ projects since 2019, Figma prototypes before code, and one month of post-launch support.",
  },
  {
    pageSlug: "services/website-development",
    title: "Web Development Company in Delhi",
    description:
      "Hand-coded website development from a Delhi studio — Next.js, React, WordPress and PHP. 6 years, 400+ launches, Lighthouse 90+ on every build.",
  },
  {
    pageSlug: "services/seo-services",
    title: "SEO Services in Delhi for Page 1",
    description:
      "Professional SEO services in Delhi — keyword-led, white-hat, with transparent monthly reports. Most clients reach page 1 in 3–6 months. Get a free audit.",
  },
  {
    pageSlug: "services/digital-marketing",
    title: "Digital Marketing Agency in Delhi",
    description:
      "Performance-led digital marketing from a Delhi studio. Paid + organic, a flat monthly fee (no % of ad spend), and full transparency. Get a free plan.",
  },
  {
    pageSlug: "services/ecommerce-development",
    title: "E-commerce Development in Delhi",
    description:
      "E-commerce sites that sell — Shopify and WooCommerce experts in Delhi. Razorpay, GST-ready, abandoned-cart recovery. 6 years building online stores.",
  },
  {
    pageSlug: "services/graphic-designing",
    title: "Graphic Design Services in Delhi",
    description:
      "Logos, brand identity, brochures and social design from a Delhi studio. Custom concepts, source files included and a fast turnaround. Get a quote.",
  },
  {
    pageSlug: "services/wordpress-website",
    title: "WordPress Web Development in Delhi",
    description:
      "Custom WordPress development from a Delhi studio — no Elementor bloat. Clean code, Gutenberg blocks, fast hosting and an easy editor for your team.",
  },
  {
    pageSlug: "services/mobile-first-design",
    title: "Mobile-First Website Design",
    description:
      "Mobile-first design from a Delhi studio. We design at 360px first, test on real Android + iPhone, and prioritise touch + speed for India's traffic.",
  },
];

// Locations — /locations/<slug>
const LOCATION_ENTRIES: SeoEntry[] = [
  {
    pageSlug: "locations/delhi",
    title: "Web Design Company in Delhi NCR",
    description:
      "Professional website design, SEO and development in Delhi. Serving businesses across NCR with 400+ launches since 2019. Talk to our Delhi team today.",
  },
  {
    pageSlug: "locations/noida",
    title: "Website Design Services in Noida",
    description:
      "Custom website design and SEO for Noida businesses. We serve Noida, Greater Noida and nearby areas with 400+ successful projects. Get a free quote.",
  },
  {
    pageSlug: "locations/gurgaon",
    title: "Website Design Services in Gurgaon",
    description:
      "Professional website design and digital services for Gurgaon startups and businesses — custom-coded, SEO-ready sites built by our Gurgaon team.",
  },
  {
    pageSlug: "locations/faridabad",
    title: "Web Design in Faridabad",
    description:
      "Faridabad businesses deserve great websites. We design and develop custom, SEO-ready sites optimised for Google and local visibility. 400+ projects.",
  },
  {
    pageSlug: "locations/ghaziabad",
    title: "Web Design Services in Ghaziabad",
    description:
      "Modern, fast websites for Ghaziabad manufacturers, traders and service businesses. SEO included. Talk to our team about your online presence.",
  },
];

// Blog posts — /blog/<slug>
const BLOG_ENTRIES: SeoEntry[] = [
  {
    pageSlug: "blog/why-every-business-needs-a-website-2026",
    title: "Why Your Business Needs a Website",
    description:
      "A founder-written take on why Indian small businesses need a real website in 2026 — not just a Facebook page. What it costs and where to start.",
  },
  {
    pageSlug: "blog/how-a-good-website-pays-for-itself",
    title: "How a Website Pays For Itself",
    description:
      "A founder-written breakdown of how we calculate website ROI for small Indian businesses — lifetime value, conversion rates and the math.",
  },
  {
    pageSlug: "blog/essential-website-features-2026",
    title: "Must-Have Website Features (2026)",
    description:
      "Practical checklist from a Delhi studio that's shipped 400+ sites — what to insist on, what to skip, and why. Save it before your next quote.",
  },
  {
    pageSlug: "blog/how-to-choose-website-design-company-delhi-2026",
    title: "How to Choose a Web Design Company",
    description:
      "A practical 2026 checklist for choosing a website design company in Delhi — what to ask, red flags to avoid, and how to compare quotes with confidence.",
  },
  {
    pageSlug: "blog/website-redesign-signs-losing-customers",
    title: "Signs You Need a Website Redesign",
    description:
      "Nine clear signs your business website is costing you customers — slow speed, poor mobile, weak SEO — and what a redesign can fix. Read the checklist.",
  },
  {
    pageSlug: "blog/local-seo-delhi-businesses-step-by-step",
    title: "Local SEO for Delhi Businesses",
    description:
      "A step-by-step local SEO guide for Delhi businesses — Google Business Profile, citations, reviews and on-page tips to rank locally and win leads.",
  },
  {
    pageSlug: "blog/nextjs-vs-wordpress-business-websites",
    title: "Next.js vs WordPress for Business",
    description:
      "Next.js vs WordPress for Indian business websites — speed, cost, SEO and maintenance compared, so you can pick the right platform for your next site.",
  },
  {
    pageSlug: "blog/ecommerce-mistakes-indian-stores",
    title: "E-commerce Mistakes to Avoid",
    description:
      "The most common e-commerce website mistakes Indian online stores make — checkout, mobile, trust and SEO — and how to fix them to boost sales.",
  },
];

const ENTRIES: SeoEntry[] = [...STATIC_ENTRIES, ...SERVICE_ENTRIES, ...LOCATION_ENTRIES, ...BLOG_ENTRIES];

// ── minimal standalone models (match src/server/models/* field names) ─────────
const SeoMetaSchema = new Schema(
  {
    pageSlug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
    canonical: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const SeoMeta = mongoose.models.SeoMeta || mongoose.model("SeoMeta", SeoMetaSchema);

// strict:false so we read/write only the SEO fields and never disturb the rest.
const Service = mongoose.models.Service || mongoose.model("Service", new Schema({ slug: String, seoTitle: String, seoDescription: String }, { strict: false }));
const Blog = mongoose.models.Blog || mongoose.model("Blog", new Schema({ slug: String, seoTitle: String, seoDescription: String }, { strict: false }));
const LocationPage = mongoose.models.LocationPage || mongoose.model("LocationPage", new Schema({ slug: String, seoTitle: String, seoDescription: String }, { strict: false }));

type EntityKind = "static" | "service" | "blog" | "location";

function classify(pageSlug: string): { kind: EntityKind; slug: string } {
  if (pageSlug.startsWith("services/")) return { kind: "service", slug: pageSlug.slice("services/".length) };
  if (pageSlug.startsWith("blog/")) return { kind: "blog", slug: pageSlug.slice("blog/".length) };
  if (pageSlug.startsWith("locations/")) return { kind: "location", slug: pageSlug.slice("locations/".length) };
  return { kind: "static", slug: pageSlug };
}

// Returns the entity doc (for service/blog/location) or `true` for static routes,
// or `null` when the entity does not exist in the DB.
async function resolveEntity(kind: EntityKind, slug: string): Promise<Record<string, unknown> | true | null> {
  if (kind === "static") return true;
  const Model = kind === "service" ? Service : kind === "blog" ? Blog : LocationPage;
  const doc = await Model.findOne({ slug }).lean<Record<string, unknown>>();
  return doc ?? null;
}

const q = (s: string) => JSON.stringify(s);
const lenFlag = (n: number, lo: number, hi: number) => (n < lo ? ` ⚠ <${lo}` : n > hi ? ` ⚠ >${hi}` : "");

async function main() {
  console.log(`\n=== apply-seo-meta — ${COMMIT ? "COMMIT (writing)" : "DRY RUN (no writes)"} ===\n`);
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  const { host, name } = mongoose.connection;
  console.log(`✓ Connected — target DB host: ${host}  db: ${name}\n`);
  console.log(`  (credentials are never printed; verify this is the intended database before --commit)\n`);

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  let fallbackSet = 0;

  for (const entry of ENTRIES) {
    const { kind, slug } = classify(entry.pageSlug);

    const entity = await resolveEntity(kind, slug);
    if (entity === null) {
      skipped += 1;
      console.log(`⏭  [${entry.pageSlug}] skipped — no ${kind} with slug "${slug}" in DB (no orphan SeoMeta row created)`);
      continue;
    }

    // length guards (informational — values come verbatim from SEO-DB-TODO.md)
    const tLen = renderedTitleLen(entry.title);
    const dLen = entry.description.length;
    const tWarn = tLen > MAX_TITLE ? ` ⚠ rendered >${MAX_TITLE}` : "";
    const dWarn = lenFlag(dLen, DESC_MIN, DESC_MAX);

    // ── SeoMeta upsert ─────────────────────────────────────────────────────
    const existing = await SeoMeta.findOne({ pageSlug: entry.pageSlug }).lean<Record<string, unknown>>();

    const oldTitle = (existing?.title as string) ?? "";
    const oldDesc = (existing?.description as string) ?? "";
    const oldKeywords = (existing?.keywords as string[]) ?? [];
    const oldNoIndex = (existing?.noIndex as boolean) ?? false;

    const newKeywords = entry.keywords ?? oldKeywords; // never clobber existing keywords when no new ones provided

    const titleChanged = oldTitle !== entry.title;
    const descChanged = oldDesc !== entry.description;
    const keywordsChanged = JSON.stringify(oldKeywords) !== JSON.stringify(newKeywords);
    const noIndexChanged = oldNoIndex !== false;
    const changed = titleChanged || descChanged || keywordsChanged || noIndexChanged;

    if (!existing) {
      created += 1;
      console.log(`＋ [${entry.pageSlug}] CREATE SeoMeta`);
      console.log(`     title: ${q(entry.title)}  (rendered ${tLen} chars${tWarn})`);
      console.log(`     desc : ${q(entry.description)}  (${dLen} chars${dWarn})`);
    } else if (changed) {
      updated += 1;
      console.log(`✎ [${entry.pageSlug}] UPDATE SeoMeta`);
      if (titleChanged) console.log(`     title: ${q(oldTitle)} → ${q(entry.title)}  (rendered ${tLen} chars${tWarn})`);
      else console.log(`     title: (unchanged) ${q(entry.title)}  (rendered ${tLen} chars${tWarn})`);
      if (descChanged) console.log(`     desc : ${q(oldDesc)} → ${q(entry.description)}  (${dLen} chars${dWarn})`);
      else console.log(`     desc : (unchanged)  (${dLen} chars${dWarn})`);
      if (noIndexChanged) console.log(`     noIndex: ${oldNoIndex} → false`);
      if (keywordsChanged) console.log(`     keywords: [${oldKeywords.join(", ")}] → [${newKeywords.join(", ")}]`);
    } else {
      unchanged += 1;
      console.log(`• [${entry.pageSlug}] SeoMeta already up to date`);
    }

    if (COMMIT) {
      // $set only SEO fields; $setOnInsert for ogImage/canonical so a non-empty
      // existing value is never clobbered (and brand-new docs get the "" default).
      await SeoMeta.findOneAndUpdate(
        { pageSlug: entry.pageSlug },
        {
          $set: { title: entry.title, description: entry.description, keywords: newKeywords, noIndex: false },
          $setOnInsert: { pageSlug: entry.pageSlug, ogImage: "", canonical: "" },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // ── fallback layer: entity seoTitle/seoDescription only where empty ──────
    if (kind !== "static" && entity !== true) {
      const Model = kind === "service" ? Service : kind === "blog" ? Blog : LocationPage;
      const curTitle = ((entity.seoTitle as string) ?? "").trim();
      const curDesc = ((entity.seoDescription as string) ?? "").trim();
      const fallback: Record<string, string> = {};
      if (!curTitle) fallback.seoTitle = entry.title;
      if (!curDesc) fallback.seoDescription = entry.description;
      if (Object.keys(fallback).length) {
        fallbackSet += 1;
        const fields = Object.keys(fallback).join(" + ");
        console.log(`     ↳ fallback on ${kind} "${slug}": set empty ${fields}`);
        if (COMMIT) await Model.updateOne({ slug }, { $set: fallback });
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`  created  : ${created}`);
  console.log(`  updated  : ${updated}`);
  console.log(`  unchanged: ${unchanged}`);
  console.log(`  skipped  : ${skipped}  (entity not found in DB)`);
  console.log(`  fallback entity writes: ${fallbackSet}`);
  console.log(`  total entries: ${ENTRIES.length}`);

  if (DRY_RUN) {
    console.log("\nDRY RUN — nothing was written. Re-run with --commit to apply (after verifying the DB target above).");
  } else {
    console.log("\n✓ COMMIT complete — SEO fields written.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ apply-seo-meta failed:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
