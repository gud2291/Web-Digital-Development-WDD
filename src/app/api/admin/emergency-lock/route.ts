import { NextResponse } from "next/server";
import { z } from "zod";
import { toggleEmergencyLock } from "@/server/services/admin.service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ locked: z.boolean() });

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = bodySchema.parse(await req.json());
    await toggleEmergencyLock(gate.session.user.id, data.locked);
    return NextResponse.json({ ok: true, locked: data.locked });
  });
}
