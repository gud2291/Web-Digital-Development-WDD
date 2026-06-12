import "server-only";
import { connectDB } from "@/server/db/mongodb";
import SeoMeta from "@/server/models/SeoMeta";
import type { UpsertSeoMetaInput } from "@/server/validation/seoMeta";

export async function listSeoMeta() {
  await connectDB();
  return SeoMeta.find({}).sort({ pageSlug: 1 }).lean();
}

export async function getSeoMeta(pageSlug: string) {
  await connectDB();
  return SeoMeta.findOne({ pageSlug }).lean();
}

export async function upsertSeoMeta(data: UpsertSeoMetaInput) {
  await connectDB();
  return SeoMeta.findOneAndUpdate({ pageSlug: data.pageSlug }, data, {
    new: true,
    upsert: true,
  }).lean();
}

export async function deleteSeoMeta(pageSlug: string) {
  await connectDB();
  await SeoMeta.deleteOne({ pageSlug });
  return { ok: true };
}
