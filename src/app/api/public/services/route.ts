import { NextResponse } from "next/server";
import { listServices } from "@/server/services/service.service";
import { handle } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "services");
  if (limited) return limited;
  return handle(async () => {
    const items = await listServices();
    return NextResponse.json({ items });
  });
}
