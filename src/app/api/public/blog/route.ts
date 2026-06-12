import { NextResponse } from "next/server";
import { listBlogs } from "@/server/services/blog.service";
import { blogQuerySchema } from "@/server/validation/blog";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const query = blogQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listBlogs({ ...query, includeDrafts: false });
    return NextResponse.json(result);
  });
}
