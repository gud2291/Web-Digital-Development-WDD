import { NextResponse } from "next/server";
import { listServices, createService } from "@/server/services/service.service";
import { createServiceSchema } from "@/server/validation/service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listServices({ includeHidden: true });
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createServiceSchema.parse(await req.json());
    const doc = await createService(data);
    return NextResponse.json(doc, { status: 201 });
  });
}
