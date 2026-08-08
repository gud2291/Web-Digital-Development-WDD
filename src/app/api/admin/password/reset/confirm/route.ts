import { NextResponse } from "next/server";
import { confirmPasswordReset } from "@/server/services/admin.service";
import { confirmPasswordResetSchema } from "@/server/validation/auth";
import { badRequest, handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    // Token-guessing throttle. The token itself is nanoid(48) + bcrypt, so this
    // is belt-and-braces — but there is no reason to hand out 86k attempts a day.
    const rl = await checkRateLimit(`pwd-reset-confirm:${ip}`, { limit: 3, window: "15 m" });
    if (!rl.success) return rateLimited();

    const data = confirmPasswordResetSchema.parse(await req.json());
    try {
      const result = await confirmPasswordReset(data.token, data.newPassword);
      return NextResponse.json(result);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : "Reset failed");
    }
  });
}
