import { NextResponse } from "next/server";
import { getCachedSiteContent } from "@/server/services/siteContent.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const doc = await getCachedSiteContent();
    return NextResponse.json(doc);
  });
}
