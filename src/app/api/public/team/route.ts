import { NextResponse } from "next/server";
import { listTeam } from "@/server/services/team.service";
import { handle } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "team");
  if (limited) return limited;
  return handle(async () => {
    const items = await listTeam();
    return NextResponse.json({ items });
  });
}
