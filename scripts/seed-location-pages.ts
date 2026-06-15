/* eslint-disable no-console */
/** Seed 5 location pages (Delhi, Noida, Gurgaon, Faridabad, Ghaziabad).
 *  Run: npx tsx scripts/seed-location-pages.ts */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
for (const name of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) continue;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const locations: Record<
  string,
  { city: string; region: string; seoTitle: string; seoDescription: string; keywords: string[] }
> = {
  delhi: {
    city: "Delhi",
    region: "National Capital Territory",
    seoTitle: "Web Design Company in Delhi NCR",
    seoDescription:
      "Professional website design, SEO and development services in Delhi. Serving businesses across NCR with 400+ launches since 2019. Talk to our Delhi team today.",
    keywords: [
      "website design company in Delhi",
      "web development Delhi",
      "SEO services Delhi",
      "website designing in Delhi",
    ],
  },
  noida: {
    city: "Noida",
    region: "Uttar Pradesh",
    seoTitle: "Website Design Services in Noida",
    seoDescription:
      "Custom website design and SEO services for Noida businesses. We serve Noida, Greater Noida and nearby areas with 400+ successful projects.",
    keywords: ["website design in Noida", "web development Noida", "Noida SEO services", "website company Noida"],
  },
  gurgaon: {
    city: "Gurgaon",
    region: "Haryana",
    seoTitle: "Website Design Services in Gurgaon",
    seoDescription:
      "Professional website design and digital services for Gurgaon startups and businesses. Custom-coded, SEO-ready websites built by our Gurgaon-based team.",
    keywords: ["website design Gurgaon", "web development Gurgaon", "Gurgaon website company", "SEO Gurgaon"],
  },
  faridabad: {
    city: "Faridabad",
    region: "Haryana",
    seoTitle: "Website Design in Faridabad",
    seoDescription:
      "Faridabad businesses deserve great websites. We design and develop custom sites optimized for Google search and local visibility. 6+ years, 400+ projects.",
    keywords: ["website design Faridabad", "web design Faridabad", "Faridabad SEO", "website company Faridabad"],
  },
  ghaziabad: {
    city: "Ghaziabad",
    region: "Uttar Pradesh",
    seoTitle: "Web Design Services in Ghaziabad",
    seoDescription:
      "Modern, fast-loading websites designed for Ghaziabad manufacturers, traders and service businesses. SEO included. Talk to our team about your online presence.",
    keywords: ["website design Ghaziabad", "Ghaziabad web design", "Ghaziabad SEO services", "website Ghaziabad"],
  },
};

const contents: Record<string, string> = {
  delhi: `<p><strong>Why Delhi businesses choose Web Digital Development:</strong></p>
<p>Delhi's competitive market demands a website that stands out. We design websites for businesses across Delhi NCR — from startup founders in Gurgaon to established traders in South Delhi to manufacturers in Noida. Every site we build is custom-coded, optimized for Google search from day one, and built to convert visitors into paying customers.</p>
<p>You'll work with a founder-led team based in Palam, New Delhi. No outsourcing, no templated work — just custom design and development that your business owns completely.</p>
<p><strong>Services in Delhi:</strong> Website designing, web development (Next.js, WordPress, custom code), on-page & technical SEO, digital marketing, e-commerce sites, and business registration support (Pvt Ltd, MSME, startup registration).</p>
<p><strong>Our Delhi clients:</strong> We've shipped 400+ websites for businesses across Delhi NCR, Mumbai, Bangalore and internationally. From Expoed (Spanish e-commerce) to local tour operators and real estate, we understand what Delhi businesses need to win online.</p>
<p><strong>Next steps:</strong> Book a 20-minute call or WhatsApp +91 8130270050 to talk about your project. We'll ask about your goals, show you real examples of our work, and send a written proposal with next steps.</p>`,
  noida: `<p><strong>Website design for Noida's growing startup ecosystem:</strong></p>
<p>Noida's startups and established businesses are going digital fast. A great website isn't optional anymore — it's how customers find you. We specialize in building websites that rank on Google and convert visitors into leads.</p>
<p>Our team is based in Delhi, so we understand the Noida market, the local competition, and what customers in NCR are searching for. Your website will be competitive from day one.</p>
<p><strong>Why Noida businesses work with us:</strong> Custom code (not templates), SEO built in (not bolted on), founder reviews every project, and clear fixed pricing (no scope-creep surprises).</p>
<p><strong>What we build:</strong> Brochure sites, e-commerce stores, apps and portals, SaaS landing pages, and custom integrations. We've shipped 400+ websites and ranked dozens on page 1 of Google for competitive keywords.</p>
<p><strong>Let's talk:</strong> Call or WhatsApp +91 8130270050, or fill in our contact form. We reply fast — usually within hours, never longer than one working day.</p>`,
  gurgaon: `<p><strong>Gurgaon startups and businesses deserve better websites:</strong></p>
<p>Gurgaon's pace is fast. Your website needs to match. We build sites that load in under 2 seconds on real phones, rank on Google for competitive keywords, and actually convert visitors into customers.</p>
<p>Whether you're a two-person startup or an established business, we design and develop custom websites without the big-agency overhead. You get founder-level attention and transparent pricing.</p>
<p><strong>Our process:</strong> Discovery call → Design approval (Figma prototype) → Development → Launch → One month of free support. Clear, transparent, no surprises.</p>
<p><strong>Services:</strong> Website designing (mobile-first, conversion-focused), web development (Next.js, WordPress, PHP), on-page & technical SEO, e-commerce, digital marketing, and business registration consulting.</p>
<p><strong>Based in Delhi, serving Gurgaon and NCR:</strong> Same time zone, fast responses, real access to the team. WhatsApp +91 8130270050 or book a call to discuss your project.</p>`,
  faridabad: `<p><strong>Faridabad manufacturing and trading businesses need websites that work:</strong></p>
<p>If you're a manufacturer, automotive supplier, trader, or industrial business in Faridabad, a static brochure site isn't enough. Customers expect to find detailed product info, fast load times, and easy ways to contact you. We build all of that.</p>
<p>Our websites are optimized for Google search so customers in Faridabad and across India find you when they search for what you sell.</p>
<p><strong>What we've built for Faridabad businesses:</strong> Motor glass websites, plantation company sites, manufacturing portals, and trading company catalogs. 400+ projects across India since 2019.</p>
<p><strong>Process:</strong> Free 20-min call to understand your business → Written proposal with timeline and price (fixed, no hidden costs) → Design → Development → One month of free post-launch support.</p>
<p><strong>Let's start:</strong> WhatsApp +91 8130270050 or call to talk about your online presence. We'll ask about your goals and send real examples of similar work.</p>`,
  ghaziabad: `<p><strong>Ghaziabad businesses deserve a website that ranks:</strong></p>
<p>Online presence is no longer optional in Ghaziabad's competitive market. Customers search before they call. Your website needs to be easy to find and easy to use.</p>
<p>We design websites for Ghaziabad manufacturers, traders, and service businesses. Every site we build is optimized for Google search from the start — clean code, fast load times, local SEO for Ghaziabad and NCR.</p>
<p><strong>How we work:</strong> No templates, no white-label outsourcing. We build custom sites with our own team. You get founder-level attention and transparent, fixed pricing.</p>
<p><strong>Services:</strong> Website designing (mobile-first), web development, on-page & technical SEO, e-commerce sites, digital marketing setup, and business registration support.</p>
<p><strong>Our experience:</strong> 400+ websites launched, 250+ clients across India and abroad. We've worked with e-commerce brands, tourism companies, plantations, and automotive suppliers — we understand diverse business models.</p>
<p><strong>Let's talk:</strong> Book a 20-minute call or WhatsApp +91 8130270050. We'll discuss your goals and send a written proposal.</p>`,
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  for (const [slug, meta] of Object.entries(locations)) {
    const doc = {
      slug,
      city: meta.city,
      region: meta.region,
      title: `${meta.city} Web Design & Development Services`,
      description: `Professional website design, development and SEO services in ${meta.city}.`,
      content: contents[slug],
      seoTitle: meta.seoTitle,
      seoDescription: meta.seoDescription,
      keywords: meta.keywords,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("locationpages").updateOne({ slug }, { $set: doc }, { upsert: true });
    console.log(`✓ ${meta.city}`);
  }

  await mongoose.disconnect();
  console.log("✓ Done.");
}

run().catch((e) => { console.error(e); process.exit(1); });
