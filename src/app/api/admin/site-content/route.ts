import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  getSiteContent,
  updateSiteContent,
} from "@/server/services/siteContent.service";
import { updateSiteContentSchema } from "@/server/validation/siteContent";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getSiteContent();
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateSiteContentSchema.parse(await req.json());
    const doc = await updateSiteContent(data);
    // Bust the cached public site-content read so edits show on the live
    // home/about/contact pages immediately.
    revalidateTag("site-content");
    // Also revalidate the now-ISR pages that render site-content.
    revalidatePublic.siteContent();
    return NextResponse.json(doc);
  });
}
