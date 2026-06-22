import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/server/db/mongodb";
import QuotationSettings from "@/server/models/QuotationSettings";
import type { UpdateQuotationSettingsInput } from "@/server/validation/quotation";

/**
 * Global quotation settings are a singleton. Mirrors settings.service.ts:
 * admin reads/writes go through the uncached helpers; the PDF route uses the
 * cached read (busted by the admin PUT via revalidateTag("quotation-settings")).
 */
export async function getQuotationSettings() {
  await connectDB();
  let doc = await QuotationSettings.findOne({}).lean();
  if (!doc) {
    const created = await QuotationSettings.create({});
    doc = created.toObject();
  }
  return doc;
}

export const getCachedQuotationSettings = cache(
  unstable_cache(async () => getQuotationSettings(), ["quotation-settings"], {
    tags: ["quotation-settings"],
    revalidate: 3600,
  })
);

export async function updateQuotationSettings(data: UpdateQuotationSettingsInput) {
  await connectDB();
  const doc = await QuotationSettings.findOne({});
  if (!doc) return QuotationSettings.create(data);
  Object.assign(doc, data);
  await doc.save();
  return doc.toObject();
}
