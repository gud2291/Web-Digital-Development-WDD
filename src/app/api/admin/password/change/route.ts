import { NextResponse } from "next/server";
import { changePassword, findAdminById } from "@/server/services/admin.service";
import { changePasswordSchema } from "@/server/validation/auth";
import { badRequest, handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { sendEmail } from "@/server/email/resend";
import { PasswordChanged } from "@/server/email/templates/password-changed";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = changePasswordSchema.parse(await req.json());
    try {
      await changePassword(gate.session.user.id, data.currentPassword, data.newPassword);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : "Could not change password");
    }

    try {
      const admin = await findAdminById(gate.session.user.id);
      if (admin) {
        await sendEmail({
          to: admin.email,
          subject: "Your admin password was changed",
          react: PasswordChanged({ email: admin.email }),
        });
      }
    } catch (err) {
      logger.error({ err }, "password-changed email failed");
    }

    return NextResponse.json({ ok: true });
  });
}
