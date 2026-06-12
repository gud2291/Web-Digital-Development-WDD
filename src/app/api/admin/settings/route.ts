import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/server/services/settings.service";
import { updateSettingsSchema } from "@/server/validation/settings";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getSettings();
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateSettingsSchema.parse(await req.json());
    const doc = await updateSettings(data);
    return NextResponse.json(doc);
  });
}
