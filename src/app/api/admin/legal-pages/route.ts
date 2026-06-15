import { NextResponse } from "next/server";
import {
  listLegalPages,
  upsertLegalPage,
} from "@/server/services/legalPage.service";
import { upsertLegalPageSchema } from "@/server/validation/legalPage";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listLegalPages();
    return NextResponse.json({ items });
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = upsertLegalPageSchema.parse(await req.json());
    const doc = await upsertLegalPage(data);
    revalidatePublic.legal();
    return NextResponse.json(doc);
  });
}
