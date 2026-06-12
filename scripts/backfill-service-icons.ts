/* eslint-disable no-console */
/**
 * Backfill iconName + accentColor on the 8 existing services (CLAUDE.md §12.6).
 * Run:  npx tsx scripts/backfill-service-icons.ts
 * Idempotent — re-running just re-applies the same mapping.
 *
 * Standalone (loads .env.local, connects mongoose directly) because src/server/*
 * modules import "server-only"/env.ts which throw under tsx — same pattern as
 * scripts/seed.ts and scripts/seed-content.ts.
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
  console.error("✗ MONGODB_URI is not set (check .env.local)");
  process.exit(1);
}

const ServiceSchema = new Schema({ slug: String, iconName: String, accentColor: String }, { strict: false });
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

// CLAUDE.md §12.6 default mapping (slug → [lucide icon, accent colour])
const MAP: Record<string, { iconName: string; accentColor: string }> = {
  "website-designing": { iconName: "Palette", accentColor: "blue" },
  "website-development": { iconName: "Code2", accentColor: "purple" },
  "seo-services": { iconName: "Search", accentColor: "green" },
  "digital-marketing": { iconName: "TrendingUp", accentColor: "orange" },
  "ecommerce-development": { iconName: "ShoppingCart", accentColor: "pink" },
  "graphic-designing": { iconName: "PenTool", accentColor: "teal" },
  "wordpress-website": { iconName: "Globe", accentColor: "blue" },
  "mobile-first-design": { iconName: "Smartphone", accentColor: "purple" },
};

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 15000 });
  console.log("✓ Connected\n");

  let updated = 0;
  const missing: string[] = [];
  for (const [slug, vals] of Object.entries(MAP)) {
    const res = await Service.findOneAndUpdate({ slug }, { $set: vals }, { new: true });
    if (res) {
      updated += 1;
      console.log(`✓ ${slug} → ${vals.iconName} / ${vals.accentColor}`);
    } else {
      missing.push(slug);
      console.log(`⚠ no service with slug "${slug}" — skipped`);
    }
  }

  await mongoose.disconnect();
  console.log(`\n✓ Done — ${updated}/${Object.keys(MAP).length} services backfilled.`);
  if (missing.length) console.log(`  Missing slugs: ${missing.join(", ")}`);
}

main().catch((err) => {
  console.error("✗ Backfill failed:", err);
  process.exit(1);
});
