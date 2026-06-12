import { NextResponse } from "next/server";
import { listTeam } from "@/server/services/team.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await listTeam();
    return NextResponse.json({ items });
  });
}
