import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/server/services/service.service";
import { handle, notFound } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const limited = await publicReadGate(req, "service-slug");
  if (limited) return limited;
  return handle(async () => {
    const doc = await getServiceBySlug(ctx.params.slug);
    if (!doc) return notFound("Service");
    return NextResponse.json(doc);
  });
}
