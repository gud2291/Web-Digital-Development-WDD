/* eslint-disable no-console */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// Load environment variables from .env.local
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
  console.error("✗ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// Schemas mirroring src/server/models/
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

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected successfully!");

  // 1. Update Settings Chatbot Avatar
  console.log("\nUpdating Settings...");
  await Settings.updateOne(
    {},
    { $set: { "chatbot.avatar": "/assets-to-upload/01-branding/aria-avatar.png" } }
  );
  console.log("✓ Settings updated.");

  // 2. Update Homepage Hero slides and Client Logos
  console.log("\nUpdating Homepage Hero & Client Logos...");
  const homeDoc = await Homepage.findOne({});
  if (homeDoc) {
    if (homeDoc.heroSlides && homeDoc.heroSlides.length >= 3) {
      homeDoc.heroSlides[0].image = "/assets-to-upload/02-homepage/hero-1.png";
      homeDoc.heroSlides[1].image = "/assets-to-upload/02-homepage/hero-2.png";
      homeDoc.heroSlides[2].image = "/assets-to-upload/02-homepage/hero-3.png";
    }
    
    // Add client logos
    homeDoc.clientLogos = [
      { name: "TATA", image: "/assets-to-upload/02-homepage/clients-logo-01.png", visible: true },
      { name: "Coca-Cola", image: "/assets-to-upload/02-homepage/clients-logo-02.png", visible: true },
      { name: "Paytm", image: "/assets-to-upload/02-homepage/clients-logo-03.png", visible: true },
      { name: "mamaearth", image: "/assets-to-upload/02-homepage/clients-logo-04.png", visible: true },
      { name: "BYJU'S", image: "/assets-to-upload/02-homepage/clients-logo-05.png", visible: true },
      { name: "Lenskart", image: "/assets-to-upload/02-homepage/clients-logo-06.png", visible: true },
      { name: "Client 7", image: "/assets-to-upload/02-homepage/clients-logo-07.png", visible: true },
    ];
    
    await homeDoc.save();
    console.log("✓ Homepage updated.");
  } else {
    console.warn("⚠ No Homepage document found to update.");
  }

  // 3. Update Services Cover Images
  console.log("\nUpdating Services cover images...");
  const serviceMappings: Record<string, string> = {
    "website-designing": "/assets-to-upload/04-services/website-designing-cover.png",
    "website-development": "/assets-to-upload/04-services/web-development-cover.png",
    "seo-services": "/assets-to-upload/04-services/seo-services-cover.png",
    "digital-marketing": "/assets-to-upload/04-services/digital-marketing-cover.png",
    "ecommerce-development": "/assets-to-upload/04-services/e-commerce-development-cover.png",
    "graphic-designing": "/assets-to-upload/04-services/graphic-designing-cover.png",
    "wordpress-website": "/assets-to-upload/04-services/wordpress-website-cover.png",
    "mobile-first-design": "/assets-to-upload/04-services/mobile-first-ui-cover.png",
  };

  for (const [slug, imgPath] of Object.entries(serviceMappings)) {
    const res = await Service.updateOne({ slug }, { $set: { coverImage: imgPath } });
    console.log(`- Service slug "${slug}": updated ${res.modifiedCount} document`);
  }

  // 4. Update Projects Images
  console.log("\nUpdating Projects images...");
  const projectMappings: Record<string, string> = {
    "expoed": "/assets-to-upload/05-projects/expoed-cover.png",
    "sbm-greens": "/assets-to-upload/05-projects/sbm-greens-cover.png",
    "vishwakarma-tour": "/assets-to-upload/05-projects/vishwakarma-tour-cover.png",
    "shree-namo-motar": "/assets-to-upload/05-projects/shree-namo-motar-cover.png",
  };

  for (const [slug, imgPath] of Object.entries(projectMappings)) {
    const res = await Project.updateOne({ slug }, { $set: { image: imgPath } });
    console.log(`- Project slug "${slug}": updated ${res.modifiedCount} document`);
  }

  // 5. Update Blogs Images
  console.log("\nUpdating Blogs featured images...");
  const blogMappings: Record<string, string> = {
    "why-every-business-needs-a-website-2026": "/assets-to-upload/06-blog/blog-why-every-small-business-needs-a-website-in-2026-cover.png",
    "how-a-good-website-pays-for-itself": "/assets-to-upload/06-blog/blog-how-a-good-website-pays-for-itself-cover.png",
    "essential-website-features-2026": "/assets-to-upload/06-blog/blog-7-things-every-business-website-needs-cover.png",
  };

  for (const [slug, imgPath] of Object.entries(blogMappings)) {
    const res = await Blog.updateOne({ slug }, { $set: { featuredImage: imgPath } });
    console.log(`- Blog slug "${slug}": updated ${res.modifiedCount} document`);
  }

  // 6. Update Testimonial Photos
  console.log("\nUpdating Testimonials photos...");
  const testimonialMappings: Record<string, string> = {
    "Yasmin Carol": "/assets-to-upload/07-testimonials/yasmin-carol.jpg",
    "Ranjit Singh": "/assets-to-upload/07-testimonials/ranjit-singh.jpg",
    "Sneha": "/assets-to-upload/07-testimonials/sneha.jpg",
    "Taranjeet": "/assets-to-upload/07-testimonials/taranjeet.jpg",
  };

  for (const [clientName, imgPath] of Object.entries(testimonialMappings)) {
    const res = await Testimonial.updateOne({ clientName }, { $set: { clientPhoto: imgPath } });
    console.log(`- Testimonial client "${clientName}": updated ${res.modifiedCount} document`);
  }

  console.log("\nAll local image database seeding completed!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed to seed database with local image paths:", err);
  process.exit(1);
});
