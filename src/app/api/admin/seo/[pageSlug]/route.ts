import { NextResponse } from "next/server";
import { deleteSeoMeta, getSeoMeta } from "@/server/services/seoMeta.service";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { pageSlug: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getSeoMeta(ctx.params.pageSlug);
    if (!doc) return notFound("SEO entry");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { pageSlug: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteSeoMeta(ctx.params.pageSlug);
    // Refresh the targeted page so its metadata reverts immediately.
    revalidatePublic.seo(ctx.params.pageSlug);
    return NextResponse.json({ ok: true });
  });
}
