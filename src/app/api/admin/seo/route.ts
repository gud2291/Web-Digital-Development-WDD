import { NextResponse } from "next/server";
import { listSeoMeta, upsertSeoMeta } from "@/server/services/seoMeta.service";
import { upsertSeoMetaSchema } from "@/server/validation/seoMeta";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listSeoMeta();
    return NextResponse.json({ items });
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = upsertSeoMetaSchema.parse(await req.json());
    const doc = await upsertSeoMeta(data);
    // Refresh the targeted page so its metadata updates immediately.
    revalidatePublic.seo(data.pageSlug);
    return NextResponse.json(doc);
  });
}
