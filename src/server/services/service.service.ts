import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/server/db/mongodb";
import Service from "@/server/models/Service";
import type { CreateServiceInput, UpdateServiceInput } from "@/server/validation/service";

export async function listServices(opts: { includeHidden?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!opts.includeHidden) filter.visible = true;
  return Service.find(filter).sort({ order: 1, createdAt: -1 }).lean();
}

/**
 * Cached, deduped read of the published services as lightweight nav entries
 * ({ label, slug } in admin display order) for the public header dropdown +
 * mobile menu. Mirrors `getCachedSettings`/`getCachedSiteContent`:
 *
 * - React `cache()` dedupes within a single render.
 * - `unstable_cache` + the `"services"` tag avoids a DB round-trip per nav;
 *   `revalidatePublic.services()` calls `revalidateTag("services")` on every
 *   service create/update/delete/reorder, so a newly-added service appears in
 *   the dropdown right after saving — no code change needed.
 */
export const getCachedNavServices = cache(
  unstable_cache(
    async () => {
      const items = await listServices();
      return items.map((s) => ({ label: s.title as string, slug: s.slug as string }));
    },
    ["public-nav-services"],
    { tags: ["services"], revalidate: 3600 }
  )
);

export async function getServiceBySlug(slug: string, includeHidden = false) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (!includeHidden) filter.visible = true;
  return Service.findOne(filter).lean();
}

export async function getServiceById(id: string) {
  await connectDB();
  return Service.findById(id).lean();
}

export async function createService(data: CreateServiceInput) {
  await connectDB();
  return Service.create(data);
}

export async function updateService(id: string, data: UpdateServiceInput) {
  await connectDB();
  return Service.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteService(id: string) {
  await connectDB();
  await Service.findByIdAndDelete(id);
  return { ok: true };
}
