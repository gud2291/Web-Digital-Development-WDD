import { NextResponse } from "next/server";
import { disableTwoFactor } from "@/server/services/admin.service";
import { verify2faSchema } from "@/server/validation/auth";
import { badRequest, handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = verify2faSchema.parse(await req.json());
    try {
      const result = await disableTwoFactor(gate.session.user.id, data.code);
      return NextResponse.json(result);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : "Could not disable 2FA");
    }
  });
}
