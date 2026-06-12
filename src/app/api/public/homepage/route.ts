import { NextResponse } from "next/server";
import { getHomepage } from "@/server/services/homepage.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const doc = await getHomepage();
    return NextResponse.json(doc);
  });
}
