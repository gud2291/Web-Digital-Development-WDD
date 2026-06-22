/* eslint-disable no-console */
/**
 * One-off WRITE script: fill quotation config for EVERY service so the admin
 * doesn't have to fill each by hand, and seed the global QuotationSettings
 * defaults (mirroring the reference quotation).
 *
 * SAFE / idempotent: only fills a field that is currently EMPTY — never
 * overwrites cost/scope/settings you've already edited in the admin. Re-running
 * changes nothing already filled. `quotationEnabled` is turned on only for
 * services that have never been configured (no cost + no scope yet), so a
 * service you deliberately disabled stays disabled.
 *
 * Per-service cost + scope are chosen from the service's slug/title (website
 * design / development / e-commerce / SEO / digital marketing / graphic design /
 * WordPress / mobile-first), with realistic India web-studio pricing. These are
 * starting points — tweak them in admin (Quotation section on each service).
 *
 * Reads MONGODB_URI from .env.local (same pattern as the other scripts).
 * Run:  npx tsx scripts/fill-service-quotations.ts
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

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

/** Show host + db only — never the credentials. */
function maskDbTarget(uri: string): string {
  try {
    const u = new URL(uri);
    const db = u.pathname.replace(/^\//, "") || "(default db)";
    return `${u.protocol}//****:****@${u.host}/${db}`;
  } catch {
    return "(unparseable MONGODB_URI)";
  }
}

interface Template {
  title: string;
  cost: string;
  scope: string[];
}

const T: Record<string, Template> = {
  ecommerce: {
    title: "E-Commerce Website Development",
    cost: "₹45,000 – ₹75,000",
    scope: [
      "Custom e-commerce store design (up to ~30 products to start)",
      "Product catalogue with categories, filters & search",
      "Shopping cart & secure checkout flow",
      "Payment gateway integration (Razorpay / UPI / cards)",
      "Order management & inventory dashboard",
      "Customer login, accounts & order tracking",
      "Mobile-responsive across all devices",
      "Basic on-page SEO setup",
    ],
  },
  wordpress: {
    title: "WordPress Website Development",
    cost: "₹18,000 – ₹35,000",
    scope: [
      "WordPress setup with on-brand theme customization",
      "Up to 8 pages designed to your content",
      "Fully responsive, mobile-friendly layout",
      "Blog / news section setup",
      "Contact form & enquiry integration",
      "Essential plugins (security, caching, SEO)",
      "Basic on-page SEO setup",
      "Admin training to manage content yourself",
    ],
  },
  seo: {
    title: "Search Engine Optimization (SEO)",
    cost: "₹12,000 – ₹25,000 / month",
    scope: [
      "Website SEO audit & competitor analysis",
      "Keyword research & search-intent mapping",
      "On-page optimization (titles, meta, headings, content)",
      "Technical SEO fixes (speed, indexing, sitemap, schema)",
      "Google Business Profile optimization",
      "Quality backlink building",
      "Monthly ranking, traffic & performance reporting",
      "Ongoing content recommendations",
    ],
  },
  marketing: {
    title: "Digital Marketing Package",
    cost: "₹15,000 – ₹40,000 / month",
    scope: [
      "Social media strategy & monthly content calendar",
      "Creative design for posts & ad campaigns",
      "Meta (Facebook / Instagram) ad campaign setup & management",
      "Google Ads campaign setup & management",
      "Audience targeting & retargeting",
      "Lead tracking & conversion setup",
      "Monthly performance reporting",
      "Continuous optimization for better ROI",
    ],
  },
  graphic: {
    title: "Graphic Design Package",
    cost: "₹8,000 – ₹25,000",
    scope: [
      "Logo design with multiple concepts",
      "Brand colour palette & typography guidelines",
      "Business card & letterhead design",
      "Social media post & story templates",
      "Brochure / flyer design",
      "Editable source files handover",
      "Revisions within the agreed scope",
      "Print-ready & web-ready formats",
    ],
  },
  development: {
    title: "Complete Website Development",
    cost: "₹35,000 – ₹60,000",
    scope: [
      "Custom, fully responsive website development",
      "Up to 10 pages with a modern, premium UI",
      "Fast, scalable front-end build",
      "Contact & enquiry forms with email alerts",
      "CMS / admin panel to manage your content",
      "Third-party & API integrations as needed",
      "Basic on-page SEO setup",
      "Cross-browser & device testing",
    ],
  },
  mobile: {
    title: "Mobile-First UI / UX Design",
    cost: "₹25,000 – ₹45,000",
    scope: [
      "Mobile-first, conversion-focused UI/UX design",
      "Up to 8 screens / pages with premium visuals",
      "Fully responsive across phone, tablet & desktop",
      "Wireframes & interactive design preview",
      "Brand-aligned visuals & typography",
      "Contact & enquiry form integration",
      "Speed & performance optimization",
      "1 round of design revisions",
    ],
  },
  design: {
    title: "Website Design Package",
    cost: "₹25,000 – ₹45,000",
    scope: [
      "Custom, conversion-focused website design",
      "Up to 8 pages with a premium UI",
      "Mobile-first, fully responsive layout",
      "Brand-aligned visuals & typography",
      "Contact & enquiry form integration",
      "Basic on-page SEO setup",
      "Speed & performance optimization",
      "1 round of design revisions",
    ],
  },
  default: {
    title: "Complete Website Package",
    cost: "₹20,000 – ₹40,000",
    scope: [
      "Professional, fully responsive website",
      "Up to 8 pages with a modern design",
      "Mobile-friendly across all devices",
      "Contact & enquiry integration",
      "Basic on-page SEO setup",
      "Fast loading & secure (SSL)",
      "Cross-device testing",
      "Post-launch support",
    ],
  },
};

/** Pick a template from the service slug/title (most specific first). */
function templateFor(slug: string, title: string): Template {
  const s = `${slug} ${title}`.toLowerCase();
  if (/e-?commerce|ecom|shop|store|cart/.test(s)) return T.ecommerce;
  if (/wordpress|wp\b|cms/.test(s)) return T.wordpress;
  if (/\bseo\b|search engine/.test(s)) return T.seo;
  if (/marketing|ads?|ppc|social media|smm/.test(s)) return T.marketing;
  if (/graphic|logo|brand(ing)?|design package|creative/.test(s)) return T.graphic;
  if (/mobile|app\b|ui\s*\/?\s*ux|ux\b|ui\b/.test(s)) return T.mobile;
  if (/develop|web app|application|software/.test(s)) return T.development;
  if (/design/.test(s)) return T.design;
  return T.default;
}

// Global QuotationSettings defaults (mirror the reference quotation).
const SETTINGS_DEFAULTS = {
  validity: "1 Month",
  deliveryTime: "15 – 25 working days",
  hostingCost: "₹5,000 / year",
  hostingNote:
    "Hosting is billed annually and includes SSL, daily backups and 99.9% uptime. The first year can be bundled with the project.",
  domainNote:
    "Domain registration (.com / .in) is charged at actuals (approx. ₹800 – ₹1,200 / year) and renewed yearly.",
  paymentTerms: [
    { percent: "20%", label: "Advance", sub: "To kick off the project" },
    { percent: "30%", label: "After Design Approval", sub: "On sign-off of the design" },
    { percent: "50%", label: "Before Final Deployment", sub: "Prior to going live" },
  ],
  featureBadges: [
    { title: "Modern & Responsive", subtitle: "Looks great on every device" },
    { title: "Basic SEO Setup", subtitle: "Ready to be found on Google" },
    { title: "Secure & Reliable", subtitle: "SSL, backups & best practices" },
    { title: "Support & Assistance", subtitle: "Help after you go live" },
  ],
  greetingTemplate:
    "Dear {clientName}, thank you for your interest in Web Digital Development. Based on your requirement, please find below our detailed quotation for your project.",
  footerNote: "Thank you for considering Web Digital Development for your project.",
};

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", new Schema({}, { strict: false, collection: "services" }));

const QuotationSettings =
  mongoose.models.QuotationSettings ||
  mongoose.model("QuotationSettings", new Schema({}, { strict: false, collection: "quotationsettings" }));

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

async function main() {
  console.log(`→ DB target: ${maskDbTarget(MONGODB_URI!)}`);
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  // --- Services -----------------------------------------------------------
  const services = (await Service.find({}).lean()) as Array<Record<string, unknown>>;
  console.log(`Found ${services.length} service(s).`);

  let filled = 0,
    skipped = 0;

  for (const doc of services) {
    const slug = String(doc.slug ?? "");
    const title = String(doc.title ?? "");
    const tmpl = templateFor(slug, title);

    const set: Record<string, unknown> = {};
    const neverConfigured = isEmpty(doc.quotationCostRange) && isEmpty(doc.quotationScope);

    if (isEmpty(doc.quotationCostRange)) set.quotationCostRange = tmpl.cost;
    if (isEmpty(doc.quotationScope)) set.quotationScope = tmpl.scope;
    if (isEmpty(doc.quotationTitle)) set.quotationTitle = tmpl.title;
    // Enable only for services never configured — respects a manual disable.
    if (!doc.quotationEnabled && neverConfigured) set.quotationEnabled = true;

    if (Object.keys(set).length === 0) {
      console.log(`• ${title || slug}: already configured — skipped`);
      skipped++;
      continue;
    }

    await Service.updateOne({ _id: doc._id }, { $set: set });
    console.log(`✓ ${title || slug}: filled [${Object.keys(set).join(", ")}] (${tmpl.cost})`);
    filled++;
  }

  // --- Global QuotationSettings -------------------------------------------
  const existing = (await QuotationSettings.findOne({}).lean()) as Record<string, unknown> | null;
  if (!existing) {
    await QuotationSettings.create(SETTINGS_DEFAULTS);
    console.log("\n✓ Global QuotationSettings: created with defaults.");
  } else {
    const set: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(SETTINGS_DEFAULTS)) {
      if (isEmpty(existing[key])) set[key] = val;
    }
    if (Object.keys(set).length === 0) {
      console.log("\n• Global QuotationSettings: already populated — skipped.");
    } else {
      await QuotationSettings.updateOne({ _id: existing._id }, { $set: set });
      console.log(`\n✓ Global QuotationSettings: filled [${Object.keys(set).join(", ")}].`);
    }
  }

  console.log(`\n✓ Done — services filled ${filled}, skipped ${skipped}.`);
  console.log("  (Only empty fields were filled; your manual edits were preserved.)");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ fill-service-quotations failed:", err);
  process.exit(1);
});
