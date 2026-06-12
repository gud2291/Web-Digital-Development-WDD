import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/server/services/admin.service";
import { requestPasswordResetSchema } from "@/server/validation/auth";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { sendEmail } from "@/server/email/resend";
import { PasswordReset } from "@/server/email/templates/password-reset";
import { logger } from "@/server/utils/logger";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`pwd-reset:${ip}`);
    if (!rl.success) return rateLimited();

    const data = requestPasswordResetSchema.parse(await req.json());
    const result = await requestPasswordReset(data.email);

    // Send email only if admin found — never leak whether email exists
    if (result) {
      const resetUrl = `${siteConfig.url}/admin/reset-password/${result.rawToken}`;
      try {
        await sendEmail({
          to: result.admin.email,
          subject: "Reset your admin password — Web Digital Development",
          react: PasswordReset({ resetUrl, email: result.admin.email }),
        });
      } catch (err) {
        logger.error({ err }, "password-reset email failed");
      }
    }

    // Always return ok — never reveal whether the email exists
    return NextResponse.json({ ok: true });
  });
}
