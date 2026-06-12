import { NextResponse } from "next/server";
import { listProjects } from "@/server/services/project.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    const items = await listProjects({ category });
    return NextResponse.json({ items });
  });
}
