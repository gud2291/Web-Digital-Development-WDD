import { NextResponse } from "next/server";
import {
  getSiteContent,
  updateSiteContent,
} from "@/server/services/siteContent.service";
import { updateSiteContentSchema } from "@/server/validation/siteContent";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

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
    return NextResponse.json(doc);
  });
}
