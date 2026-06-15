import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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

/**
 * Cached, deduped settings read for the PUBLIC site (layout, footer, contact
 * page, chatbot-config). Returns exactly the same data as `getSettings()`.
 *
 * - React `cache()` dedupes the repeated reads within a single render (the
 *   public layout and the footer both need settings → one DB hit, not two).
 * - `unstable_cache` + the `"settings"` tag avoids a DB round-trip on every
 *   navigation across requests; `revalidate` is a safety net.
 *
 * Freshness is preserved by `revalidateTag("settings")` in the admin settings
 * PUT route, so an admin save still shows immediately. Admin reads keep using
 * the uncached `getSettings()` so the admin form is always live.
 */
export const getCachedSettings = cache(
  unstable_cache(async () => getSettings(), ["public-settings"], {
    tags: ["settings"],
    revalidate: 3600,
  })
);

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
