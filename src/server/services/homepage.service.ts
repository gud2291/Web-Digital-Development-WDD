import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Homepage from "@/server/models/Homepage";
import type { UpdateHomepageInput } from "@/server/validation/homepage";

/**
 * Homepage is a singleton — there's always exactly one document.
 * Fetch returns the doc; if none exists, creates a blank one.
 */
export async function getHomepage() {
  await connectDB();
  let doc = await Homepage.findOne({}).lean();
  if (!doc) {
    const created = await Homepage.create({});
    doc = created.toObject();
  }
  return doc;
}

export async function updateHomepage(data: UpdateHomepageInput) {
  await connectDB();
  const doc = await Homepage.findOne({});
  if (!doc) {
    return Homepage.create(data);
  }
  Object.assign(doc, data);
  await doc.save();
  return doc.toObject();
}
