import "server-only";
import { connectDB } from "@/server/db/mongodb";
import type { Model } from "mongoose";

/**
 * §16.4 — auto-reindex. Given the FULL ordered array of ids, overwrite every
 * document's `order` to its `index + 1` (1-based, contiguous) in a single
 * bulkWrite. Guarantees unique, gap-free, idempotent ordering.
 */
export async function reorderBatch<T>(model: Model<T>, orderedIds: string[]): Promise<void> {
  await connectDB();
  if (!orderedIds.length) return;
  const ops = orderedIds.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
  }));
  // The shape is correct for Mongoose; cast through the model's own param type.
  await model.bulkWrite(ops as unknown as Parameters<typeof model.bulkWrite>[0]);
}
