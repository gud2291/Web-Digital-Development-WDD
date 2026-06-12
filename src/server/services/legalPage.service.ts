import "server-only";
import { connectDB } from "@/server/db/mongodb";
import LegalPage from "@/server/models/LegalPage";
import type { UpsertLegalPageInput } from "@/server/validation/legalPage";

export async function listLegalPages() {
  await connectDB();
  return LegalPage.find({}).sort({ slug: 1 }).lean();
}

export async function getLegalPageBySlug(slug: string) {
  await connectDB();
  return LegalPage.findOne({ slug }).lean();
}

export async function upsertLegalPage(data: UpsertLegalPageInput) {
  await connectDB();
  return LegalPage.findOneAndUpdate(
    { slug: data.slug },
    { ...data, lastUpdated: new Date() },
    { new: true, upsert: true }
  ).lean();
}
