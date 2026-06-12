import { NextResponse } from "next/server";
import { getSiteContent } from "@/server/services/siteContent.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const doc = await getSiteContent();
    return NextResponse.json(doc);
  });
}
