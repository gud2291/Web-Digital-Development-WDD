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
    console.log("No homepage document found.");
  } else {
    console.log("Current homepage document:");
    console.log(JSON.stringify(homeDoc.toObject(), null, 2));
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
