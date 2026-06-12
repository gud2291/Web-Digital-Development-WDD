import { NextResponse } from "next/server";
import { createContactSchema } from "@/server/validation/contact";
import { createContact } from "@/server/services/contact.service";
import { sendEmail } from "@/server/email/resend";
import { ContactFormAdmin } from "@/server/email/templates/contact-form-admin";
import { ContactFormAutoReply } from "@/server/email/templates/contact-form-autoreply";
import { siteConfig } from "@/config/site";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:contact:${ip}`);
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = createContactSchema.parse(body);
    const doc = await createContact({ ...data, ip });

    try {
      await Promise.all([
        sendEmail({
          to: siteConfig.email,
          subject: `New inquiry — ${data.name}`,
          react: ContactFormAdmin({ ...data }),
          replyTo: data.email,
        }),
        sendEmail({
          to: data.email,
          subject: `We received your message — ${siteConfig.name}`,
          react: ContactFormAutoReply({ name: data.name }),
        }),
      ]);
    } catch (err) {
      logger.error({ err }, "contact email dispatch failed");
      // The DB record is saved — surface success to the user even if email fails
    }

    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
