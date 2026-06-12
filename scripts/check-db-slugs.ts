/* eslint-disable no-console */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

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

const ServiceSchema = new Schema({ slug: String });
const ProjectSchema = new Schema({ slug: String });
const BlogSchema = new Schema({ slug: String });

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function run() {
  await mongoose.connect(MONGODB_URI!);
  console.log("CONNECTED TO MONGO");
  
  const services = await Service.find({}, "slug");
  console.log("Services Slugs in DB:", services.map(s => s.slug));

  const projects = await Project.find({}, "slug");
  console.log("Projects Slugs in DB:", projects.map(p => p.slug));

  const blogs = await Blog.find({}, "slug");
  console.log("Blogs Slugs in DB:", blogs.map(b => b.slug));

  await mongoose.disconnect();
}

run();
