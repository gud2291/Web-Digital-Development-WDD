import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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
  
  const homeDoc = await Homepage.findOne({});
  if (!homeDoc) {
    console.error("✗ No homepage document found in database.");
    await mongoose.disconnect();
    return;
  }
  
  const originalSlides = homeDoc.heroSlides;
  if (!originalSlides || originalSlides.length < 4) {
    console.error("✗ Homepage doesn't have at least 4 slides. Found:", originalSlides ? originalSlides.length : 0);
    await mongoose.disconnect();
    return;
  }
  
  console.log("Original Slides length:", originalSlides.length);
  
  // Clone slide 4 (originally index 3)
  const slide4 = { ...originalSlides[3].toObject() };
  
  // Configure slide 4 as a video slide in position 1
  slide4.type = "video";
  slide4.video = "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4";
  
  // Clone the other slides and clear residual videos
  const slide1 = { ...originalSlides[0].toObject() };
  slide1.video = ""; // Clear residual video URL from slide 1
  
  const slide2 = { ...originalSlides[1].toObject() };
  slide2.video = "";
  
  const slide3 = { ...originalSlides[2].toObject() };
  slide3.video = "";
  
  // Re-order array so that the updated slide 4 is at index 0 (first position)
  const newSlides = [
    slide4, // Now first slide
    slide1,
    slide2,
    slide3,
  ];
  
  homeDoc.heroSlides = newSlides;
  homeDoc.markModified("heroSlides");
  
  await homeDoc.save();
  console.log("✓ Homepage heroSlides updated successfully!");
  
  // Verification
  const updatedDoc = await Homepage.findOne({});
  console.log("Updated slides count:", updatedDoc.heroSlides.length);
  console.log("Slide 1 (New First Position Video Slide):", updatedDoc.heroSlides[0]);
  console.log("Slide 2:", updatedDoc.heroSlides[1]);
  
  await mongoose.disconnect();
}

run().catch(console.error);
