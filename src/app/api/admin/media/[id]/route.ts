import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteMedia, updateMedia } from "@/server/services/media.service";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ alt: z.string().max(300).optional() });

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = patchSchema.parse(await req.json());
    const doc = await updateMedia(ctx.params.id, data);
    if (!doc) return notFound("Media");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const result = await deleteMedia(ctx.params.id);
    if (!result.ok) return notFound("Media");
    return NextResponse.json({ ok: true });
  });
}
