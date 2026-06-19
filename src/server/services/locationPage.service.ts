import "server-only";

import { connectDB } from "@/server";

export interface LocationPageResult {
  slug: string;
  city: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  visible: boolean;
  updatedAt?: Date;
}

export async function listLocationPages(): Promise<LocationPageResult[]> {
  const mongoose = await connectDB();
  const db = mongoose.connection.db;
  if (!db) return [];
  const collection = db.collection("locationpages");
  const docs = (await collection.find({ visible: true }).toArray()) as Array<Record<string, unknown>>;
  return docs.map((d) => ({
    slug: d.slug as string,
    city: d.city as string,
    title: d.title as string,
    seoTitle: d.seoTitle as string,
    seoDescription: d.seoDescription as string,
    visible: d.visible as boolean,
    updatedAt: d.updatedAt as Date | undefined,
  }));
}
