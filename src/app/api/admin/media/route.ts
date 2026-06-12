import { NextResponse } from "next/server";
import { listMedia } from "@/server/services/media.service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 40);
    const result = await listMedia({ page, limit });
    return NextResponse.json(result);
  });
}
