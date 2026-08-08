import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/server";

/**
 * Deliberately NOT wrapped in `publicReadGate` like the other public reads.
 * `app/(public)/locations/[slug]/page.tsx` fetches this route server-side, so
 * every visitor's request reaches it from the single server IP — a per-IP limit
 * here would throttle the location pages for everyone at once.
 */
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "Server error" }, { status: 500 });
    const collection = db.collection("locationpages");
    const doc = (await collection.findOne({ slug: params.slug, visible: true })) as Record<string, unknown> | null;
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
