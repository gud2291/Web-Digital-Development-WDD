import { NextResponse } from "next/server";
import { listBlogs } from "@/server/services/blog.service";
import { blogQuerySchema } from "@/server/validation/blog";
import { handle } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "blog");
  if (limited) return limited;
  return handle(async () => {
    const url = new URL(req.url);
    const query = blogQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listBlogs({ ...query, includeDrafts: false });
    return NextResponse.json(result);
  });
}
