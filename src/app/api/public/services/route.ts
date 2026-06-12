import { NextResponse } from "next/server";
import { listServices } from "@/server/services/service.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await listServices();
    return NextResponse.json({ items });
  });
}
