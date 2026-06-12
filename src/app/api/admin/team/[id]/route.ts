import { NextResponse } from "next/server";
import {
  getTeamById,
  updateTeamMember,
  deleteTeamMember,
} from "@/server/services/team.service";
import { updateTeamSchema } from "@/server/validation/team";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getTeamById(ctx.params.id);
    if (!doc) return notFound("Team member");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateTeamSchema.parse(await req.json());
    const doc = await updateTeamMember(ctx.params.id, data);
    if (!doc) return notFound("Team member");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteTeamMember(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
