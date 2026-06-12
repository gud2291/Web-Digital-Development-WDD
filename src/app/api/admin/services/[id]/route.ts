import { NextResponse } from "next/server";
import {
  getServiceById,
  updateService,
  deleteService,
} from "@/server/services/service.service";
import { updateServiceSchema } from "@/server/validation/service";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getServiceById(ctx.params.id);
    if (!doc) return notFound("Service");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateServiceSchema.parse(await req.json());
    const doc = await updateService(ctx.params.id, data);
    if (!doc) return notFound("Service");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteService(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
