import { NextResponse } from "next/server";
import { findAdminById, rotateRecoveryCode } from "@/server/services/admin.service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { sendEmail } from "@/server/email/resend";
import { RecoveryCode } from "@/server/email/templates/recovery-code";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const { plain } = await rotateRecoveryCode(gate.session.user.id);

    try {
      const admin = await findAdminById(gate.session.user.id);
      if (admin) {
        await sendEmail({
          to: admin.email,
          subject: "Your new admin recovery code",
          react: RecoveryCode({ email: admin.email, recoveryCode: plain }),
        });
      }
    } catch (err) {
      logger.error({ err }, "recovery-code email failed");
    }

    // The plaintext is returned ONCE for display. The DB only stores the hash.
    return NextResponse.json({ ok: true, recoveryCode: plain });
  });
}
