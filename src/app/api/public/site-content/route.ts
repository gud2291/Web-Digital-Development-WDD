import { NextResponse } from "next/server";
import { getCachedSiteContent } from "@/server/services/siteContent.service";
import { handle } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "site-content");
  if (limited) return limited;
  return handle(async () => {
    const doc = await getCachedSiteContent();
    return NextResponse.json(doc);
  });
}
