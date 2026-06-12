import { NextResponse } from "next/server";
import {
  getContactById,
  updateContactStatus,
  deleteContact,
} from "@/server/services/contact.service";
import { updateContactStatusSchema } from "@/server/validation/contact";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getContactById(ctx.params.id);
    if (!doc) return notFound("Inquiry");
    return NextResponse.json(doc);
  });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateContactStatusSchema.parse(await req.json());
    const doc = await updateContactStatus(ctx.params.id, data);
    if (!doc) return notFound("Inquiry");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteContact(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
