import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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

const MONGODB_URI = process.env.MONGODB_URI;

const HeroSlideSchema = new mongoose.Schema({
  type: { type: String, default: "image" },
  image: { type: String, default: "" },
  video: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  ctaText: { type: String, default: "" },
  ctaUrl: { type: String, default: "" },
});

const HomepageSchema = new mongoose.Schema({
  heroSlides: [HeroSlideSchema],
});

const Homepage = mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected.");
  
  let homeDoc = await Homepage.findOne({});
  if (!homeDoc) {
    homeDoc = new Homepage({ heroSlides: [{ type: "video" }] });
  }
  
  if (!homeDoc.heroSlides || homeDoc.heroSlides.length === 0) {
    homeDoc.heroSlides = [{ type: "video" }];
  }
  
  // Set the video URL properly
  homeDoc.heroSlides[0].video = "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4";
  homeDoc.heroSlides[0].type = "video";
  
  // Mongoose sometimes doesn't detect array element mutation
  homeDoc.markModified('heroSlides');
  
  await homeDoc.save();
  console.log("Updated video successfully!");
  
  const saved = await Homepage.findOne({});
  console.log("Verified heroSlides[0]:", saved.heroSlides[0]);
  
  await mongoose.disconnect();
}

run().catch(console.error);
