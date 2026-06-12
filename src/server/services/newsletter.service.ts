import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Newsletter from "@/server/models/Newsletter";
import type { SubscribeInput } from "@/server/validation/newsletter";

/**
 * Subscribe (or re-subscribe) an email. Idempotent: a duplicate email updates
 * the existing record instead of erroring. Returns `isNew` so the caller can
 * send the welcome email only for first-time subscribers.
 */
export async function subscribe(data: SubscribeInput) {
  await connectDB();
  const email = data.email.toLowerCase();
  const existing = await Newsletter.findOne({ email }).lean();
  const doc = await Newsletter.findOneAndUpdate(
    { email },
    {
      $set: { unsubscribed: false, source: data.source || "footer" },
      $setOnInsert: { subscribedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return { doc, isNew: !existing };
}

export async function listSubscribers() {
  await connectDB();
  return Newsletter.find().sort({ createdAt: -1 }).lean();
}
