/* eslint-disable no-console */
/**
 * Seed Projects — replace demo projects with real portfolio items from
 * webdigitaldevelopment.in plus 3 priority client websites.
 *
 * Run:  npx tsx scripts/seed-projects.ts
 *
 * What it does:
 * 1. Connects to MongoDB Atlas
 * 2. Deletes ALL existing project documents
 * 3. Downloads project cover images from source URLs
 * 4. Uploads them to Cloudinary under wdd/projects
 * 5. Inserts all projects with correct order (priority ones first)
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// ─── Load .env.local ────────────────────────────────────────────────────
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

const { MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set in .env.local");
  process.exit(1);
}
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("✗ Cloudinary environment variables are missing in .env.local");
  process.exit(1);
}

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Minimal Project schema (matches src/server/models/Project.ts) ──────
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

const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);

// ─── Slugify helper ─────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Upload remote image URL to Cloudinary ──────────────────────────────
async function uploadUrl(imageUrl: string, publicId: string): Promise<string> {
  try {
    console.log(`  ↑ Uploading ${publicId}...`);
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "wdd/projects",
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });
    console.log(`  ✓ Uploaded → ${result.secure_url}`);
    return result.secure_url;
  } catch (err: any) {
    console.error(`  ✗ Failed to upload ${publicId}: ${err.message}`);
    return "";
  }
}

// ─── Upload local file to Cloudinary ────────────────────────────────────
async function uploadLocalFile(filePath: string, publicId: string): Promise<string> {
  const absolutePath = resolve(process.cwd(), filePath);
  if (!existsSync(absolutePath)) {
    console.warn(`  ⚠ File not found: ${absolutePath}. Skipping.`);
    return "";
  }
  try {
    console.log(`  ↑ Uploading local file ${publicId}...`);
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: "wdd/projects",
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });
    console.log(`  ✓ Uploaded → ${result.secure_url}`);
    return result.secure_url;
  } catch (err: any) {
    console.error(`  ✗ Failed to upload ${publicId}: ${err.message}`);
    return "";
  }
}

// ─── Screenshot directory (for locally captured screenshots) ────────────
const HOME_DIR = process.env.USERPROFILE || process.env.HOME || "";
const SCREENSHOTS_DIR = resolve(HOME_DIR, ".gemini", "antigravity-ide", "brain", "58887775-b1db-499f-9100-d71be031f6bd");

// ─── Project data ───────────────────────────────────────────────────────
interface ProjectSeed {
  title: string;
  category: string;
  description: string;
  imageSource: string; // Remote URL to download from
  localImagePath?: string; // Optional: local file path (takes priority over imageSource)
  liveUrl: string;
  featured: boolean;
  tech: string[];
}

// Find screenshot files dynamically (they have timestamps in name)
function findScreenshot(pattern: string): string {
  const { readdirSync } = require("fs");
  try {
    const files: string[] = readdirSync(SCREENSHOTS_DIR);
    const match = files.find((f: string) => f.startsWith(pattern) && f.endsWith(".png"));
    return match ? resolve(SCREENSHOTS_DIR, match) : "";
  } catch {
    return "";
  }
}

const PROJECTS: ProjectSeed[] = [
  // ── Priority projects (top 3) ──
  {
    title: "Orgway Agritech",
    category: "Agriculture",
    description:
      "A modern, responsive website for Orgway Agritech — an organic farming and agri-tech company. Features product showcases, company information, and contact integration.",
    imageSource: "",
    localImagePath: findScreenshot("orgway_agritech"),
    liveUrl: "https://orgwayagritech.com",
    featured: true,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    title: "Sahayog Solar",
    category: "Solar Energy",
    description:
      "Complete web presence for Sahayog Solar — a solar energy solutions provider. Clean design with service listings, project portfolio, and lead generation forms.",
    imageSource: "",
    localImagePath: findScreenshot("sahayog_solar"),
    liveUrl: "https://www.sahayogsolar.com",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
  },
  {
    title: "Ajay Kumar Singhal",
    category: "Portfolio",
    description:
      "A professional personal portfolio website for Ajay Kumar Singhal. Elegant design showcasing professional achievements, gallery, and contact information.",
    imageSource: "",
    localImagePath: findScreenshot("ajay_singhal"),
    liveUrl: "https://ajaykumarsinghal.com",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript"],
  },

  // ── Projects from webdigitaldevelopment.in homepage ──
  {
    title: "Expoed",
    category: "Web",
    description:
      "Corporate website designed and developed for Expoed, a Spain-based company. Professional design with multilingual support and modern UI.",
    imageSource: "https://webdigitaldevelopment.in/img/expoed.avif",
    liveUrl: "https://expoed.es",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    title: "SBM Greens",
    category: "Web",
    description:
      "Website design for SBM Greens — a plantation and green solutions company. Features clean layouts, service descriptions, and enquiry forms.",
    imageSource: "https://webdigitaldevelopment.in/img/sbmgreens.avif",
    liveUrl: "https://sbmgreens.com/",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
  },
  {
    title: "Vishwakarma Tourist Service",
    category: "Tourism",
    description:
      "Tourism service website for Vishwakarma Tourist Service. User-friendly booking interface, tour packages display, and responsive design.",
    imageSource: "https://webdigitaldevelopment.in/img/vishwakarmatour.avif",
    liveUrl: "https://vishwakarmatouristservice.com/",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },

  // ── Projects from webdigitaldevelopment.in/projects.php ──
  {
    title: "Shree Namo Motar Glass",
    category: "Automotive",
    description:
      "E-commerce and showcase website for Shree Namo Motar Glass — an automotive glass company. Product catalog with enquiry system.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/shri.png",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    title: "IHS Gurgaon",
    category: "Web",
    description:
      "Professional corporate website for IHS Gurgaon. Modern design with service listings, company profiles, and contact integration.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/ihs.gif",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "QuickBooks Next",
    category: "Finance",
    description:
      "Financial services website for QuickBooks Next. Clean, professional design with service breakdowns and client testimonials.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/quck.gif",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    title: "VM International",
    category: "Web",
    description:
      "International business website for VM International. Multi-page responsive design with company information and services.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/vm.jpg",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Atlanture",
    category: "Web",
    description:
      "Modern corporate website for Atlanture. Sleek design with interactive elements, team showcase, and professional service listings.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/atlan.jpg",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
  },
  {
    title: "Fams Global Trade",
    category: "Trading",
    description:
      "Business website for Fams Global Trade — an international trading company. Professional design with product listings and global presence showcase.",
    imageSource: "https://webdigitaldevelopment.in/img/portfolios/fams.jpg",
    liveUrl: "",
    featured: false,
    tech: ["HTML", "CSS", "JavaScript", "PHP"],
  },
];

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log("→ Connecting to MongoDB Atlas…");
  await mongoose.connect(MONGODB_URI!, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 30000,
  });
  console.log("✓ Connected to MongoDB\n");

  // Step 1: Delete all existing projects
  console.log("━━━ Step 1: Clearing existing projects ━━━");
  const deleted = await Project.deleteMany({});
  console.log(`✓ Deleted ${deleted.deletedCount} existing project(s)\n`);

  // Step 2: Upload images and create projects
  console.log("━━━ Step 2: Uploading images & creating projects ━━━\n");

  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const slug = slugify(p.title);
    console.log(`[${i + 1}/${PROJECTS.length}] ${p.title}`);

    // Upload cover image to Cloudinary (prefer local file, fall back to URL)
    let imageUrl = "";
    if (p.localImagePath && existsSync(p.localImagePath)) {
      imageUrl = await uploadLocalFile(p.localImagePath, slug);
    } else if (p.imageSource) {
      imageUrl = await uploadUrl(p.imageSource, slug);
    }

    // Create project document
    const doc = new Project({
      title: p.title,
      slug,
      category: p.category,
      description: p.description,
      image: imageUrl,
      liveUrl: p.liveUrl,
      featured: p.featured,
      visible: true,
      order: i,
      tech: p.tech,
    });

    await doc.save();
    console.log(`  ✓ Project created: ${p.title} (order: ${i})\n`);
  }

  // Done
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎉 Successfully seeded ${PROJECTS.length} projects!`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Order:");
  PROJECTS.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title}${p.featured ? " ⭐ FEATURED" : ""}`);
  });

  await mongoose.disconnect();
  console.log("\n✓ Done — disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
