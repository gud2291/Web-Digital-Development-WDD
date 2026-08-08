import { NextResponse } from "next/server";
import { getLegalPageBySlug } from "@/server/services/legalPage.service";
import { handle, notFound } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const limited = await publicReadGate(req, "legal");
  if (limited) return limited;
  return handle(async () => {
    const doc = await getLegalPageBySlug(ctx.params.slug);
    if (!doc) return notFound("Legal page");
    return NextResponse.json(doc);
  });
}
