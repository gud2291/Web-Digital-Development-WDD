import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/server/services/service.service";
import { handle, notFound } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  return handle(async () => {
    const doc = await getServiceBySlug(ctx.params.slug);
    if (!doc) return notFound("Service");
    return NextResponse.json(doc);
  });
}
