import "server-only";
import { connectDB } from "@/server/db/mongodb";
import SiteContent from "@/server/models/SiteContent";
import type { UpdateSiteContentInput } from "@/server/validation/siteContent";

export async function getSiteContent() {
  await connectDB();
  let doc = await SiteContent.findOne({}).lean();
  if (!doc) {
    const created = await SiteContent.create({});
    doc = created.toObject();
  }
  return doc;
}

export async function updateSiteContent(data: UpdateSiteContentInput) {
  await connectDB();
  const doc = await SiteContent.findOne({});
  if (!doc) {
    return SiteContent.create(data);
  }
  Object.assign(doc, data);
  await doc.save();
  return doc.toObject();
}
