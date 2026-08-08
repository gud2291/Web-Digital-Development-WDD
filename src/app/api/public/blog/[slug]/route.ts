import { NextResponse } from "next/server";
import { getBlogBySlug } from "@/server/services/blog.service";
import { handle, notFound } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const limited = await publicReadGate(req, "blog-slug");
  if (limited) return limited;
  return handle(async () => {
    const doc = await getBlogBySlug(ctx.params.slug);
    if (!doc) return notFound("Blog post");
    return NextResponse.json(doc);
  });
}
