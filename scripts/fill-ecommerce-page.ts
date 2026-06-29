/* eslint-disable no-console */
/**
 * §ECOMMERCE-PAGE — one-off, idempotent content push for the single
 * `/services/ecommerce-development` service page (client brief: ECOMMERCE-PAGE.md).
 *
 * It updates ONLY the e-commerce service document and its SeoMeta row:
 *   - title / shortDescription / content (intro + why + solutions)
 *   - contentSecondary ("Why choose us")
 *   - features (17 icon-card features), industries (13), processSteps (8)
 *   - faqs (~15, which feed the visible FAQ list + FAQPage schema)
 *   - seoTitle / seoDescription + SeoMeta(title/description/keywords)
 *
 * The new copy never claims "we are the best" — it uses the client's stronger
 * positioning line. Re-running simply rewrites the same fields (idempotent).
 *
 * Run:  npx tsx scripts/fill-ecommerce-page.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// ─── Env loading (mirrors scripts/fill-internal-links.ts / apply-seo-meta.ts) ─
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

// ─── Loose, strict:false models (we set fields the base schema may not list) ──
const Service =
  mongoose.models.Service || mongoose.model("Service", new Schema({}, { strict: false, collection: "services" }));
const SeoMeta =
  mongoose.models.SeoMeta || mongoose.model("SeoMeta", new Schema({}, { strict: false, collection: "seometas" }));

const SLUG = "ecommerce-development";
const SEO_PAGE_SLUG = "services/ecommerce-development";

// ─── Content (authored per the client brief; primary kw: "Ecommerce Website
//     Development", secondaries woven naturally — no stuffing) ────────────────
const TITLE = "Ecommerce Website Development Services";

const SHORT_DESCRIPTION =
  "Custom ecommerce website development built around your business goals — secure payments, mobile-first design and SEO-ready online stores that grow with you.";

const CONTENT = `
<p class="lead">Build an online store that grows your business&mdash;not just your online presence.</p>
<p>Your customers no longer shop the way they used to. They compare options, read reviews, check delivery times and expect to pay in a few taps&mdash;often on a phone, late at night, from a city you have never shipped to before. Done well, <strong>Ecommerce Website Development</strong> meets those expectations and turns casual visitors into repeat buyers.</p>
<p>We build e-commerce websites designed around your business goals&mdash;not generic templates. Every project starts with understanding how your customers buy, what your products need, and how your online store can grow over time. Whether you are a manufacturer opening a B2B channel, an exporter reaching overseas buyers, a retailer moving online, or a startup launching your first product, we recommend the right platform for your stage&mdash;then build it to be scalable, secure and SEO-ready.</p>
<p>We build both B2C stores for everyday shoppers and B2B platforms for wholesale and trade buyers, with the catalogue, pricing and checkout each audience expects. From a first-time founder in a small town to an established brand selling across India and abroad, we shape the store around your customers rather than forcing your business to fit a fixed template.</p>
<p>An online store rarely works in isolation; it sits alongside your brand, your content and your ads. If you are still planning your wider presence, our <a href="/services/website-development">Website Development services</a> cover everything from corporate sites to web apps, so your store and your main website stay consistent.</p>

<h2>Why Every Business Needs an Ecommerce Website</h2>
<p>An e-commerce website works while you sleep. It removes the limits of a single shop counter and gives every customer the same smooth experience, whether they are nearby or on the other side of the world.</p>
<ul>
<li><strong>Sell 24/7</strong> &mdash; your store takes orders at midnight, on weekends and on holidays, with no extra staff.</li>
<li><strong>Reach customers across India and globally</strong> &mdash; go far beyond your local area to buyers anywhere.</li>
<li><strong>Build trust</strong> &mdash; a professional, secure store reassures first-time buyers and strengthens your brand.</li>
<li><strong>Accept secure payments</strong> &mdash; UPI, cards, net banking and wallets through trusted Indian gateways.</li>
<li><strong>Manage inventory with ease</strong> &mdash; track stock, variants and orders from one simple dashboard.</li>
<li><strong>Earn organic SEO traffic</strong> &mdash; a well-built store ranks on Google and brings buyers without paid ads.</li>
<li><strong>Scale without limits</strong> &mdash; add products, categories and features as your business grows.</li>
</ul>
<p>An ecommerce website is no longer just an online store&mdash;it becomes one of your strongest business assets.</p>

<h2>Ecommerce Solutions Designed Around Your Business</h2>
<p>We choose technology based on your business goals, not developer preference. After a short consultation we recommend the platform that fits your catalogue size, expected traffic, budget and the way your team works day to day.</p>
<h3>Laravel ecommerce development</h3>
<p>A robust PHP framework for feature-rich stores that need custom workflows, role-based access and tight control over business logic&mdash;well suited to B2B portals and manufacturer storefronts.</p>
<h3>Next.js ecommerce development</h3>
<p>A modern React framework for fast, SEO-friendly storefronts with app-like speed&mdash;ideal for D2C brands and stores where performance and search visibility matter most.</p>
<h3>Custom PHP development</h3>
<p>When an off-the-shelf approach will not fit, we build custom PHP solutions around your exact processes, integrations and reporting needs&mdash;connecting to your ERP, accounting tools or logistics partners where required.</p>
<h3>Scalable, secure and SEO-ready by default</h3>
<p>Whatever the platform, every store is built on a future-ready architecture that handles more products, traffic and orders as you grow&mdash;so adding payment methods or new markets later never means rebuilding from scratch. Security is built in with SSL and trusted payment gateways, and clean, fast code keeps your store search-friendly. If visibility is a priority, we pair the build with our <a href="/services/seo-services">SEO services</a> from day one so your products start earning organic traffic.</p>
`.trim();

const CONTENT_SECONDARY = `
<h2>Why Choose Web Digital Development?</h2>
<p>We have delivered 200+ websites for businesses across India, and we treat every e-commerce project as a long-term partnership rather than a one-off build.</p>
<ul>
<li><strong>Business-first consultation</strong> &mdash; we start with your goals, customers and products before writing a line of code.</li>
<li><strong>Honest technology recommendation</strong> &mdash; we suggest the platform that suits you, not the one that is easiest for us.</li>
<li><strong>SEO-ready, mobile-first builds</strong> &mdash; fast, search-friendly stores that look right on every screen.</li>
<li><strong>One year of free maintenance</strong> &mdash; updates, fixes and small changes covered after launch.</li>
<li><strong>Free technical guidance and basic SEO included</strong> &mdash; so you are never left guessing.</li>
<li><strong>Long-term support and growth</strong> &mdash; including Google and Meta Ads support and social growth guidance.</li>
</ul>
<p>Just as importantly, we explain things in plain language. You will always understand what we are building, why we recommend it and how it helps you sell&mdash;no jargon, no pressure and no surprises on the invoice. Our goal is a store you feel confident running and proud to share with your customers.</p>
<p>Many clients begin with one project and grow into others. You can see examples of our work in our <a href="/projects">portfolio</a>, learn more <a href="/about">about our team</a>, or read practical guides on our <a href="/blog">blog</a>. When you are ready to grow traffic and sales further, our <a href="/services/digital-marketing">digital marketing services</a> help you reach the right buyers. Have a question? <a href="/contact">Contact us</a> for a free, no-obligation chat.</p>
`.trim();

const FEATURES = [
  "Mobile Responsive Design",
  "Product Catalogue",
  "Secure Payment Gateway",
  "Razorpay Integration",
  "PhonePe Integration",
  "Cash on Delivery",
  "Shipping Integration",
  "Inventory Management",
  "Product Search",
  "Wishlist",
  "Customer Accounts",
  "Order Tracking",
  "Discount Coupons",
  "WhatsApp Integration",
  "Google Analytics",
  "Technical SEO Ready",
  "SSL Security",
];

const INDUSTRIES = [
  "Manufacturers",
  "Exporters",
  "Retail Businesses",
  "Interior Designers",
  "Furniture Businesses",
  "Agro Businesses",
  "Fashion Brands",
  "Healthcare Products",
  "Beauty Products",
  "Electronics",
  "Home Decor",
  "Local Businesses",
  "Small & Medium Enterprises",
];

const PROCESS_STEPS = [
  { title: "Business Consultation", description: "We learn how you sell, who buys from you and what success looks like before we recommend anything." },
  { title: "Requirement Analysis", description: "We map your products, categories, payment and shipping needs into a clear, written scope." },
  { title: "Technology Selection", description: "We recommend the right platform — Laravel, Next.js or custom PHP — for your stage and budget." },
  { title: "UI/UX Design", description: "We design a clean, mobile-first store that makes browsing and checkout effortless." },
  { title: "Development", description: "We build your store with secure payments, inventory and the features your business needs." },
  { title: "Testing & QA", description: "We test on real devices — checkout, payments, speed and security — before anything goes live." },
  { title: "Website Launch", description: "We deploy your store, connect your domain and analytics, and make sure everything works." },
  { title: "Maintenance & Growth Support", description: "We stay on with one year of free maintenance, SEO guidance and ongoing growth support." },
];

const FAQS = [
  {
    q: "Which ecommerce platform is right for my business?",
    a: "It depends on your catalogue size, expected traffic, budget and how your team works. After a short consultation we recommend the best fit — Laravel for complex B2B workflows, Next.js for fast SEO-friendly storefronts, or custom PHP for unique requirements — and explain the reasons in writing.",
  },
  {
    q: "How much does ecommerce website development cost?",
    a: "Cost depends on your features, number of products and integrations, so we give a fixed written quote after a free discovery call — with no hidden charges. Most small and medium stores are surprisingly affordable, and you will know the exact figure before any work begins.",
  },
  {
    q: "Can I manage products and orders myself after launch?",
    a: "Yes. Every store ships with a simple admin dashboard where you can add products, update prices, manage stock and view orders without any coding. We also give you a short walkthrough at handover, so your team is confident managing day-to-day tasks from day one.",
  },
  {
    q: "Can you migrate my existing online store?",
    a: "Yes. We regularly migrate stores from WordPress, Shopify, WooCommerce and custom platforms, moving your products, customers and orders carefully. We plan migrations to avoid downtime and preserve your SEO rankings, so your traffic and search visibility stay intact through the switch.",
  },
  {
    q: "Do you provide SEO for ecommerce websites?",
    a: "Every store we build is technically SEO-ready with clean code, fast loading, proper structure and basic on-page SEO included. For competitive niches we also offer dedicated SEO services to grow rankings and organic sales further, so you attract buyers without relying only on paid ads.",
  },
  {
    q: "Which payment gateways do you integrate?",
    a: "We integrate trusted Indian and international gateways including Razorpay, PhonePe, UPI, cards, net banking and wallets, plus Cash on Delivery where you need it. We recommend the right mix for your customers and ensure every transaction is processed securely.",
  },
  {
    q: "Do you set up shipping and courier integration?",
    a: "Yes. We connect your store to popular courier and shipping providers so orders, labels and tracking flow automatically. Customers can track their orders, and your team spends less time on manual logistics — keeping fulfilment smooth as your order volume grows.",
  },
  {
    q: "Will my online store be mobile-friendly?",
    a: "Absolutely. Most shoppers buy on their phones, so we build every store mobile-first. Your store will look sharp and load fast on phones, tablets and desktops, with a checkout that is quick and easy to complete on any screen size.",
  },
  {
    q: "How long does it take to build an ecommerce website?",
    a: "A standard store typically takes four to eight weeks, depending on the number of products, custom features and integrations. The biggest variable is how quickly content and feedback come from your side, so we keep things moving with clear milestones and regular updates.",
  },
  {
    q: "Can my store sell internationally?",
    a: "Yes. We build stores that support multiple currencies, international shipping and global payment methods, which is ideal for exporters and brands selling abroad. We will configure your store around the markets you want to reach so overseas buyers get a smooth experience.",
  },
  {
    q: "Do you build both B2B and B2C ecommerce websites?",
    a: "Yes. We build B2C stores for retail customers and B2B portals with features like bulk pricing, customer-specific catalogues, quote requests and account-based access. We tailor the workflow to how your buyers actually order, whether they are consumers or business clients.",
  },
  {
    q: "Is my customer and payment data secure?",
    a: "Security is built in. Every store includes SSL encryption, secure payment gateways that handle card data, and safe coding practices. We follow current best practices to protect customer and payment information, and we keep your store updated against common vulnerabilities.",
  },
  {
    q: "Can you build stores for manufacturers and exporters?",
    a: "Yes — this is a core strength of ours. We build ecommerce websites for manufacturers and exporters with product catalogues, enquiry and quote flows, bulk ordering and international payment and shipping support, so you can reach new buyers in India and overseas.",
  },
  {
    q: "What ongoing support do you provide after launch?",
    a: "Every project includes one year of free maintenance covering updates, fixes and small changes. After that, optional plans cover ongoing updates, security, backups and edits. You also get free technical guidance, so help is always close at hand as your store grows.",
  },
  {
    q: "Do you also handle digital marketing and ads?",
    a: "Yes. Beyond the build, we offer digital marketing, Google and Meta Ads support and social growth guidance to help you drive traffic and sales. Many clients start with their store and grow into marketing, keeping everything consistent under one accountable team.",
  },
];

// Stored WITHOUT the brand suffix — buildMetadata() appends " | Web Digital
// Development" at render time, so the keyword leads and the rendered title stays
// compact.
const SEO_TITLE = "Ecommerce Website Development";
const SEO_DESCRIPTION =
  "Custom ecommerce website development for manufacturers, exporters and retailers. Secure payments, mobile-first design and SEO-ready stores built to grow.";
const SEO_KEYWORDS = [
  "Ecommerce Website Development",
  "Ecommerce Website Development Company",
  "Custom Ecommerce Development",
  "Online Store Development",
  "Ecommerce Website Design",
  "B2B Ecommerce Development",
  "B2C Ecommerce Development",
  "Laravel Ecommerce Development",
  "Next.js Ecommerce Development",
  "Ecommerce Website for Manufacturers and Exporters",
];

function wordCount(...htmls: string[]): number {
  return htmls
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function main() {
  console.log(`→ DB target: ${maskDbTarget(MONGODB_URI!)}`);
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  const svc = await Service.findOne({ slug: SLUG });
  if (!svc) {
    console.error(`✗ Service with slug "${SLUG}" not found — aborting (no other docs touched).`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const words = wordCount(
    SHORT_DESCRIPTION,
    CONTENT,
    CONTENT_SECONDARY,
    FEATURES.join(" "),
    INDUSTRIES.join(" "),
    PROCESS_STEPS.map((s) => `${s.title} ${s.description}`).join(" "),
    FAQS.map((f) => `${f.q} ${f.a}`).join(" ")
  );
  console.log(`Title length (rendered): ${SEO_TITLE.length + " | Web Digital Development".length} chars`);
  console.log(`Meta description length: ${SEO_DESCRIPTION.length} chars`);
  console.log(`Approx. page word count: ${words} words\n`);

  await Service.updateOne(
    { _id: svc._id },
    {
      $set: {
        title: TITLE,
        shortDescription: SHORT_DESCRIPTION,
        content: CONTENT,
        contentSecondary: CONTENT_SECONDARY,
        features: FEATURES,
        industries: INDUSTRIES,
        processSteps: PROCESS_STEPS,
        faqs: FAQS,
        seoTitle: SEO_TITLE,
        seoDescription: SEO_DESCRIPTION,
      },
    }
  );
  console.log(`✓ Updated service "${SLUG}" (title, content, features, industries, process, ${FAQS.length} FAQs, SEO).`);

  await SeoMeta.updateOne(
    { pageSlug: SEO_PAGE_SLUG },
    {
      $set: {
        pageSlug: SEO_PAGE_SLUG,
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        keywords: SEO_KEYWORDS,
        noIndex: false,
      },
    },
    { upsert: true }
  );
  console.log(`✓ Upserted SeoMeta "${SEO_PAGE_SLUG}" (title, description, ${SEO_KEYWORDS.length} keywords).`);

  await mongoose.disconnect();
  console.log("\n✓ Done. Disconnected.");
}

main().catch(async (err) => {
  console.error("✗ Failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
