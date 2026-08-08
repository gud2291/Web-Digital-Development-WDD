import { NextResponse } from "next/server";
import { getHomepage } from "@/server/services/homepage.service";
import { handle } from "@/server/utils/apiError";
import { publicReadGate } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "homepage");
  if (limited) return limited;
  return handle(async () => {
    const doc = await getHomepage();
    return NextResponse.json(doc);
  });
}
