import { NextResponse } from "next/server";
import { listTeam, createTeamMember } from "@/server/services/team.service";
import { createTeamSchema } from "@/server/validation/team";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listTeam({ includeHidden: true });
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createTeamSchema.parse(await req.json());
    const doc = await createTeamMember(data);
    revalidatePublic.team();
    return NextResponse.json(doc, { status: 201 });
  });
}
