import { NextResponse } from "next/server";
import { getBlogBySlug } from "@/server/services/blog.service";
import { handle, notFound } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  return handle(async () => {
    const doc = await getBlogBySlug(ctx.params.slug);
    if (!doc) return notFound("Blog post");
    return NextResponse.json(doc);
  });
}
