import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { handle, badRequest } from "@/server/utils/apiError";
import { saveDraft, deleteDraft, isPreviewEnabled } from "@/server/preview/draft-store";
import { signPreviewToken } from "@/server/auth/preview-token";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "blog",
  "service",
  "project",
  "homepage",
  "site-content",
  "legal",
]);

export async function POST(req: Request, ctx: { params: { resource: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const resource = ctx.params.resource;
    if (!ALLOWED.has(resource)) return badRequest("Unknown preview resource");
    // Gracefully disable preview when Upstash isn't configured.
    if (!isPreviewEnabled()) return NextResponse.json({ enabled: false });

    const body = (await req.json().catch(() => ({}))) as { draftId?: string; state?: unknown };
    const adminId = gate.session.user.email ?? "admin";
    const draftId = body.draftId || nanoid(12);
    await saveDraft(adminId, resource, draftId, body.state ?? {});
    const token = signPreviewToken({ resource, draftId, adminId });
    return NextResponse.json({ enabled: true, draftId, token });
  });
}

export async function DELETE(req: Request, ctx: { params: { resource: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const resource = ctx.params.resource;
    const draftId = new URL(req.url).searchParams.get("draftId");
    const adminId = gate.session.user.email ?? "admin";
    if (draftId) await deleteDraft(adminId, resource, draftId);
    return NextResponse.json({ ok: true });
  });
}
