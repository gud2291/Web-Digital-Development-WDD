import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/server/services/project.service";
import { updateProjectSchema } from "@/server/validation/project";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getProjectById(ctx.params.id);
    if (!doc) return notFound("Project");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateProjectSchema.parse(await req.json());
    const doc = await updateProject(ctx.params.id, data);
    if (!doc) return notFound("Project");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteProject(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
