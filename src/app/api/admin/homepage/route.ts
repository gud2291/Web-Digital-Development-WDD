import { NextResponse } from "next/server";
import { getHomepage, updateHomepage } from "@/server/services/homepage.service";
import { updateHomepageSchema } from "@/server/validation/homepage";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getHomepage();
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateHomepageSchema.parse(await req.json());
    const doc = await updateHomepage(data);
    return NextResponse.json(doc);
  });
}
