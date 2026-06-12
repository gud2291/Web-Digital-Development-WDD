/* eslint-disable no-console */
/**
 * Seed script — creates the initial admin user.
 *
 * Run:  npx tsx scripts/seed.ts
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local and inserts (or
 * upserts) the admin document. Runs standalone — it doesn't import any
 * `server-only` modules.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

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

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("✗ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}

// Minimal Admin schema (matches src/server/models/Admin.ts)
const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["owner", "editor"], default: "owner" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    recoveryCodeHash: { type: String, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    emergencyLocked: { type: Boolean, default: false },
    loginLogs: { type: [Schema.Types.Mixed], default: [] },
    lastPasswordChange: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  });
  console.log("✓ Connected");

  const Admin =
    mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  const email = ADMIN_EMAIL!.toLowerCase();
  const existing = await Admin.findOne({ email });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
  const name = ADMIN_NAME || "WDD Admin";

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = name;
    existing.lastPasswordChange = new Date();
    await existing.save();
    console.log(`✓ Updated existing admin: ${email}`);
  } else {
    await Admin.create({ email, passwordHash, name, role: "owner" });
    console.log(`✓ Created admin: ${email}`);
  }

  await mongoose.disconnect();
  console.log("✓ Done");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
