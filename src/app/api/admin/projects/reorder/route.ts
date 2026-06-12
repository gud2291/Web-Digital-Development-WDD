import { NextResponse } from "next/server";
import Project from "@/server/models/Project";
import { reorderBatch } from "@/server/services/reorder.helper";
import { reorderIdsSchema } from "@/server/validation/reorder";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const { ids } = reorderIdsSchema.parse(await req.json());
    await reorderBatch(Project, ids);
    return NextResponse.json({ ok: true, count: ids.length });
  });
}
