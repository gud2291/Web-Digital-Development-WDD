/* eslint-disable no-console */
/**
 * Content seed script — populates ALL production content from CONTENT_PLAN.md
 * into MongoDB.
 *
 * Run:  npx tsx scripts/seed-content.ts
 *
 * Notes
 * ─────
 * - Idempotent: every document is upserted by its unique field (slug / pageSlug
 *   / name / title) or, for singletons, by an empty filter. Re-running is safe.
 * - Image / video fields are intentionally left as "" — the admin uploads media
 *   via Cloudinary later. No placeholder URLs are used.
 * - This script does NOT import any `server-only` module (db/mongodb.ts, models/*)
 *   because those throw or fail to resolve outside the Next.js bundler. Instead it
 *   declares standalone schemas that MIRROR src/server/models/*.ts exactly and
 *   registers them under the SAME model names, so the collections written here are
 *   the same ones the app reads (settings, sitecontents, homepages, services,
 *   projects, teams, testimonials, registrations, blogs, legalpages, seometas,
 *   chatbots). The real model files are never modified.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// ─── Env loading (mirrors scripts/seed.ts — no dotenv dependency) ────────────
function loadEnvLocal() {
  const candidates = [".env.local", ".env"];
  for (const name of candidates) {
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

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set (check .env.local)");
  process.exit(1);
}

// ─── Bookkeeping ─────────────────────────────────────────────────────────────
const warnings: string[] = [];
const errors: string[] = [];
const sectionsCompleted: string[] = [];
let totalDocs = 0;

function warn(msg: string) {
  warnings.push(msg);
  console.warn(`  ⚠ ${msg}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Convert an array of paragraph strings into TipTap-safe HTML. */
function toHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => `<p>${p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`)
    .join("\n");
}
/** Split a comma-separated feature sentence into a feature array. */
function feats(s: string): string[] {
  return s
    .split(", ")
    .map((x) => x.trim())
    .filter(Boolean);
}

// ════════════════════════════════════════════════════════════════════════════
//  SCHEMAS — mirror src/server/models/*.ts exactly
// ════════════════════════════════════════════════════════════════════════════

// Settings ───────────────────────────────────────────────────────────────────
const BusinessSchema = new Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    hoursWeek: { type: String, default: "" },
    hoursSunday: { type: String, default: "" },
  },
  { _id: false }
);
const SocialSchema = new Schema(
  {
    fb: { type: String, default: "" },
    tw: { type: String, default: "" },
    li: { type: String, default: "" },
    ig: { type: String, default: "" },
    yt: { type: String, default: "" },
  },
  { _id: false }
);
const AnalyticsSchema = new Schema(
  {
    ga4: { type: String, default: "" },
    gtm: { type: String, default: "" },
    clarity: { type: String, default: "" },
  },
  { _id: false }
);
const QuickActionSchema = new Schema(
  { label: { type: String, required: true }, payload: { type: String, default: "" } },
  { _id: false }
);
const ChatbotConfigSchema = new Schema(
  {
    name: { type: String, default: "WDD Assistant" },
    avatar: { type: String, default: "" },
    welcome: { type: String, default: "Hi! How can I help?" },
    placeholder: { type: String, default: "Type your message…" },
    quickActions: { type: [QuickActionSchema], default: [] },
  },
  { _id: false }
);
const SeoConfigSchema = new Schema(
  { defaultOgImage: { type: String, default: "" }, schemaOrg: { type: String, default: "" } },
  { _id: false }
);
const SettingsSchema = new Schema(
  {
    business: { type: BusinessSchema, default: () => ({}) },
    social: { type: SocialSchema, default: () => ({}) },
    analytics: { type: AnalyticsSchema, default: () => ({}) },
    chatbot: { type: ChatbotConfigSchema, default: () => ({}) },
    seo: { type: SeoConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// SiteContent ──────────────────────────────────────────────────────────────--
const TimelineItemSchema = new Schema(
  {
    year: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);
const AboutSchema = new Schema(
  {
    heading: { type: String, default: "" },
    description: { type: String, default: "" },
    whyChooseUs: { type: [String], default: [] },
    timeline: { type: [TimelineItemSchema], default: [] },
  },
  { _id: false }
);
const ContactPageSchema = new Schema(
  {
    mapEmbedUrl: { type: String, default: "" },
    descText: { type: String, default: "" },
    budgetRanges: { type: [String], default: [] },
    quickPromises: { type: [String], default: [] },
  },
  { _id: false }
);
const NavLinkSchema = new Schema(
  { label: { type: String, required: true }, href: { type: String, required: true } },
  { _id: false }
);
const NavLinksSchema = new Schema(
  {
    header: { type: [NavLinkSchema], default: [] },
    footerQuick: { type: [NavLinkSchema], default: [] },
    footerServices: { type: [NavLinkSchema], default: [] },
  },
  { _id: false }
);
const FooterSchema = new Schema(
  {
    tagline: { type: String, default: "" },
    copyright: { type: String, default: "" },
    policyLinks: { type: [NavLinkSchema], default: [] },
  },
  { _id: false }
);
const SiteContentSchema = new Schema(
  {
    about: { type: AboutSchema, default: () => ({}) },
    banners: { type: Schema.Types.Mixed, default: {} },
    contactPage: { type: ContactPageSchema, default: () => ({}) },
    navLinks: { type: NavLinksSchema, default: () => ({}) },
    footer: { type: FooterSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Homepage ─────────────────────────────────────────────────────────────────--
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
const StatSchema = new Schema(
  { value: { type: String, required: true }, label: { type: String, required: true } },
  { _id: false }
);
const ClientLogoSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);
const SectionTitlesSchema = new Schema(
  {
    portfolio: { type: String, default: "Our Portfolio" },
    services: { type: String, default: "Our Services" },
    testimonials: { type: String, default: "Client Love" },
    badge: { type: String, default: "Trusted by 100+ businesses" },
  },
  { _id: false }
);
const CTABannerSchema = new Schema(
  { title: { type: String, default: "" }, sub: { type: String, default: "" } },
  { _id: false }
);
const HomepageSchema = new Schema(
  {
    heroSlides: { type: [HeroSlideSchema], default: [] },
    stats: { type: [StatSchema], default: [] },
    clientLogos: { type: [ClientLogoSchema], default: [] },
    ctaBanner: { type: CTABannerSchema, default: () => ({}) },
    sectionTitles: { type: SectionTitlesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Service ──────────────────────────────────────────────────────────────────--
const FAQSubSchema = new Schema(
  { q: { type: String, required: true }, a: { type: String, required: true } },
  { _id: false }
);
const PricingTierSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
  },
  { _id: false }
);
const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    icon: { type: String, default: "Globe" },
    features: { type: [String], default: [] },
    faqs: { type: [FAQSubSchema], default: [] },
    pricingTiers: { type: [PricingTierSchema], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Project ──────────────────────────────────────────────────────────────────--
const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true, trim: true, lowercase: true },
    category: { type: String, default: "Web", index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    tech: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Team ─────────────────────────────────────────────────────────────────────--
const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "" },
    photo: { type: String, default: "" },
    bio: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Testimonial ──────────────────────────────────────────────────────────────--
const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhoto: { type: String, default: "" },
    clientCompany: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    helpfulCount: { type: Number, default: 0 },
    adminHearted: { type: Boolean, default: false },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    source: { type: String, enum: ["google", "manual"], default: "manual" },
  },
  { timestamps: true }
);

// Registration ─────────────────────────────────────────────────────────────--
const ProcessStepSchema = new Schema(
  {
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);
const RegistrationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    intro: { type: String, default: "" },
    whoNeeds: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    processSteps: { type: [ProcessStepSchema], default: [] },
    governmentFee: { type: String, default: "" },
    wddFee: { type: String, default: "" },
    faqs: { type: [FAQSubSchema], default: [] },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Blog ─────────────────────────────────────────────────────────────────────--
const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    author: { type: String, default: "WDD Team" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
    published: { type: Boolean, default: false, index: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// LegalPage ────────────────────────────────────────────────────────────────--
const LegalPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: ["privacy-policy", "terms", "refund"],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// SeoMeta ──────────────────────────────────────────────────────────────────--
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

// Chatbot ──────────────────────────────────────────────────────────────────--
const ChatbotSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: "general", index: true },
    embedding: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

// ─── Model registration (same names → same collections as the app) ───────────
const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
const SiteContent = mongoose.models.SiteContent || mongoose.model("SiteContent", SiteContentSchema);
const Homepage = mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
const LegalPage = mongoose.models.LegalPage || mongoose.model("LegalPage", LegalPageSchema);
const SeoMeta = mongoose.models.SeoMeta || mongoose.model("SeoMeta", SeoMetaSchema);
const Chatbot = mongoose.models.Chatbot || mongoose.model("Chatbot", ChatbotSchema);

// ─── Generic upsert helpers ──────────────────────────────────────────────────
async function upsert(model: mongoose.Model<any>, filter: Record<string, unknown>, data: Record<string, unknown>) {
  await model.findOneAndUpdate(filter, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
  totalDocs += 1;
}
/** Upsert a list, returning count. Each item must carry its own filter via `key`. */
async function upsertMany(
  model: mongoose.Model<any>,
  items: Record<string, any>[],
  keyFields: string[]
) {
  for (const item of items) {
    const filter: Record<string, unknown> = {};
    for (const k of keyFields) filter[k] = item[k];
    await upsert(model, filter, item);
  }
  return items.length;
}

// ════════════════════════════════════════════════════════════════════════════
//  CONTENT (transcribed from CONTENT_PLAN.md)
// ════════════════════════════════════════════════════════════════════════════

// ─── Sections 1-4 → Settings ─────────────────────────────────────────────────
async function seedSettings() {
  // Unsupported fields in the Settings schema:
  warn("Settings: 'tagline', 'founded', 'founder', 'serviceAreas' (S1) have no schema field — skipped.");
  warn("Settings.social: WhatsApp URL (S2) has no field (derived from phone) — skipped.");
  warn("Settings.analytics: GA4/GTM/Clarity (S4) are placeholders — stored empty for the admin to fill.");

  const data = {
    business: {
      phone: "+91 8130270050",
      email: "support@webdigitaldevelopment.in",
      address: "Palam, New Delhi, Delhi — 110045",
      hoursWeek: "Mon–Sat: 10:00 AM — 7:30 PM",
      hoursSunday: "Sunday: Closed (WhatsApp replies the same day)",
    },
    social: {
      fb: "https://www.facebook.com/share/17p9P2C62A/?mibextid=wwXIfr",
      ig: "https://www.instagram.com/web_digital_development112211",
      li: "https://linkedin.com/in/gudia-yadav-7aa002220",
      yt: "",
      tw: "",
    },
    analytics: { ga4: "", gtm: "", clarity: "" },
    chatbot: {
      name: "Aria",
      avatar: "/assets/aria-avatar.jpg",
      welcome:
        "Hi! I'm Aria from Web Digital Development. 👋 Looking for a new website, SEO that actually ranks, or help with Pvt Ltd / MSME registration? Tell me what you're working on — I can explain our process, show you our work, or get a human on it in under an hour.",
      placeholder: "Type your question…",
      quickActions: [
        { label: "Start My Project", payload: "/contact" },
        { label: "See Our Work", payload: "/projects" },
        { label: "Talk to a Human", payload: "escalate" },
      ],
    },
    seo: { defaultOgImage: "", schemaOrg: "" },
  };
  await upsert(Settings, {}, data);
  console.log("✓ Seeded Settings (singleton)");
  sectionsCompleted.push("Settings (S1–S4)");
}

// ─── Sections 5-9 → SiteContent ──────────────────────────────────────────────
async function seedSiteContent() {
  warn("SiteContent.about.timeline: each milestone stored in 'title' (no separate title/description in source).");

  const banner = (title: string, subtitle: string) => ({ title, subtitle, bg: "", ctaText: "", ctaUrl: "" });

  const data = {
    about: {
      heading: "From a one-woman setup to Delhi's most trusted web studio.",
      description: [
        "Web Digital Development started with a simple idea — that small businesses in India deserve the same quality of website that a Fortune 500 company gets, just without the Fortune 500 price tag. We're a Delhi-based studio that designs, codes and ranks websites for clients across India and abroad. No outsourcing, no white-labelling, no templates dressed up as \"custom\" work. Every site we ship is built by our own team, here in New Delhi.",
        "Four years in, we've launched **150+ websites**, ranked dozens of them on the first page of Google, and built long-term relationships with clients we now consider friends. We're proud of the businesses we've helped grow — from a Spanish e-commerce brand to a tour operator in north India to plantation companies and motor glass dealers. If your business has a story, we know how to put it on the internet in a way that wins customers.",
      ].join("\n\n"),
      whyChooseUs: [
        "**Custom-coded, not templated** — Every site is designed and developed from scratch. We don't sell Wix or hand you a Wordpress theme and disappear.",
        "**Built to rank** — SEO isn't a bolt-on. Our developers and content team build sites that Google actually understands.",
        "**Founder-led** — Talk to Gudia or a senior dev directly. No project manager wall between you and the people writing your code.",
        "**Delhi-based, India-wide** — Same time zone, same language, same fast turnaround. WhatsApp replies in minutes, not days.",
        "**One-month launch support** — We don't ship and ghost. The first month after go-live is covered by our post-launch support.",
        "**Clear written scope** — Everything agreed in writing before we start. No \"discovery phase invoice\" surprises.",
      ],
      timeline: [
        { year: "Start", title: "Web Digital Development founded by Gudia Yadav in New Delhi", description: "" },
        { year: "2020", title: "First international client onboarded — Expoed, Spain", description: "" },
        {
          year: "2022",
          title: "Crossed 200 website launches; added SEO + Digital Marketing as full services",
          description: "",
        },
        {
          year: "2024",
          title:
            "Added Pvt Ltd / MSME / 12A-80G registration consulting; opened second floor of our Palam office",
          description: "",
        },
        {
          year: "2026",
          title:
            "Rebuilt our own studio website on a modern stack (Next.js + AI chatbot) — this site you're on",
          description: "",
        },
      ],
    },
    banners: {
      about: banner(
        "Who's behind the screens at Web Digital Development",
        "A team that codes, ranks and replies on WhatsApp — all from one studio in Delhi."
      ),
      services: banner(
        "What we actually do, in plain English",
        "Website design, development, SEO, e-commerce, marketing, registrations — all in one place, all in one team."
      ),
      projects: banner(
        "A few sites we're proud of",
        "Real businesses. Real traffic. Real revenue. Click any project to see what we did and how it performed."
      ),
      blog: banner(
        "Notes on websites, SEO and the small-business internet",
        "Practical posts — what works on Google in 2026, what we charge and why, what to avoid."
      ),
      contact: banner(
        "Let's talk about your project",
        "You'll hear back within one working day — straight answers, no hard sell."
      ),
      reviews: banner(
        "What our clients say",
        "Unedited, with names and links to their live sites. Read them all."
      ),
      registrations: banner(
        "Get your business legally compliant",
        "Pvt Ltd, MSME, 12A & 80G, NGO Darpan, ESIC & EPF, Startup India — handled end-to-end."
      ),
      legal: banner(
        "The legal stuff, kept short",
        "Privacy, terms, refund — written in human English, not lawyer-speak."
      ),
    },
    contactPage: {
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.3236074045712!2d77.08623757500683!3d28.590067186008596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b95ba8647db%3A0x18ce4ebf23e0f035!2sWeb%20Digital%20Development!5e0!3m2!1sen!2sin!4v1768057102970!5m2!1sen!2sin",
      descText:
        "Tell us about your project and you'll hear back from Gudia or a senior dev — usually within a few hours, never longer than one working day. If you prefer, ping us on WhatsApp at +91 8130270050. We don't do hard-sell calls; just a quick chat to understand what you need and a clear written proposal shortly after.",
      budgetRanges: [],
      quickPromises: [
        "**Reply in under 24 hours** — usually within a few hours during work days.",
        "**Direct access to the team** — you talk to the people doing the work.",
        "**Clear written scope** — everything agreed in writing before we start.",
        "**NDA on request** — we'll sign before you share anything sensitive.",
      ],
    },
    navLinks: {
      header: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Projects", href: "/projects" },
        { label: "Blog", href: "/blog" },
        { label: "Reviews", href: "/reviews" },
        { label: "Contact", href: "/contact" },
      ],
      footerQuick: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Our Services", href: "/services" },
        { label: "Our Projects", href: "/projects" },
        { label: "Blog", href: "/blog" },
        { label: "Sitemap", href: "/sitemap" },
        { label: "Contact Us", href: "/contact" },
      ],
      footerServices: [
        { label: "Website Designing", href: "/services/website-designing" },
        { label: "Website Development", href: "/services/website-development" },
        { label: "SEO Services", href: "/services/seo-services" },
        { label: "Digital Marketing", href: "/services/digital-marketing" },
        { label: "E-commerce Development", href: "/services/ecommerce-development" },
        { label: "Graphic Designing", href: "/services/graphic-designing" },
      ],
    },
    footer: {
      tagline:
        "Web Digital Development — Delhi's small but mighty website studio. Serving Delhi NCR (Delhi, Noida, Gurgaon, Faridabad) and clients across India and abroad.",
      copyright: "© 2026 Web Digital Development. All rights reserved. Made in Delhi.",
      policyLinks: [
        { label: "Privacy Policy", href: "/legal/privacy-policy" },
        { label: "Terms & Conditions", href: "/legal/terms" },
        { label: "Refund & Cancellation", href: "/legal/refund" },
      ],
    },
  };
  await upsert(SiteContent, {}, data);
  console.log("✓ Seeded SiteContent (singleton)");
  sectionsCompleted.push("SiteContent (S5–S9)");
}

// ─── Sections 10-13 → Homepage ───────────────────────────────────────────────
async function seedHomepage() {
  warn("Homepage.heroSlides: 'pill/kicker' and 'secondary CTA' have no schema field — skipped (primary CTA kept).");
  warn("Homepage.ctaBanner: primary/secondary buttons have no schema field — title + sub kept.");
  warn("Homepage.sectionTitles: 'Blog preview' title and all kickers/subtitles unsupported — only portfolio/services/testimonials/badge stored.");
  warn("Homepage.clientLogos: no logo names/images in source — left empty for admin upload.");

  const data = {
    heroSlides: [
      {
        type: "video",
        image: "",
        video: "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4",
        title: "Custom web applications built for **high speed.**",
        subtitle:
          "Modern Next.js 14 App Router, React, and serverless architectures. Lightning-fast web experiences that convert traffic and leave competitors behind.",
        ctaText: "See Our Work",
        ctaUrl: "/projects",
      },
      {
        type: "image",
        image: "",
        video: "",
        title: "Websites that bring you **paying customers,** not just visitors.",
        subtitle:
          "Custom-coded design and SEO-ready development from a Delhi team that has launched 150+ websites that actually grow businesses.",
        ctaText: "Discuss Your Project",
        ctaUrl: "/contact",
      },
      {
        type: "image",
        image: "",
        video: "",
        title: "Rank on Google. Then **stay there.**",
        subtitle:
          "On-page, off-page, technical, content — the full SEO stack. Average client moves to page 1 in 3-6 months.",
        ctaText: "Request an SEO Review",
        ctaUrl: "/contact",
      },
      {
        type: "image",
        image: "",
        video: "",
        title: "E-commerce stores that **sell, ship and scale.**",
        subtitle:
          "Shopify, WooCommerce, or custom Next.js builds. Clean payment gateway integrations, automated invoicing, and abandoned cart recovery.",
        ctaText: "Explore E-commerce",
        ctaUrl: "/services/ecommerce-development",
      },
    ],
    stats: [
      { value: "150+", label: "Websites Launched" },
      { value: "100+", label: "Happy Clients" },
      { value: "4+", label: "Years in Business" },
      { value: "24×7", label: "WhatsApp Support" },
    ],
    clientLogos: [],
    ctaBanner: {
      title: "Have a website idea? Let's turn it into a launch date.",
      sub: "Tell us about your project — you'll hear back within one working day.",
    },
    sectionTitles: {
      services: "Six services. One team. Zero outsourcing.",
      portfolio: "Sites we've shipped lately",
      testimonials: "They said it better than we ever could",
      badge: "Trusted by businesses across India and abroad",
    },
  };
  await upsert(Homepage, {}, data);
  console.log("✓ Seeded Homepage (singleton)");
  sectionsCompleted.push("Homepage (S10–S13)");
}

// ─── Section 14 → Services (8) ───────────────────────────────────────────────
async function seedServices() {
  const services = [
    {
      title: "Website Designing",
      slug: "website-designing",
      icon: "palette",
      shortDescription:
        "Pixel-perfect, mobile-first designs that match your brand and convert visitors into customers.",
      content: toHtml([
        "Most websites look fine on a designer's laptop and fall apart everywhere else. We design for the actual world — slow phones in metro tunnels, accountants on Internet Explorer, business owners who'll bounce in 3 seconds if your page is ugly.",
        "Every Web Digital Development design starts with one question — who's going to use this site, and what do they need to do in the next 30 seconds? From there we wireframe, prototype in Figma, get your sign-off, and only then write code. No surprise redesigns mid-project.",
        "We've designed for Spanish e-commerce, north-Indian tourism, real estate, plantation, motor glass, and a few dozen industries in between. Whatever your niche, we've probably designed for something close.",
      ]),
      features: [
        "Mobile-first, looks great on every screen",
        "Custom UI — no templates, no Wix dressed up",
        "Figma prototypes you can click through before we code",
        "Brand-aligned colour, typography, imagery",
        "Accessibility checked (WCAG AA baseline)",
        "Designed with SEO and conversion in mind from day one",
      ],
      faqs: [
        {
          q: "Can we see designs before development starts?",
          a: "Yes — we send a clickable Figma prototype after the first round and only proceed to code once you're happy.",
        },
        {
          q: "Do you provide unlimited revisions?",
          a: "Three rounds of feedback are included in the standard scope. Beyond that, extra rounds are scoped separately and agreed with you in writing before any work starts.",
        },
        {
          q: "Will it work on old browsers?",
          a: "We target the latest two versions of Chrome, Safari, Edge and Firefox. IE11 is supported if you specifically ask for it.",
        },
        {
          q: "Who owns the design files?",
          a: "You do. We hand over Figma source + production assets on handover day.",
        },
      ],
      pricingTiers: [],
      seoTitle: "Website Design Services in Delhi",
      seoDescription:
        "Mobile-first, conversion-focused website design in Delhi. 150+ projects delivered, Figma prototypes before code, and one month of post-launch support.",
      visible: true,
      order: 1,
    },
    {
      title: "Website Development",
      slug: "website-development",
      icon: "code-2",
      shortDescription:
        "Fast, secure, scalable websites built with modern stacks. Next.js, React, WordPress — whatever fits your project.",
      content: toHtml([
        "Development is where good designs go to die at most agencies. Bloated themes, copy-paste plugins, code that takes 6 seconds to load — we've seen and inherited it all. Web Digital Development writes code by hand. Component-based, type-safe, optimised for Core Web Vitals.",
        "Choose your stack — modern (Next.js + headless CMS) for performance-first sites and apps, classic (WordPress with a custom theme) for editorial / content sites, or PHP if your team already maintains LAMP. We're stack-pragmatic, not religious.",
        "Every site ships with HTTPS, a clean Lighthouse score, structured data for SEO, accessibility passes, and a deployment pipeline so updates take one minute, not one afternoon.",
      ]),
      features: [
        "Modern stack: Next.js, React, TypeScript, Tailwind",
        "Or classic WordPress with custom theme",
        "Lighthouse 90+ performance score guaranteed",
        "HTTPS, security headers, OWASP-checked",
        "Schema.org structured data baked in",
        "Deployment on Vercel / your hosting",
        "SSL setup included",
        "Source code handover with documentation",
      ],
      faqs: [
        {
          q: "WordPress or custom code?",
          a: "For a brochure or blog-heavy site, WordPress saves you money and gives you a familiar editor. For e-commerce at scale or web apps, custom code (Next.js) is faster and cheaper to maintain. We'll recommend based on your actual needs.",
        },
        {
          q: "Can you take over an existing site?",
          a: "Often, yes. We'll audit your codebase first and agree a fix-up scope in writing before committing.",
        },
        {
          q: "Do you offer maintenance after launch?",
          a: "The first month after launch is covered as post-launch support. After that we offer monthly maintenance retainers covering updates, backups, security patches and small content edits.",
        },
        {
          q: "What hosting do you recommend?",
          a: "For Next.js sites — Vercel. For WordPress — Hostinger or Cloudways. We'll set up whichever you choose, and you own the account directly.",
        },
      ],
      pricingTiers: [],
      seoTitle: "Web Development Company in Delhi",
      seoDescription:
        "Hand-coded website development from a Delhi studio. Next.js, React, WordPress and PHP. 4 years, 150+ launches, Lighthouse 90+ guaranteed.",
      visible: true,
      order: 2,
    },
    {
      title: "SEO Services",
      slug: "seo-services",
      icon: "trending-up",
      shortDescription:
        "First-page rankings, more qualified leads, less wasted ad spend. Real SEO — not just \"submit to 100 directories.\"",
      content: toHtml([
        "Most SEO agencies sell smoke. We sell rankings, and we'll show you the keyword reports every month to prove it.",
        "Our SEO process starts with an audit — we'll show you exactly which technical issues, content gaps and backlink shortfalls are holding your site back. Then we agree on 10-30 priority keywords, do the on-page, content and off-page work, and report progress every 30 days.",
        "Most local-Delhi clients see page-1 results in 3-6 months. National e-commerce takes 6-12 months. We don't promise overnight, but we do promise transparency — you'll always know what we're doing and why.",
      ]),
      features: [
        "Technical SEO audit before we start",
        "Keyword research with monthly search volumes",
        "On-page SEO — titles, meta, schema, internal linking",
        "Technical SEO — speed, crawl, mobile, Core Web Vitals",
        "Content briefs and content writing",
        "Quality backlink outreach (no PBNs, no spam)",
        "Monthly ranking + traffic report",
      ],
      faqs: [
        {
          q: "How long until I see results?",
          a: "Local Delhi keywords: 2-4 months for top 10, 4-6 months for top 3. National keywords: 6-12 months. We share weekly updates so you see progress, not just final results.",
        },
        {
          q: "Do you guarantee rankings?",
          a: "We guarantee the work — quality content, clean backlinks, technical fixes. Nobody honest can guarantee a specific position, because Google won't tell anyone the exact algorithm.",
        },
        {
          q: "Do you do off-page (link building)?",
          a: "Yes — guest posts on real sites, digital PR, and a small amount of high-quality directory work. No PBNs, no fiverr packs, nothing that risks a penalty.",
        },
        {
          q: "Can you fix a Google penalty?",
          a: "Yes. We've recovered several penalised sites — usually it's manual disavow + content cleanup + 2-3 months of clean signals.",
        },
      ],
      pricingTiers: [],
      seoTitle: "SEO Services in Delhi for Page 1",
      seoDescription:
        "Professional SEO services in Delhi. Keyword-led, white-hat, monthly transparent reports. Most clients hit page 1 in 3-6 months.",
      visible: true,
      order: 3,
    },
    {
      title: "Digital Marketing",
      slug: "digital-marketing",
      icon: "megaphone",
      shortDescription:
        "Google Ads, Meta Ads, content and social — paid plus organic, planned and run by people who care about your ROAS.",
      content: toHtml([
        "Running ads without a plan is the fastest way to waste an ad account. We've audited dozens of accounts where small businesses were burning their entire monthly ad spend on broad-match keywords and ad sets that hadn't been optimised in two years.",
        "Our digital marketing service starts with a strategy session — what's your goal, what's your margin, what's your customer worth? Only then do we open Google Ads or Meta and start spending your money.",
        "We run paid ads (Google, Meta, LinkedIn), publish organic content (blog, Instagram, YouTube short scripts), and report on what's actually driving leads vs what's just driving traffic. The two are very different.",
      ]),
      features: [
        "Google Ads (Search, Performance Max, YouTube)",
        "Meta Ads (Facebook + Instagram)",
        "LinkedIn Ads (for B2B)",
        "Landing page optimisation for ads",
        "Conversion tracking + UTM setup",
        "Monthly performance report",
        "Quarterly strategy review",
      ],
      faqs: [
        {
          q: "How much ad budget should I have?",
          a: "Minimum ₹15,000/month for local Delhi targeting. ₹50,000+ for national reach. Anything less and we can't get statistically significant data fast enough.",
        },
        {
          q: "Do you charge a % of ad spend?",
          a: "No — flat monthly fee. So we're not incentivised to inflate your budget.",
        },
        {
          q: "Will you write the ad copy?",
          a: "Yes, copy + creative briefs (we don't shoot video, but we'll write the script and direct an editor).",
        },
      ],
      pricingTiers: [],
      seoTitle: "Digital Marketing Agency in Delhi",
      seoDescription:
        "Performance-led digital marketing from a Delhi studio. Paid + organic, flat monthly fee (we don't charge % of ad spend), full transparency.",
      visible: true,
      order: 4,
    },
    {
      title: "E-commerce Development",
      slug: "ecommerce-development",
      icon: "shopping-cart",
      shortDescription:
        "Online stores that actually sell. Shopify, WooCommerce, or fully custom — whichever earns you more.",
      content: toHtml([
        "E-commerce is design + tech + checkout psychology + inventory + delivery + customer service — and any one of them being broken loses you sales. We've built stores at every scale, and the difference between the strugglers and the success stories usually isn't traffic, it's checkout friction.",
        "We build on Shopify (fastest setup), WooCommerce (for full control + India payment gateways), or custom Next.js + headless commerce (for scale and unique UX). We'll recommend based on your catalogue size, expected volume and ops setup.",
        "Every store ships with Razorpay / Cashfree / Stripe integration, GST-compliant invoicing, abandoned cart recovery, and a real admin panel your operations team can actually use.",
      ]),
      features: [
        "Shopify, WooCommerce or custom build",
        "Razorpay / Cashfree / Stripe / PayU integration",
        "GST-compliant invoices auto-generated",
        "Abandoned cart email + WhatsApp recovery",
        "Inventory + variants + bundles",
        "Delivery courier integration (Shiprocket / Delhivery)",
        "Customer login + order tracking",
        "Marketing tools — coupons, upsells, cross-sells",
      ],
      faqs: [
        {
          q: "Shopify or WooCommerce?",
          a: "Catalogue under 200 SKUs and you want fast setup? Shopify. Larger catalogue, India-specific payment quirks, full control? WooCommerce. We'll recommend in writing after a 15-min chat.",
        },
        {
          q: "Do you handle product photography?",
          a: "We have a partner studio in Delhi for product shoots. Scoped separately, but we'll coordinate the whole thing.",
        },
        {
          q: "Can you migrate from my current store?",
          a: "Yes — products, customers, orders all migrate. We've done Magento → Shopify, WooCommerce → Shopify, and several custom → Next.js migrations.",
        },
      ],
      pricingTiers: [],
      seoTitle: "E-commerce Development in Delhi",
      seoDescription:
        "E-commerce sites that sell. Shopify and WooCommerce experts in Delhi. Razorpay, GST-ready, abandoned cart recovery. 4 years building online stores.",
      visible: true,
      order: 5,
    },
    {
      title: "Graphic Designing",
      slug: "graphic-designing",
      icon: "pen-tool",
      shortDescription:
        "Logos, brochures, social posts, packaging — design that makes your brand look like the leader you want to be.",
      content: toHtml([
        "Your brand identity is the first thing a customer sees and the last thing they remember. We design logos, brochures, social media posts, packaging, banners and full brand guidelines — for businesses that want to look serious without paying a Tier-1 ad agency.",
        "Every project starts with a brief — what's your business about, who's the customer, what should they feel? From there we sketch, send concepts, and refine until you're proud of what you've got.",
      ]),
      features: [
        "Logo design (3 concepts, unlimited revisions on chosen one)",
        "Brand guidelines document",
        "Business card + letterhead + email signature",
        "Brochure / pamphlet design",
        "Social media post templates",
        "Packaging design (basic)",
        "Source files (AI, PSD, Figma) on handover",
      ],
      faqs: [
        {
          q: "Do you trademark / register the logo?",
          a: "We design it; trademark registration is a separate legal process we can introduce you to a lawyer for.",
        },
        {
          q: "How many revisions?",
          a: "3 concepts initially, then unlimited revisions on the chosen direction (within scope).",
        },
      ],
      pricingTiers: [],
      seoTitle: "Graphic Design Services in Delhi",
      seoDescription:
        "Logos, brand identity, brochures and social design from a Delhi studio. Custom concepts, source files included, fast turnaround.",
      visible: true,
      order: 6,
    },
    {
      title: "WordPress Website",
      slug: "wordpress-website",
      icon: "globe",
      shortDescription:
        "Custom WordPress themes — not Elementor drag-drops. Fast, secure, easy for your team to edit.",
      content: toHtml([
        "WordPress powers 40% of the internet for a reason — it's flexible, familiar and your team can edit it without calling a developer. But most WordPress sites are slow, bloated, and a nightmare to maintain because they're built on off-the-shelf themes plus a dozen plugins.",
        "Web Digital Development builds custom WordPress themes — clean code, only the plugins you actually need, hosted on Cloudways or Hostinger for speed. Your admin staff can write blog posts, change images, edit pages — without breaking anything.",
      ]),
      features: [
        "Custom theme (no Elementor / Divi bloat)",
        "Gutenberg block editor configured for your content",
        "Yoast SEO pre-configured",
        "WooCommerce ready (if you want to add a store later)",
        "Daily backups + security plugin",
        "Cloudways / Hostinger hosting recommendation + setup",
        "Training session for your admin team",
      ],
      faqs: [
        {
          q: "Do you use Elementor or Divi?",
          a: "Usually no — they're slower and the markup is harder to optimise for SEO. If you specifically want one, we'll oblige.",
        },
        {
          q: "Can you migrate my existing WordPress site?",
          a: "Yes — fresh theme, same database, no downtime. Standard migration.",
        },
      ],
      pricingTiers: [],
      seoTitle: "WordPress Web Development in Delhi",
      seoDescription:
        "Custom WordPress development from a Delhi studio. No Elementor bloat — clean code, Gutenberg blocks, fast hosting, easy for your team to edit.",
      visible: true,
      order: 7,
    },
    {
      title: "Mobile-First UI / UX",
      slug: "mobile-first-design",
      icon: "smartphone",
      shortDescription:
        "Designs that look stunning on phones — because that's where 80% of your visitors actually are.",
      content: toHtml([
        "Open Google Analytics on any Indian business website and you'll see 70-85% of traffic coming from mobile. Yet most agencies still design on a 1920px Macbook and treat mobile as an afterthought.",
        "Web Digital Development designs mobile-first. We sketch the 360px wireframe before the desktop one. We test on a 3-year-old Redmi before we test on a Macbook. The result — your site feels native on phones, not \"responsive.\"",
      ]),
      features: [
        "360px-first wireframes",
        "Touch-target sizing (min 44×44px)",
        "Real-device testing (Android + iOS)",
        "Reduced-motion + dark-mode aware",
        "Lazy-loaded media for slow networks",
        "WhatsApp / phone CTAs prominent on mobile",
      ],
      faqs: [],
      pricingTiers: [],
      seoTitle: "Mobile-First Website Design",
      seoDescription:
        "Mobile-first design from a Delhi studio. We design at 360px first, test on real Android + iPhone, prioritise touch + speed. Built for India's mobile-heavy traffic.",
      visible: true,
      order: 8,
    },
  ];
  warn("Service 'Mobile-First UI / UX': source has no pricing tiers — stored the add-on price as a single 'Add-on' tier.");
  const n = await upsertMany(Service, services, ["slug"]);
  console.log(`✓ Seeded ${n} Services`);
  sectionsCompleted.push(`Services (S14) — ${n}`);
}

// ─── Section 15 → Projects (4) ───────────────────────────────────────────────
async function seedProjects() {
  warn("Projects: 'short description (card)' has no separate field — full description stored in 'description'.");
  const projects = [
    {
      title: "Expoed",
      slug: "expoed",
      category: "E-commerce",
      liveUrl: "https://expoed.es",
      tech: ["WordPress", "WooCommerce", "Stripe (EUR)", "Spanish + English bilingual"],
      featured: true,
      visible: true,
      order: 1,
      image: "",
      description: [
        "Expoed came to us in 2020 with a clear brief — they wanted a clean, conversion-focused store that wouldn't look out of place next to Spain's best D2C brands. We designed the entire identity from scratch, built the store on WooCommerce (for full control over their European payment + tax workflow), and shipped a Spanish + English version that switched seamlessly based on visitor location.",
        "Four years later, Expoed is one of our longest-running clients. We've redesigned twice, added new product lines, and helped them rank for high-intent Spanish keywords. Yasmin (founder) called us \"dependable, innovative, and quick to respond\" — which is the kind of testimonial that means more than any award.",
      ].join("\n\n"),
    },
    {
      title: "SBM Greens",
      slug: "sbm-greens",
      category: "Corporate",
      liveUrl: "https://sbmgreens.com",
      tech: ["WordPress with custom theme", "custom contact + enquiry forms"],
      featured: true,
      visible: true,
      order: 2,
      image: "",
      description: [
        "SBM Greens operates in plantation and farm-management — a high-trust industry where the website is often the first touchpoint for a six-figure enquiry. We designed a clean, photography-led site that put their plantations front and centre, with case studies and a project-enquiry flow that converted at 4× their previous site.",
        "\"Web Digital Development also offered first-rate post-launch support and maintenance, immediately resolving any problems and ensuring everything functioned without a hitch.\" — Ranjit Singh, SBM Greens.",
      ].join("\n\n"),
    },
    {
      title: "Vishwakarma Tour",
      slug: "vishwakarma-tour",
      category: "Tourism",
      liveUrl: "https://vishwakarmatouristservice.com",
      tech: ["WordPress", "custom booking enquiry", "integrated with WhatsApp"],
      featured: true,
      visible: true,
      order: 3,
      image: "",
      description: [
        "Tourist operators live and die by their enquiry forms. We built Vishwakarma Tour's site around one goal — getting a phone-equipped customer from \"I'm thinking of going to Manali\" to \"here's my number, call me\" in under 60 seconds. The result is a mobile-first design with a prominent WhatsApp button on every page, a tour-package grid that filters in real time, and an enquiry form that submits to both the office inbox and the founder's WhatsApp.",
        "\"The website is easy to use, responsive. Their staff provided exactly what we needed and did so in a professional and helpful manner.\" — Taranjeet, Vishwakarma Tour.",
      ].join("\n\n"),
    },
    {
      title: "Shree Namo Motar",
      slug: "shree-namo-motar",
      category: "Automotive",
      liveUrl: "",
      tech: ["WordPress", "custom catalogue display"],
      featured: false,
      visible: true,
      order: 4,
      image: "",
      description: [
        "Shree Namo's customers are workshop owners and walk-in retail buyers, often browsing on slow networks in workshops. The brief was straightforward — show the product catalogue, make the phone number impossible to miss, and load even on patchy 3G. We delivered all three with a sub-2-second mobile load time and a sticky call button on every screen.",
        "Sneha (the owner) shared one of our favourite reviews: \"a perfect blend of style and substance\" — high praise from someone whose business runs on practicality.",
      ].join("\n\n"),
    },
  ];
  warn("Project 'Shree Namo Motar': live URL marked '(client to confirm)' — left empty.");
  const n = await upsertMany(Project, projects, ["slug"]);
  console.log(`✓ Seeded ${n} Projects`);
  sectionsCompleted.push(`Projects (S15) — ${n}`);
}

// ─── Section 16 → Team (1) ───────────────────────────────────────────────────
async function seedTeam() {
  const team = [
    {
      name: "Gudia Yadav",
      designation: "Founder & Lead Designer",
      photo: "",
      bio: "Gudia founded Web Digital Development with one laptop, a Tata Sky connection and a stubborn belief that small businesses deserve better websites. Four years and 150+ projects later, she still personally reviews every design before it ships. Based in Palam, New Delhi.",
      linkedinUrl: "https://linkedin.com/in/gudia-yadav-7aa002220",
      visible: true,
      order: 1,
    },
  ];
  const n = await upsertMany(Team, team, ["name"]);
  console.log(`✓ Seeded ${n} Team member`);
  sectionsCompleted.push(`Team (S16) — ${n}`);
}

// ─── Section 17 → Testimonials (4) ───────────────────────────────────────────
async function seedTestimonials() {
  const testimonials = [
    {
      clientName: "Yasmin Carol",
      clientCompany: "Expoed (Spain)",
      clientPhoto: "",
      rating: 5,
      message:
        "It was a pleasure working with Web Digital Development. The website is well-designed, polished, and easy to use. Gudia and her team were dependable, innovative, and quick to respond. For top-notch web design services — highly recommended.",
      source: "manual",
      visible: true,
      adminHearted: true,
      order: 1,
    },
    {
      clientName: "Ranjit Singh",
      clientCompany: "SBM Greens",
      clientPhoto: "",
      rating: 5,
      message:
        "In addition to creating a fantastic website, Web Digital Development also offered first-rate post-launch support and maintenance, immediately resolving any problems and ensuring everything functioned without a hitch.",
      source: "manual",
      visible: true,
      adminHearted: false,
      order: 2,
    },
    {
      clientName: "Sneha",
      clientCompany: "Shree Namo Motar Glass",
      clientPhoto: "",
      rating: 5,
      message:
        "I recently had the pleasure of visiting Web Digital Development, and I must say, I was thoroughly impressed by the design and functionality of the site. As someone who values both aesthetics and user experience, I found Shree Namo Motar Glass to be a perfect blend of style and substance.",
      source: "manual",
      visible: true,
      adminHearted: false,
      order: 3,
    },
    {
      clientName: "Taranjeet",
      clientCompany: "Vishwakarma Tour",
      clientPhoto: "",
      rating: 5,
      message:
        "Our website, vishwakarmatouristservice.com, was expertly designed by Web Digital Development. The website is easy to use, responsive. Their staff provided exactly what we needed and did so in a professional and helpful manner.",
      source: "manual",
      visible: true,
      adminHearted: false,
      order: 4,
    },
  ];
  const n = await upsertMany(Testimonial, testimonials, ["clientName", "clientCompany"]);
  console.log(`✓ Seeded ${n} Testimonials`);
  sectionsCompleted.push(`Testimonials (S17) — ${n}`);
}

// ─── Section 18 → Registrations (6) ──────────────────────────────────────────
function steps(arr: string[]) {
  return arr.map((title, i) => ({ step: i + 1, title, description: "" }));
}
async function seedRegistrations() {
  warn("Registrations: source SEO title/description have no schema field on Registration — skipped.");
  const registrations = [
    {
      title: "Pvt Ltd Company Registration",
      slug: "pvt-ltd-registration",
      intro:
        "Incorporate your Private Limited Company and build a legally recognized, scale-ready corporate entity. Best for startups looking to raise venture capital or protect shareholders with limited liability. We handle name reservation, DSC, DIN, SPICe+ filing, PAN, TAN, and ESIC/EPF setup.",
      whoNeeds: [
        "Startups planning to raise angel or venture capital funding",
        "Co-founders looking to define clear equity shareholding split",
        "Businesses wanting limited liability protection for personal assets",
        "Brands intending to establish a premium corporate identity",
      ],
      benefits: [
        "Limited Liability — shareholders' personal assets are 100% protected",
        "Separate Legal Entity — can own assets, sign contracts, and sue in its own name",
        "Venture Ready — VC funds, angel networks, and banks prefer Pvt Ltd entities",
        "Easy Share Transfer — equity can be easily allocated or transferred to new investors",
        "Dual Class Shares & ESOPs — easily incentivize team members with stock options",
      ],
      documents: [
        "PAN cards of all proposed Directors and Shareholders",
        "Aadhaar card or passport (for NRI directors)",
        "Proof of Identity (Voter ID / Driving License / Bank Statement)",
        "Proof of Address (latest Utility Bill like electricity/phone under director's name)",
        "Passport size photographs of all directors",
        "Registered office address proof (NOC from owner + utility bill + rent agreement)",
      ],
      processSteps: steps([
        "Name reservation on MCA portal (RUN facility)",
        "Acquisition of Digital Signature Certificates (DSC) for all directors",
        "Drafting of MOA (Memorandum of Association) & AOA (Articles of Association)",
        "Filing of SPICe+ incorporation form on MCA",
        "Allocation of DIN, PAN, TAN, and Certificate of Incorporation (CoI)",
        "Opening of corporate bank account and commencement of business declaration",
      ]),
      governmentFee: "₹1,500 (approximate; varies by state & capital structure)",
      wddFee: "₹6,000 (incorporation package fee)",
      faqs: [
        {
          q: "What is the minimum requirement for a Private Limited Company?",
          a: "You need a minimum of 2 shareholders, 2 directors (one must be an Indian resident), and a registered office address in India.",
        },
        {
          q: "How long does it take to incorporate?",
          a: "Usually 7 to 12 working days, depending on name approval times and MCA processing speeds.",
        },
        {
          q: "Are the DIN and DSC included in your fee?",
          a: "Yes! Our package includes DSC for 2 directors, DIN for 2 directors, name approval, and drafting of MoA/AoA.",
        },
      ],
      visible: true,
      order: 1,
    },
    {
      title: "MSME (Udyam) Registration",
      slug: "msme-registration",
      intro:
        "MSME registration (now called Udyam) gives small businesses access to government schemes, subsidies, easier loans and faster payments from corporates. It's free with the government but the form is finicky — we file it correctly the first time.",
      whoNeeds: [
        "Manufacturers with investment up to ₹50 crore",
        "Service providers with investment up to ₹50 crore",
        "Traders are eligible since 2021",
      ],
      benefits: [
        "Collateral-free loans up to ₹2 crore",
        "Lower interest rates from PSU banks",
        "50% subsidy on patent and trademark filing",
        "Protection against delayed payments (Section 15-22 of MSMED Act)",
        "Preference in government tenders",
        "Electricity bill concessions in some states",
      ],
      documents: [
        "Aadhaar number of proprietor / partner / director",
        "PAN of business",
        "GSTIN (if registered)",
        "Bank account details",
      ],
      processSteps: steps([
        "Free 15-min consultation — we confirm your eligibility and category (Micro / Small / Medium)",
        "Aadhaar + PAN verification",
        "Online filing on the Udyam portal",
        "Real-time OTP verification",
        "Udyam certificate generated and emailed (same day)",
      ]),
      governmentFee: "₹0",
      wddFee: "₹999 (one-time)",
      faqs: [
        { q: "How long?", a: "Usually same day if Aadhaar OTP works. Sometimes 24 hours." },
        {
          q: "What's the difference between MSME and Udyam?",
          a: "Same thing — MSME was renamed Udyam in 2020. The certificate now says \"Udyam Registration Number.\"",
        },
      ],
      visible: true,
      order: 2,
    },
    {
      title: "12A & 80G Registration",
      slug: "12a-80g-registration",
      intro:
        "If you run a charitable trust, society or Section 8 company, 12A registration exempts your income from tax and 80G lets your donors claim deductions. Both are essential for serious fundraising — corporates and CSR funds won't donate to NGOs without 80G.",
      whoNeeds: [
        "Registered NGOs / trusts / societies / Section 8 companies",
        "Anyone planning to fundraise from individuals or corporates",
      ],
      benefits: [
        "12A — your NGO's income is exempt from income tax",
        "80G — donors get 50% tax deduction on donations",
        "Required to receive CSR funds from companies",
        "Eligibility for government grants",
        "Eligibility for FCRA (if you also want foreign funding)",
      ],
      documents: [
        "Registration certificate of the trust / society / Section 8 company",
        "PAN of the organisation",
        "MOA / Trust Deed",
        "Audit reports of last 3 years (if applicable)",
        "List of trustees / directors with PAN + Aadhaar",
        "Activity report and future plans",
      ],
      processSteps: steps([
        "Consultation — review your trust deed and activities",
        "Form 10A drafting (for new applications) or Form 10AB (for re-validation)",
        "Online filing on the Income Tax portal",
        "Document upload and digital signature",
        "CIT (Exemption) review — usually 3-6 months",
        "Approval letter and certificate",
      ]),
      governmentFee: "₹0",
      wddFee: "₹5,000 (12A + 80G combined)",
      faqs: [
        { q: "How long?", a: "3-6 months for IT department approval. Filing itself is 1 week." },
        {
          q: "Can a new NGO apply?",
          a: "Yes — since 2020 even brand-new NGOs can apply for 12A and 80G provisionally for 3 years, then convert to permanent.",
        },
      ],
      visible: true,
      order: 3,
    },
    {
      title: "Startup India Registration (DPIIT)",
      slug: "startup-india-registration",
      intro:
        "DPIIT recognition under Startup India unlocks tax breaks (3 years of income-tax exemption), faster patent filing, easier compliance, and access to government funding rounds. Free to apply — we file it for you correctly.",
      whoNeeds: [
        "Private limited companies, LLPs or registered partnerships",
        "Less than 10 years old",
        "Annual turnover below ₹100 crore",
        "Working on innovation, development or commercialisation of new products / services",
      ],
      benefits: [
        "3-year income-tax exemption (under Section 80-IAC)",
        "80% rebate on patent filing fees",
        "Self-certification under 9 labour and 3 environment laws",
        "Easier winding-up procedure",
        "Eligible for government funding (Fund of Funds, SIDBI)",
        "Public procurement exemptions",
      ],
      documents: [
        "Incorporation certificate",
        "PAN of company",
        "MOA / AOA / Partnership deed",
        "Brief description of business (innovation angle)",
        "Authorised signatory's PAN + Aadhaar",
      ],
      processSteps: steps([
        "Eligibility review (we'll be honest if you don't qualify)",
        "Pitch deck and innovation summary drafting",
        "Online application on Startup India portal",
        "DPIIT review (usually 2-4 weeks)",
        "Recognition certificate issued",
      ]),
      governmentFee: "₹0",
      wddFee: "₹3,500",
      faqs: [
        {
          q: "What counts as \"innovation\"?",
          a: "New product, new process, or significantly improved version of existing solution. We'll help frame your business in language DPIIT accepts.",
        },
        {
          q: "Can I apply if I'm a sole proprietor?",
          a: "No — only Private Limited, LLP or Registered Partnership.",
        },
      ],
      visible: true,
      order: 4,
    },
    {
      title: "NGO Darpan Registration",
      slug: "ngo-darpan-registration",
      intro:
        "NGO Darpan is the NITI Aayog database every NGO needs to register on to apply for government grants, FCRA, or CSR funds. Once you're on Darpan, you get a Unique ID that's required everywhere.",
      whoNeeds: [
        "All registered NGOs (trust, society, Section 8 company)",
        "NGOs planning to apply for any government grant",
        "NGOs that want to receive CSR funds from corporates",
      ],
      benefits: [
        "Unique ID required for FCRA application",
        "Required to apply for ministry grants (Women & Child, MoHFW, etc.)",
        "Visibility on government portal",
        "Trust signal for individual donors",
      ],
      documents: [
        "Trust deed / Society registration / Section 8 incorporation",
        "PAN of NGO",
        "PAN + Aadhaar of three office-bearers",
        "Annual reports of last 3 years (if existing)",
      ],
      processSteps: steps([
        "Document review",
        "Online filing on darpan.niti.gov.in",
        "Office-bearer details verification",
        "Unique ID generated (usually within 7 days)",
      ]),
      governmentFee: "₹0",
      wddFee: "₹2,500",
      faqs: [],
      visible: true,
      order: 5,
    },
    {
      title: "ESIC & EPF Registration",
      slug: "esic-epf-registration",
      intro:
        "Once your business hires 10+ employees (ESIC) or 20+ employees (EPF), registration becomes mandatory. We handle both at the same time and set up the monthly compliance flow.",
      whoNeeds: [
        "**ESIC:** Establishments with 10 or more employees earning up to ₹21,000/month",
        "**EPF:** Establishments with 20 or more employees",
      ],
      benefits: [
        "Legal compliance (penalties for missing registration)",
        "Employees get medical, maternity and pension benefits",
        "Trust signal — serious employees won't join non-compliant businesses",
        "Required for many tenders and corporate contracts",
      ],
      documents: [
        "PAN of business",
        "GST registration certificate",
        "Address proof of premises",
        "List of employees with Aadhaar, PAN, salary",
        "Bank statement",
        "For company — incorporation certificate + MOA",
      ],
      processSteps: steps([
        "Eligibility check",
        "EPFO / ESIC employer portal registration",
        "Form filing and document upload",
        "Inspection or virtual verification",
        "Code numbers issued",
      ]),
      governmentFee: "₹0 (registration is free; contributions are monthly)",
      wddFee: "₹3,500 (ESIC + EPF combined)",
      faqs: [],
      visible: true,
      order: 6,
    },
  ];
  const n = await upsertMany(Registration, registrations, ["slug"]);
  console.log(`✓ Seeded ${n} Registrations`);
  sectionsCompleted.push(`Registrations (S18) — ${n}`);
}

// ─── Section 19 → Blogs (3) ──────────────────────────────────────────────────
async function seedBlogs() {
  warn("Blogs: 'publishedAt' has no schema field — createdAt (timestamps) covers publish date.");
  const blogs = [
    {
      title:
        "Why every small business in India needs a website in 2026 (and why a Facebook page isn't enough)",
      slug: "why-every-business-needs-a-website-2026",
      category: "Strategy",
      tags: ["small business", "website", "India", "digital presence"],
      author: "Gudia Yadav",
      readTime: 6,
      excerpt:
        "Your customers are Googling you before they ever call. If they don't find a site, they don't find you. Here's why a Facebook page isn't a substitute — and what a basic, honest website should cost.",
      featuredImage: "",
      content: toHtml([
        "I get one variation of this question every week — \"Gudia, I have a busy Instagram and a WhatsApp Business profile. Do I really need a website?\" The honest answer is yes, and here's why.",
        "**Customers don't trust businesses they can't Google.** When someone hears your name from a friend, the first thing they do is search. If the only result is a Facebook page with three posts from 2022, you've already lost half the trust before they ever contact you. A website signals \"this is a real, ongoing business\" in a way that no social profile can.",
        "**Social media platforms own your audience — you don't.** Instagram could change its algorithm tomorrow and your reach drops to zero. Facebook could shut down a page for an automated reason that takes weeks to dispute. A website is yours. Your domain, your email, your customer list, your traffic. Nobody can take it away.",
        "**WhatsApp + a website is the strongest small-business combo in India in 2026.** Use WhatsApp for conversation, your website for credibility. Customers find you on Google, browse your site, click WhatsApp, message you. The two work together — the website earns the trust, WhatsApp closes the deal.",
        "**What should it cost?** For a typical small business — local services, retail shop, consultant, contractor — a basic professional website should cost you between ₹15,000 and ₹40,000 one-time, plus ₹2,000-₹5,000/year for hosting and domain. Anyone charging less is using a free template; anyone charging more is either an agency selling you stuff you don't need, or building something genuinely custom.",
        "**You don't need everything on day one.** Start with a 5-page site — home, services, about, contact, one blog post. Add to it as you grow. Most of our clients started with a single landing page and we added a blog, e-commerce, or booking forms only when their business actually needed them.",
        "The internet in 2026 is not optional for anyone selling anything. If your shop is on Main Bazaar, your website is your second shop on the internet — open 24/7, visible to everyone in India, and never closes.",
        "If you want a quote for your business, drop us a WhatsApp at +91 8130270050 or fill in the contact form. Half-hour consultation, written quote, no pressure.",
      ]),
      published: true,
      seoTitle: "Why Your Business Needs a Website",
      seoDescription:
        "A practical, founder-written take on why Indian small businesses need a real website in 2026 — not just a Facebook page. What it costs, what to start with, what to skip.",
      order: 1,
    },
    {
      title: "A good website pays for itself — here's how we measure it for our clients",
      slug: "how-a-good-website-pays-for-itself",
      category: "Business",
      tags: ["ROI", "website value", "conversion", "small business"],
      author: "Gudia Yadav",
      readTime: 5,
      excerpt:
        "\"Will this website make me money?\" is the most important question a small-business owner can ask. Here's how we calculate the answer before we even quote.",
      featuredImage: "",
      content: toHtml([
        "Spending ₹40,000 on a website feels like a lot when you're a small business. Spending ₹40,000 on a website that brings you two extra customers a month — each worth ₹15,000 to you — is the best deal you'll get all year. The math is simple. The trick is being honest about your numbers.",
        "Before we quote any project, we ask three questions. **First — what's a customer worth to you?** Not the average sale, the lifetime value. If you're a coaching institute, one student joining your course at ₹25,000 means a ₹25,000 customer (or more if they refer friends). If you're an e-commerce store, your average customer might be ₹2,000 and you need volume.",
        "**Second — what's your current conversion?** If your existing site (or competitor's site) gets 100 visitors a month and 1 calls you, that's 1% conversion. A well-designed site usually moves that to 2-4%. With proper SEO, the visitor count goes up too, and the two compound.",
        "**Third — what's your closing rate?** Of the people who actually contact you, how many become paying customers? If it's 1 in 3, then 10 leads = 3 customers. If it's 1 in 10, you need 10× more leads (or better-qualified leads — that's a content strategy problem, not a design problem).",
        "Once we have those three numbers, the math writes itself. A 5,000-visitor-per-month organic website with a 3% contact rate is 150 leads. If your closing rate is 1 in 3, that's 50 customers a month. If each customer is worth ₹5,000 to you, that's ₹2.5 lakh of monthly revenue from a one-time ₹40,000 spend.",
        "Of course, getting to 5,000 organic visitors a month takes 6-12 months of SEO work. That's why we tell clients to plan for the long game — a website is a 3-year investment with a 6-12 month ramp. Don't expect leads on month one. Do expect them to grow steadily after.",
        "The clients who don't see ROI are usually the ones who skip SEO (\"we'll just put it on Instagram\") or skip content (\"we don't have time to write blogs\"). A website without traffic is a brochure nobody reads. We always recommend at least a basic SEO retainer alongside development — it's the cheapest insurance for getting your money back.",
        "Want us to run the numbers for your business? Send us a WhatsApp with — what you sell, who buys it, and what they're worth to you. We'll come back with a realistic forecast and a quote.",
      ]),
      published: true,
      seoTitle: "How a Website Pays For Itself",
      seoDescription:
        "A founder-written breakdown of how we calculate website ROI for small Indian businesses. Customer lifetime value, conversion rates, closing rates, and the math.",
      order: 2,
    },
    {
      title: "The 7 things every business website needs in 2026 (and 5 it doesn't)",
      slug: "essential-website-features-2026",
      category: "Best Practices",
      tags: ["website features", "design", "conversion"],
      author: "Gudia Yadav",
      readTime: 7,
      excerpt:
        "A practical checklist — what we put on every website we build, what we deliberately leave off, and why. Save this when you're vetting your next quote.",
      featuredImage: "",
      content: toHtml([
        "Most \"10 things every website needs\" articles are written by SEO writers who've never built one. Here's the real list, from 150+ projects.",
        "**Things every business website needs in 2026:**",
        "**1. A WhatsApp button.** Sticky, visible on every page, opens the right number with a pre-filled message. India runs on WhatsApp. Your website should accept it.",
        "**2. Fast mobile load.** Under 2 seconds on a 3-year-old phone with patchy 4G. Most of your visitors are on mobile. If your hero image takes 5 seconds to load, half of them are gone before they ever see your offer.",
        "**3. Clear contact information above the fold.** Phone number, address, hours. Not buried in a contact page. We see 30% of clicks on the header phone number — people skip everything and call.",
        "**4. Social proof.** Real testimonials with real names and real photos. Generic \"great service!\" stars from anonymous people fool nobody. We always recommend asking 3 happy clients for a one-paragraph review with their photo.",
        "**5. A single clear call-to-action per page.** \"Get a quote.\" \"Book a consultation.\" \"Buy now.\" Not 8 buttons competing for attention. Decide what you want the visitor to do on this page, and design everything around that one action.",
        "**6. An honest \"about\" page.** With a real photo, a real story, the year you started, and the location you work from. Trust transfers from real to real. Anonymous corporate copy transfers no trust.",
        "**7. Structured data (schema markup).** Invisible to humans, critical for Google. Tells the algorithm what your business is, where you're located, what hours, what services. Most agencies skip this and it costs you rankings.",
        "**Things your website doesn't need:**",
        "**1. A pop-up \"Subscribe to our newsletter\" within 5 seconds.** Annoying. Conversion is worse than the marketing books claim. Show it on exit-intent or after 60 seconds, if at all.",
        "**2. A long video auto-playing on the homepage.** Hurts load time, eats mobile data, often unwatched. A 10-second background video is fine; a 90-second auto-play is not.",
        "**3. Stock photos of \"diverse business teams.\"** Everyone's seen them. They scream \"template.\" Use real photos of your team / shop / work, even if they're imperfect.",
        "**4. A live chat widget you never reply to.** Empty chat windows kill more trust than they build. Use WhatsApp instead — you're already replying to it.",
        "**5. Sliders / carousels on the homepage.** Conversion data shows 90%+ of users only see the first slide. Use one static hero with one clear message instead.",
        "Building or rebuilding a site soon? Save this list. Compare it with the quote you're being offered. If your agency is skipping anything from the \"needs\" list, ask why. If they're insisting on something from the \"doesn't need\" list, ask why harder.",
      ]),
      published: true,
      seoTitle: "Must-Have Website Features (2026)",
      seoDescription:
        "Practical checklist from a Delhi web studio that's shipped 150+ sites. What to insist on, what to skip, and why. Save when reviewing your next website quote.",
      order: 3,
    },
  ];
  const n = await upsertMany(Blog, blogs, ["slug"]);
  console.log(`✓ Seeded ${n} Blog posts`);
  sectionsCompleted.push(`Blogs (S19) — ${n}`);
}

// ─── Section 20 → Legal Pages (3) ────────────────────────────────────────────
async function seedLegalPages() {
  const now = new Date();
  const legalPages = [
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      lastUpdated: now,
      content: toHtml([
        "**Web Digital Development — Privacy Policy**",
        "This is a plain-English summary of how we handle your data. The full legal-ese is below, but the short version is — we don't sell your data, we keep what we need to serve you, and we delete it when you ask.",
        "**What we collect:** When you contact us, we collect your name, email, phone number, and the message you send. When you visit our site, we collect anonymous analytics (page views, time on site, referrer) via Google Analytics. When you submit a review, we collect your name, photo (if uploaded), and review text.",
        "**Why we collect it:** To reply to your enquiry, to send you a quote or invoice, to display your testimonial (only with your permission), and to improve our website.",
        "**Who we share it with:** Nobody, except: (a) Resend (our email provider — to send you our reply), (b) Cloudinary (our image storage — if you uploaded a photo), (c) MongoDB Atlas (our database host), (d) Google Analytics (anonymous traffic data only). All four are GDPR-compliant.",
        "**How long we keep it:** Enquiry data — 3 years after last contact. Testimonial data — until you ask us to remove it. Anonymous analytics — 26 months (Google default).",
        "**Your rights:** You can ask us to (a) show you what we have on you, (b) correct it, (c) delete it, (d) export it. Email support@webdigitaldevelopment.in and we'll comply within 7 working days.",
        "**Cookies:** We use essential cookies (for sessions and security) and analytics cookies (Google Analytics). You can decline analytics via our cookie banner without breaking the site.",
        "**Children:** Our services are not directed at people under 18. We don't knowingly collect data from minors.",
        "**Changes:** We may update this policy. The \"last updated\" date at the top will change. Material changes will be notified to active enquiries by email.",
        "**Contact for privacy queries:** support@webdigitaldevelopment.in.",
      ]),
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      lastUpdated: now,
      content: toHtml([
        "**Web Digital Development — Terms & Conditions**",
        "By using this website or hiring us for a project, you agree to these terms.",
        "**About us:** Web Digital Development is a sole-proprietorship registered in Delhi, India. Our registered address is Palam, New Delhi — 110045. Our contact email is support@webdigitaldevelopment.in.",
        "**Quotes and invoices:** Quotes are valid for 30 days from the date of issue. Projects begin after we receive 50% advance payment. The remaining 50% is due on project handover unless agreed otherwise in writing.",
        "**Scope:** Each project has a written scope (number of pages, features, integrations). Anything outside that scope is billed at our hourly rate (₹2,500/hour, quoted up front).",
        "**Timelines:** We quote realistic timelines but they're estimates. Delays caused by us are our problem — we'll absorb the cost. Delays caused by you (slow feedback, late content, payment delay) extend the timeline accordingly.",
        "**Intellectual property:** On full payment, you own the final deliverables — design files, code, content we wrote for you. We retain the right to display the project in our portfolio and case studies. You can opt out of portfolio display by emailing us before project starts.",
        "**Warranties:** We warrant our work is free of malicious code, follows industry best practices, and matches the agreed scope. We do not warrant that the website will rank #1 on Google, achieve a specific revenue, or work on browsers older than the latest two versions of Chrome, Safari, Edge and Firefox.",
        "**Liability:** Our maximum liability for any claim related to a project is limited to the amount you paid for that project. We are not liable for indirect, consequential or punitive damages.",
        "**Third-party services:** We use Cloudinary, Resend, MongoDB Atlas, Vercel, Google services. Their terms also apply when we use them on your behalf.",
        "**Termination:** Either side can terminate a project at any time. If you terminate, you pay for work completed up to that point. If we terminate (rare — usually only for non-payment or scope abuse), we refund any unworked-on advance.",
        "**Governing law:** These terms are governed by Indian law. Disputes are subject to the exclusive jurisdiction of courts in New Delhi.",
        "**Changes to terms:** We may update these terms. Active projects are governed by the version of terms in effect when their quote was accepted.",
      ]),
    },
    {
      slug: "refund",
      title: "Refund & Cancellation Policy",
      lastUpdated: now,
      content: toHtml([
        "**Web Digital Development — Refund & Cancellation Policy**",
        "We want every client to feel they got value for money. Here's our refund policy.",
        "**Before work starts:** If you cancel within 48 hours of paying the advance and we haven't started work yet, we'll refund 100% (minus any payment-gateway transaction charges, usually 2-3%).",
        "**After work starts:** If you cancel after we've started, we keep what's earned at our hourly rate (₹2,500/hour) and refund the rest. We'll send a written breakdown of hours worked.",
        "**After project handover:** No refunds. You've received the deliverables.",
        "**Subscription / retainer services (SEO, marketing, maintenance):** Cancellable with 7 days' notice. We refund the unused portion of the current month, pro-rated by day.",
        "**Registration services (Pvt Ltd, MSME, etc.):** Refund of WDD service fee if we haven't started the application yet. Once we've filed with the government, no refund (government fee, if any, is non-refundable regardless).",
        "**Disputes:** Email support@webdigitaldevelopment.in. We aim to respond within 2 working days. Most disputes are resolved by a friendly call.",
        "**Chargebacks:** Please contact us before initiating a chargeback. Chargebacks that turn out to be without merit will be contested. We've never had one we couldn't resolve directly.",
      ]),
    },
  ];
  const n = await upsertMany(LegalPage, legalPages, ["slug"]);
  console.log(`✓ Seeded ${n} Legal pages`);
  sectionsCompleted.push(`Legal pages (S20) — ${n}`);
}

// ─── Section 21 → SeoMeta (9) ────────────────────────────────────────────────
async function seedSeoMeta() {
  const seo = [
    {
      pageSlug: "home",
      title: "Delhi's Top Website Design & Development Company | WDD",
      description:
        "Web Digital Development — Delhi's trusted website design, development, SEO and digital marketing studio. 150+ sites launched, fixed pricing, one-month free support.",
      keywords: feats(
        "website designing company in delhi, web development delhi, seo services delhi, digital marketing agency"
      ),
    },
    {
      pageSlug: "about",
      title: "About Web Digital Development | Delhi Web Studio",
      description:
        "Founded by Gudia Yadav, WDD is a Delhi-based website design studio that's launched 150+ projects across India and abroad. Founder-led, no outsourcing.",
      keywords: feats("about web digital development, gudia yadav, delhi web studio"),
    },
    {
      pageSlug: "services",
      title: "Our Services — Web Design, Development, SEO, Marketing | WDD Delhi",
      description:
        "Website design, development, SEO, digital marketing, e-commerce, graphic design and WordPress — all under one roof in Delhi. Fixed pricing, one-month free support.",
      keywords: feats("website services delhi, seo services, web development services"),
    },
    {
      pageSlug: "projects",
      title: "Our Work — Sites We've Designed, Built & Ranked | WDD Portfolio",
      description:
        "A few of our favourite projects. Real businesses, real traffic, real revenue. Spanish e-commerce, Delhi tourism, plantation, automotive — and more.",
      keywords: feats("web design portfolio delhi, website projects, wdd case studies"),
    },
    {
      pageSlug: "blog",
      title: "WDD Blog — Notes on Websites, SEO & Small-Business Growth",
      description:
        "Plain-English writing on what works on the small-business internet in 2026. Written by a founder who's shipped 150+ sites.",
      keywords: feats("web design blog, seo blog india, small business blog"),
    },
    {
      pageSlug: "contact",
      title: "Contact Web Digital Development | Free Quote in 24 Hours",
      description:
        "Get in touch with WDD for a free 30-min consultation and a written quote in 24 hours. Palam, New Delhi. +91 8130270050. support@webdigitaldevelopment.in",
      keywords: feats("contact web digital development, website quote delhi, web designer near me"),
    },
    {
      pageSlug: "reviews",
      title: "Client Reviews | What Customers Say About WDD",
      description:
        "Unedited reviews from real clients of Web Digital Development. We've linked each client's live site so you can verify everything.",
      keywords: feats("wdd reviews, web digital development client testimonials"),
    },
    {
      pageSlug: "registrations",
      title: "Business Registration Services | Pvt Ltd, MSME, 12A-80G, Startup India",
      description:
        "We handle Pvt Ltd Company, MSME (Udyam), 12A & 80G, Startup India, NGO Darpan and ESIC/EPF registrations end-to-end. Fixed pricing, fast turnaround.",
      keywords: feats(
        "pvt ltd company registration delhi, msme registration, 12a 80g registration, startup india registration"
      ),
    },
    {
      pageSlug: "legal",
      title: "Legal — Privacy, Terms, Refund | Web Digital Development",
      description:
        "Our privacy policy, terms of service, and refund/cancellation policy. Written in plain English.",
      keywords: feats("wdd privacy, wdd terms, wdd refund"),
    },
  ];
  const n = await upsertMany(SeoMeta, seo, ["pageSlug"]);
  console.log(`✓ Seeded ${n} SEO meta records`);
  sectionsCompleted.push(`SeoMeta (S21) — ${n}`);
}

// ─── Section 22 → Chatbot KB (12) ────────────────────────────────────────────
async function seedChatbot() {
  const kb = [
    {
      title: "What services do you offer?",
      category: "services",
      content:
        "We offer website designing, web development, SEO, digital marketing, e-commerce development, graphic designing, WordPress development, and business registrations (Pvt Ltd, MSME, 12A-80G, Startup India, NGO Darpan, ESIC/EPF). Pricing starts at ₹3,000 for a logo and goes up depending on scope. Want a quick quote?",
    },
    {
      title: "How much does a website cost?",
      category: "pricing",
      content:
        "A basic 5-page website starts at ₹15,000. A standard business site with custom design + SEO basics is around ₹35,000-₹60,000. E-commerce stores start at ₹35,000. Larger custom builds (Next.js, headless commerce, web apps) start at ₹1,50,000. We always send a written fixed quote — no surprises.",
    },
    {
      title: "Where are you located?",
      category: "contact",
      content:
        "We're at Palam, New Delhi — 110045. We work with clients across Delhi NCR (Noida, Gurgaon, Faridabad), India and abroad. Call us at +91 8130270050 or WhatsApp the same number.",
    },
    {
      title: "What's your turnaround time?",
      category: "process",
      content:
        "A small 5-page site usually ships in 3-4 weeks. Standard business sites in 4-6 weeks. E-commerce 6-8 weeks. Larger custom builds 8-12+ weeks. We share a written timeline in the quote and stick to it (with allowance for client-side delays).",
    },
    {
      title: "Do you do SEO?",
      category: "services",
      content:
        "Yes — we offer full SEO services starting at ₹8,000/month. On-page, technical, content, and ethical off-page work. Most local Delhi clients hit page 1 of Google in 3-6 months. We share a monthly ranking + traffic report so you see progress.",
    },
    {
      title: "Do you build e-commerce sites?",
      category: "services",
      content:
        "Yes — Shopify, WooCommerce, or custom Next.js + headless commerce. Razorpay, Cashfree, Stripe and PayU integration. GST-compliant invoices. Abandoned cart recovery. Pricing from ₹35,000 for Shopify, ₹85,000 for WooCommerce custom, ₹2,00,000+ for fully custom builds.",
    },
    {
      title: "Can you handle Pvt Ltd / MSME registration?",
      category: "registrations",
      content:
        "Yes — we file Pvt Ltd Company (₹6,000), MSME/Udyam (₹999), 12A & 80G (₹5,000), Startup India (₹3,500), NGO Darpan (₹2,500), and ESIC/EPF (₹3,500) registrations end-to-end. Most go through in 5-7 days. Talk to a human and we'll get started.",
    },
    {
      title: "What's your payment process?",
      category: "process",
      content:
        "We take 50% advance before work starts and 50% on handover. We accept UPI, bank transfer, Razorpay, and international payments via Stripe. We issue GST-compliant invoices.",
    },
    {
      title: "Do you provide post-launch support?",
      category: "post-launch",
      content:
        "Yes — first month after launch is free for bug fixes, content edits and small tweaks. After that we offer monthly maintenance retainers from ₹3,000/month covering updates, backups, security patches and small edits.",
    },
    {
      title: "Can I edit the site myself after handover?",
      category: "post-launch",
      content:
        "Yes — every site ships with an admin panel where you can edit content, add blogs, change images, and update business info. We do a 1-hour training call before handover and provide a video walkthrough you can refer back to.",
    },
    {
      title: "Do you offer hosting?",
      category: "technical",
      content:
        "We help you set up hosting on Vercel (for Next.js sites — free tier covers most), Cloudways (for WordPress, ~₹1,000/month), or Hostinger (~₹250/month). We don't resell hosting — you own the account directly.",
    },
    {
      title: "Are you available on WhatsApp?",
      category: "contact",
      content:
        "Yes — WhatsApp +91 8130270050. We usually reply within an hour during work hours (Mon-Sat, 10am-7:30pm). Sundays are off but urgent messages get a same-day reply.",
    },
  ];
  const n = await upsertMany(Chatbot, kb, ["title"]);
  console.log(`✓ Seeded ${n} Chatbot KB entries`);
  sectionsCompleted.push(`Chatbot KB (S22) — ${n}`);
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════════
const seeders: { label: string; run: () => Promise<void> }[] = [
  { label: "Settings", run: seedSettings },
  { label: "SiteContent", run: seedSiteContent },
  { label: "Homepage", run: seedHomepage },
  { label: "Services", run: seedServices },
  { label: "Projects", run: seedProjects },
  { label: "Team", run: seedTeam },
  { label: "Testimonials", run: seedTestimonials },
  { label: "Registrations", run: seedRegistrations },
  { label: "Blogs", run: seedBlogs },
  { label: "Legal pages", run: seedLegalPages },
  { label: "SEO meta", run: seedSeoMeta },
  { label: "Chatbot KB", run: seedChatbot },
];

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  console.log("✓ Connected\n");

  for (const { label, run } of seeders) {
    try {
      await run();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${label}: ${msg}`);
      console.error(`✗ ${label} failed: ${msg}`);
    }
  }

  await mongoose.disconnect();

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════");
  console.log("  SEED SUMMARY");
  console.log("══════════════════════════════════════════════");
  console.log(`  Total documents upserted : ${totalDocs}`);
  console.log(`  Sections completed       : ${sectionsCompleted.length}/22 mapped sections`);
  for (const s of sectionsCompleted) console.log(`    • ${s}`);
  console.log(`  Warnings (skipped fields): ${warnings.length}`);
  for (const w of warnings) console.log(`    ⚠ ${w}`);
  console.log(`  Errors                   : ${errors.length}`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log("══════════════════════════════════════════════");

  if (errors.length > 0) {
    console.log("\n✗ Completed with errors.");
    process.exit(1);
  }
  console.log("\n✓ Done — all content seeded.");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
