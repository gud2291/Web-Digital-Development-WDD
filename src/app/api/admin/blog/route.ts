import { NextResponse } from "next/server";
import { listBlogs, createBlog } from "@/server/services/blog.service";
import { blogQuerySchema, createBlogSchema } from "@/server/validation/blog";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const url = new URL(req.url);
    const query = blogQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listBlogs({ ...query, includeDrafts: true });
    return NextResponse.json(result);
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createBlogSchema.parse(await req.json());
    const doc = await createBlog(data);
    revalidatePublic.blog();
    return NextResponse.json(doc, { status: 201 });
  });
}
