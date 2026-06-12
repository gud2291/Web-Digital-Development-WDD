import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/server";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const db = await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = (db as any).collection("locationpages");
    const doc = (await collection.findOne({ slug: params.slug, visible: true })) as Record<string, unknown> | null;
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
