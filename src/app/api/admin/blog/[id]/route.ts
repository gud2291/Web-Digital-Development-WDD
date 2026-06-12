import { NextResponse } from "next/server";
import { getBlogById, updateBlog, deleteBlog } from "@/server/services/blog.service";
import { updateBlogSchema } from "@/server/validation/blog";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getBlogById(ctx.params.id);
    if (!doc) return notFound("Blog post");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateBlogSchema.parse(await req.json());
    const doc = await updateBlog(ctx.params.id, data);
    if (!doc) return notFound("Blog post");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteBlog(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
