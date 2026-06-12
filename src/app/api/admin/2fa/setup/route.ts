import { NextResponse } from "next/server";
import { setupTwoFactor } from "@/server/services/admin.service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function POST() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const setup = await setupTwoFactor(gate.session.user.id);
    // Never return the otpauth URL in plain — but QR code embeds it; OK for admin
    return NextResponse.json(setup);
  });
}
