import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Settings from "@/server/models/Settings";
import type { UpdateSettingsInput } from "@/server/validation/settings";

export async function getSettings() {
  await connectDB();
  let doc = await Settings.findOne({}).lean();
  if (!doc) {
    const created = await Settings.create({});
    doc = created.toObject();
  }
  return doc;
}

export async function updateSettings(data: UpdateSettingsInput) {
  await connectDB();
  const doc = await Settings.findOne({});
  if (!doc) {
    return Settings.create(data);
  }
  Object.assign(doc, data);
  await doc.save();
  return doc.toObject();
}

/**
 * Public-safe subset of settings — excludes analytics IDs which should be
 * served via env vars and not via DB fetch on every public request anyway.
 */
export async function getPublicSettings() {
  const s = await getSettings();
  if (!s) return null;
  return {
    business: s.business,
    social: s.social,
    chatbot: s.chatbot,
  };
}
