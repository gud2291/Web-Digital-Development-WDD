import { NextResponse } from "next/server";
import { getLegalPageBySlug } from "@/server/services/legalPage.service";
import { handle, notFound } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  return handle(async () => {
    const doc = await getLegalPageBySlug(ctx.params.slug);
    if (!doc) return notFound("Legal page");
    return NextResponse.json(doc);
  });
}
