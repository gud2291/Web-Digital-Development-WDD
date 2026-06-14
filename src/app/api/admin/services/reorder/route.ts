import { NextResponse } from "next/server";
import Service from "@/server/models/Service";
import { reorderBatch } from "@/server/services/reorder.helper";
import { reorderIdsSchema } from "@/server/validation/reorder";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const { ids } = reorderIdsSchema.parse(await req.json());
    await reorderBatch(Service, ids);
    revalidatePublic.services();
    return NextResponse.json({ ok: true, count: ids.length });
  });
}
