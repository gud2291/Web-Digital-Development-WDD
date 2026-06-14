import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSettings, updateSettings } from "@/server/services/settings.service";
import { updateSettingsSchema } from "@/server/validation/settings";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

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
    // Bust the cached public settings read so edits show on the live site
    // immediately (layout/footer/contact/chatbot-config all share this tag).
    revalidateTag("settings");
    // Also revalidate the now-ISR contact page that reads settings directly.
    revalidatePublic.settings();
    return NextResponse.json(doc);
  });
}
