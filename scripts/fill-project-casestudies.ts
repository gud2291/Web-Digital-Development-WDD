/* eslint-disable no-console */
/**
 * One-off WRITE script: fill case-study content (clientBackground, objective,
 * solution, timeline, features) for every project that's still missing it.
 *
 * SAFE: only fills a field if it is currently EMPTY — never overwrites content
 * you've already added in the admin. Idempotent.
 *
 * Content is written in a human, first-person voice from each project's known
 * details. Timelines are reasonable estimates — review/tweak in the admin.
 *
 * Reads MONGODB_URI from .env.local (same pattern as the other scripts).
 * Run:  npx tsx scripts/fill-project-casestudies.ts
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

interface CaseStudy {
  title: string; // matched case-insensitively against the project title
  clientBackground: string;
  objective: string;
  solution: string;
  timeline: string;
  features: string[];
}

const DATA: CaseStudy[] = [
  {
    title: "Orgway Agritech",
    clientBackground:
      "Orgway Agritech works in organic farming and agri-tech, selling produce and farming solutions to buyers who care where their food comes from. They had a brand people trusted offline, but almost nothing online.",
    objective:
      "They needed a site that showed their products clearly, told their story, and made it easy for buyers and partners to reach them — without looking like every other agriculture template.",
    solution:
      "We built a clean, responsive site with proper product showcases, an about section that explains who they are, and contact integration so enquiries land straight in their inbox. We kept images light so pages load fast even on slow rural connections.",
    timeline: "Delivered in about 6 weeks, first call to launch.",
    features: ["Mobile-first responsive design", "Product showcase sections", "Company story / about page", "Contact + enquiry integration", "Fast loading on slow connections", "SEO-ready structure"],
  },
  {
    title: "Sahayog Solar",
    clientBackground:
      "Sahayog Solar installs solar energy systems for homes and businesses. They had the expertise and the customers, but their old online presence didn't reflect the quality of their work.",
    objective:
      "They wanted a complete web presence — a place to list services, show past projects, and capture leads from people researching solar before they buy.",
    solution:
      "We designed a clean site with clear service listings, a project portfolio that builds trust, and lead-generation forms placed where visitors actually convert. It's fully responsive, so it works for someone searching 'solar installer' on their phone.",
    timeline: "Roughly 5–6 weeks from first call to live.",
    features: ["Responsive design", "Service listings", "Project portfolio", "Lead-generation forms", "SEO-ready", "Fast load times"],
  },
  {
    title: "Ajay Kumar Singhal",
    clientBackground:
      "Ajay Kumar Singhal needed a personal portfolio that did justice to his work — the kind of site you send someone instead of a PDF.",
    objective:
      "He wanted something elegant and easy to update, with a gallery, his achievements, and a clear way for people to get in touch.",
    solution:
      "We built a refined, single-purpose portfolio: a clean layout, a gallery that lets the work speak, an achievements section, and simple contact details. No clutter, nothing competing for attention.",
    timeline: "About 3 weeks.",
    features: ["Responsive portfolio design", "Image gallery", "Achievements / credentials section", "Contact details", "Lightweight, fast pages", "SEO-ready"],
  },
  {
    title: "Expoed",
    clientBackground:
      "Expoed is a Spain-based company that needed a corporate site for an international audience. Their old site didn't match how established the business actually is.",
    objective:
      "They needed a professional, modern site that worked across languages and felt credible to clients in different countries.",
    solution:
      "We designed a corporate site with a modern UI and multilingual support, structured so visitors in different regions land on content that makes sense to them. Clean, fast, and easy for their team to maintain.",
    timeline: "Around 7 weeks, including the multilingual setup.",
    features: ["Responsive corporate design", "Multilingual support", "Modern UI", "Clear company / services sections", "SEO-ready structure", "Fast international load times"],
  },
  {
    title: "SBM Greens",
    clientBackground:
      "SBM Greens works in plantation and green solutions. They wanted their site to feel as clean and considered as the work they do.",
    objective:
      "They needed clear layouts to explain their services and an easy way for visitors to send enquiries.",
    solution:
      "We built a clean, responsive site with well-organised service descriptions and enquiry forms placed where people are ready to ask. Simple navigation, nothing in the way.",
    timeline: "About 4–5 weeks.",
    features: ["Responsive design", "Clear service descriptions", "Enquiry forms", "Clean navigation", "SEO-ready", "Fast loading"],
  },
  {
    title: "Medhawi",
    clientBackground:
      "Medhawi is in the education space and needed an online presence that parents and students could trust at a glance.",
    objective:
      "They wanted a clear, approachable site that explains what they offer and makes it easy to get in touch.",
    solution:
      "We built a straightforward, responsive education site — easy to read, easy to navigate, with the important information up front and a simple path to contact them.",
    timeline: "Roughly 4 weeks.",
    features: ["Responsive design", "Clear information layout", "Easy navigation", "Contact / enquiry options", "SEO-ready", "Mobile-friendly"],
  },
  {
    title: "Shree Namo Motar Glass",
    clientBackground:
      "Shree Namo Motar Glass supplies automotive glass. They had a catalogue of products but no easy way for customers to browse and enquire online.",
    objective:
      "They needed a showcase plus a simple enquiry system so customers could find the right product and reach out.",
    solution:
      "We built a product catalogue with an enquiry system on top — customers can browse what's available and send a request without friction. Clean, responsive, and quick to load.",
    timeline: "About 5 weeks.",
    features: ["Responsive design", "Product catalogue", "Enquiry system", "Easy browsing", "SEO-ready", "Mobile-friendly"],
  },
  {
    title: "IHS Gurgaon",
    clientBackground:
      "IHS Gurgaon needed a professional corporate site that matched their standing as an established business.",
    objective:
      "They wanted clear service listings, company profiles, and an easy contact path for prospects.",
    solution:
      "We designed a modern corporate site with organised service listings, company-profile sections, and contact integration — structured so a visitor understands what they do in under a minute.",
    timeline: "Around 6 weeks.",
    features: ["Responsive corporate design", "Service listings", "Company profiles", "Contact integration", "SEO-ready", "Fast loading"],
  },
  {
    title: "QuickBooks Next",
    clientBackground:
      "QuickBooks Next offers financial services and needed a site that felt trustworthy from the first scroll — which matters a lot in finance.",
    objective:
      "They wanted clear service breakdowns and social proof to reassure visitors before they reach out.",
    solution:
      "We built a clean, professional site with clear service breakdowns and client testimonials placed where they build confidence. Calm design, no clutter, easy to act on.",
    timeline: "About 5–6 weeks.",
    features: ["Responsive design", "Clear service breakdowns", "Client testimonials", "Trust-focused layout", "SEO-ready", "Fast loading"],
  },
  {
    title: "VM International",
    clientBackground:
      "VM International runs an international business and needed a multi-page site that reflected their reach.",
    objective:
      "They wanted a responsive, multi-page site covering company information and services clearly.",
    solution:
      "We built a multi-page, fully responsive site with well-structured company and services sections — easy to navigate whether a visitor is on a desktop in one country or a phone in another.",
    timeline: "Around 6 weeks.",
    features: ["Responsive multi-page design", "Company information sections", "Services pages", "Clear navigation", "SEO-ready", "Fast international load"],
  },
  {
    title: "Atlanture",
    clientBackground:
      "Atlanture wanted a corporate site that felt modern and a bit more alive than the usual company website.",
    objective:
      "They wanted interactive touches, a team showcase, and professional service listings — without sacrificing speed.",
    solution:
      "We designed a sleek corporate site with subtle interactive elements, a team showcase that adds a human face, and clear service listings. Polished, but still fast.",
    timeline: "About 6–7 weeks.",
    features: ["Responsive design", "Interactive elements", "Team showcase", "Service listings", "SEO-ready", "Fast loading"],
  },
  {
    title: "Fams Global Trade",
    clientBackground:
      "Fams Global Trade is an international trading company that needed a site to present its products and global presence credibly.",
    objective:
      "They wanted clear product listings and a way to show the scale of their operations to partners and buyers.",
    solution:
      "We built a professional, responsive site with organised product listings and sections that show their global reach — structured to build trust with international buyers.",
    timeline: "Around 5–6 weeks.",
    features: ["Responsive design", "Product listings", "Global-presence sections", "Professional layout", "SEO-ready", "Fast loading"],
  },
];

const Project =
  mongoose.models.Project ||
  mongoose.model("Project", new Schema({}, { strict: false, collection: "projects" }));

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  let created = 0,
    skipped = 0,
    notFound = 0;

  for (const cs of DATA) {
    const doc = (await Project.findOne({
      title: new RegExp(`^${cs.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })) as (mongoose.Document & Record<string, unknown>) | null;

    if (!doc) {
      console.log(`⚠ Not found: "${cs.title}"`);
      notFound++;
      continue;
    }

    const set: Record<string, unknown> = {};
    if (isEmpty(doc.clientBackground)) set.clientBackground = cs.clientBackground;
    if (isEmpty(doc.objective)) set.objective = cs.objective;
    if (isEmpty(doc.solution)) set.solution = cs.solution;
    if (isEmpty(doc.timeline)) set.timeline = cs.timeline;
    if (isEmpty(doc.features)) set.features = cs.features;

    if (Object.keys(set).length === 0) {
      console.log(`• ${cs.title}: already has content — skipped`);
      skipped++;
      continue;
    }

    await Project.updateOne({ _id: doc._id }, { $set: set });
    console.log(`✓ ${cs.title}: filled [${Object.keys(set).join(", ")}]`);
    created++;
  }

  console.log(`\n✓ Done — filled ${created}, skipped ${skipped}, not found ${notFound}.`);
  console.log("  (Only empty fields were filled; your manual edits were preserved.)");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✗ fill-project-casestudies failed:", err);
  process.exit(1);
});
