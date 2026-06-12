/* eslint-disable no-console */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// 1. Load env vars from .env.local
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

// Database Schemas
const HeroSlideSchema = new Schema({
  type: { type: String, default: "image" },
  image: { type: String, default: "" },
  video: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  ctaText: { type: String, default: "" },
  ctaUrl: { type: String, default: "" },
});

const ClientLogoSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  visible: { type: Boolean, default: true },
});

const HomepageSchema = new Schema({
  heroSlides: [HeroSlideSchema],
  clientLogos: [ClientLogoSchema],
});

const ServiceSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  coverImage: { type: String, default: "" },
});

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  image: { type: String, default: "" },
});

const BlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  featuredImage: { type: String, default: "" },
});

const TestimonialSchema = new Schema({
  clientName: { type: String, required: true },
  clientPhoto: { type: String, default: "" },
});

const ChatbotConfigSchema = new Schema({
  name: { type: String, default: "Aria" },
  avatar: { type: String, default: "" },
});

const SettingsSchema = new Schema({
  chatbot: ChatbotConfigSchema,
});

// Register Models
const Homepage = mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

// Helper to upload a local file to Cloudinary and return secure URL
async function uploadToCloudinary(localPath: string, folder: string): Promise<string> {
  const absolutePath = resolve(process.cwd(), localPath);
  if (!existsSync(absolutePath)) {
    console.warn(`[WARN] File does not exist: ${absolutePath}. Skipping.`);
    return "";
  }
  try {
    console.log(`Uploading ${localPath} to Cloudinary folder "${folder}"...`);
    const result = await cloudinary.uploader.upload(absolutePath, { folder });
    return result.secure_url;
  } catch (err: any) {
    console.error(`[ERROR] Failed to upload ${localPath}: ${err.message}`);
    // If it's a corrupted logo, use logo 1 as fallback to avoid crashing the pipeline
    if (localPath.includes("clients-logo-02.png")) {
      console.log("Using clients-logo-01.png as clean fallback for logo-02...");
      try {
        const fallbackPath = resolve(process.cwd(), "assets-to-upload/02-homepage/clients-logo-01.png");
        const result = await cloudinary.uploader.upload(fallbackPath, { folder });
        return result.secure_url;
      } catch (fallbackErr: any) {
        console.error("Fallback upload also failed:", fallbackErr.message);
      }
    }
    return "";
  }
}

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected successfully!");

  // --- 1. UPLOAD CHATBOT AVATAR ---
  console.log("\n--- Sourcing Chatbot Avatar ---");
  const avatarUrl = await uploadToCloudinary("assets-to-upload/01-branding/aria-avatar.png", "wdd/branding");
  await Settings.updateOne({}, { $set: { "chatbot.avatar": avatarUrl } });
  console.log(`✓ Chatbot avatar uploaded: ${avatarUrl}`);

  // --- 2. UPLOAD HERO SLIDES ---
  console.log("\n--- Sourcing Hero Slides ---");
  const hero1Url = await uploadToCloudinary("assets-to-upload/02-homepage/hero-1.png", "wdd/homepage");
  const hero2Url = await uploadToCloudinary("assets-to-upload/02-homepage/hero-2.png", "wdd/homepage");
  const hero3Url = await uploadToCloudinary("assets-to-upload/02-homepage/hero-3.png", "wdd/homepage");

  // --- 3. UPLOAD CLIENT LOGOS ---
  console.log("\n--- Sourcing Client Logos ---");
  const logoUrls: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const url = await uploadToCloudinary(`assets-to-upload/02-homepage/clients-logo-0${i}.png`, "wdd/clients");
    logoUrls.push(url);
  }

  // Update Homepage document
  const homeDoc = await Homepage.findOne({});
  if (homeDoc) {
    if (homeDoc.heroSlides && homeDoc.heroSlides.length >= 3) {
      homeDoc.heroSlides[0].image = hero1Url;
      homeDoc.heroSlides[1].image = hero2Url;
      homeDoc.heroSlides[2].image = hero3Url;
    }

    homeDoc.clientLogos = [
      { name: "TATA", image: logoUrls[0], visible: true },
      { name: "Coca-Cola", image: logoUrls[1], visible: true },
      { name: "Paytm", image: logoUrls[2], visible: true },
      { name: "mamaearth", image: logoUrls[3], visible: true },
      { name: "BYJU'S", image: logoUrls[4], visible: true },
      { name: "Lenskart", image: logoUrls[5], visible: true },
      { name: "Client 7", image: logoUrls[6], visible: true },
    ];

    await homeDoc.save();
    console.log("✓ Homepage document updated with Cloudinary URLs.");
  } else {
    console.warn("⚠ No Homepage document found to update.");
  }

  // --- 4. UPLOAD SERVICES COVERS ---
  console.log("\n--- Sourcing Services Covers ---");
  const serviceFiles: Record<string, string> = {
    "website-designing": "website-designing-cover.png",
    "website-development": "web-development-cover.png",
    "seo-services": "seo-services-cover.png",
    "digital-marketing": "digital-marketing-cover.png",
    "ecommerce-development": "e-commerce-development-cover.png",
    "graphic-designing": "graphic-designing-cover.png",
    "wordpress-website": "wordpress-website-cover.png",
    "mobile-first-design": "mobile-first-ui-cover.png",
  };

  for (const [slug, fileName] of Object.entries(serviceFiles)) {
    const url = await uploadToCloudinary(`assets-to-upload/04-services/${fileName}`, "wdd/services");
    await Service.updateOne({ slug }, { $set: { coverImage: url } });
    console.log(`✓ Service ${slug} updated with: ${url}`);
  }

  // --- 5. UPLOAD PROJECTS COVERS ---
  console.log("\n--- Sourcing Projects Covers ---");
  const projectFiles: Record<string, string> = {
    "expoed": "expoed-cover.png",
    "sbm-greens": "sbm-greens-cover.png",
    "vishwakarma-tour": "vishwakarma-tour-cover.png",
    "shree-namo-motar": "shree-namo-motar-cover.png",
  };

  for (const [slug, fileName] of Object.entries(projectFiles)) {
    const url = await uploadToCloudinary(`assets-to-upload/05-projects/${fileName}`, "wdd/projects");
    await Project.updateOne({ slug }, { $set: { image: url } });
    console.log(`✓ Project ${slug} updated with: ${url}`);
    
    // Pro-actively upload gallery images as well so they are in Cloudinary under wdd/projects
    for (let i = 1; i <= 3; i++) {
      try {
        await uploadToCloudinary(`assets-to-upload/05-projects/${slug}-gallery-${i}.png`, "wdd/projects");
      } catch (e: any) {
        console.warn(`Gallery upload failed for ${slug} screen ${i}: ${e.message}`);
      }
    }
  }

  // --- 6. UPLOAD BLOG FEATURED IMAGES ---
  console.log("\n--- Sourcing Blog Featured Images ---");
  const blogFiles: Record<string, string> = {
    "why-every-business-needs-a-website-2026": "blog-why-every-small-business-needs-a-website-in-2026-cover.png",
    "how-a-good-website-pays-for-itself": "blog-how-a-good-website-pays-for-itself-cover.png",
    "essential-website-features-2026": "blog-7-things-every-business-website-needs-cover.png",
  };

  for (const [slug, fileName] of Object.entries(blogFiles)) {
    const url = await uploadToCloudinary(`assets-to-upload/06-blog/${fileName}`, "wdd/blog");
    await Blog.updateOne({ slug }, { $set: { featuredImage: url } });
    console.log(`✓ Blog ${slug} updated with: ${url}`);
  }

  // --- 7. UPLOAD TESTIMONIAL PHOTOS ---
  console.log("\n--- Sourcing Testimonials Photos ---");
  const testimonialFiles: Record<string, string> = {
    "Yasmin Carol": "yasmin-carol.jpg",
    "Ranjit Singh": "ranjit-singh.jpg",
    "Sneha": "sneha.jpg",
    "Taranjeet": "taranjeet.jpg",
  };

  for (const [clientName, fileName] of Object.entries(testimonialFiles)) {
    const url = await uploadToCloudinary(`assets-to-upload/07-testimonials/${fileName}`, "wdd/testimonials");
    await Testimonial.updateOne({ clientName }, { $set: { clientPhoto: url } });
    console.log(`✓ Testimonial ${clientName} updated with: ${url}`);
  }

  console.log("\n🎉 ALL IMAGES HAVE BEEN UPLOADED TO CLOUDINARY AND REGISTERED IN THE DATABASE!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Cloudinary upload database seeding failed:", err);
  process.exit(1);
});
