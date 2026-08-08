import { NextResponse } from "next/server";
import { createContactSchema } from "@/server/validation/contact";
import { createContact, countRecentByEmailKey } from "@/server/services/contact.service";
import { sendEmail } from "@/server/email/resend";
import { ContactFormAdmin } from "@/server/email/templates/contact-form-admin";
import { ContactFormAutoReply } from "@/server/email/templates/contact-form-autoreply";
import { siteConfig } from "@/config/site";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { checkSpam, logBlocked, normalizeEmail } from "@/server/utils/spamGuard";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

/** A bot must never learn it was caught, or it just mutates and retries. */
const fakeSuccess = () =>
  NextResponse.json({ ok: true, id: null }, { status: 201 });

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    // A human sends one enquiry, not ten. Tight window + daily ceiling so a
    // single host can't grind out submissions all day.
    const burst = await checkRateLimit(`public:contact:${ip}`, { limit: 3, window: "10 m" });
    if (!burst.success) return rateLimited();
    const daily = await checkRateLimit(`public:contact:day:${ip}`, { limit: 8, window: "1 d" });
    if (!daily.success) return rateLimited();

    const body = await req.json();
    const data = createContactSchema.parse(body);

    const verdict = checkSpam({
      req,
      body,
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (verdict.blocked) {
      logBlocked("contact", verdict, { ip, name: data.name, email: data.email, message: data.message });
      return fakeSuccess();
    }

    // Same inbox hammering the form under rotating aliases.
    const emailKey = normalizeEmail(data.email);
    const priorToday = await countRecentByEmailKey(emailKey, 24 * 60 * 60 * 1000);
    if (priorToday >= 3) {
      logBlocked("contact", { ...verdict, reasons: [...verdict.reasons, "duplicate-sender"] }, {
        ip,
        emailKey,
        priorToday,
      });
      return fakeSuccess();
    }

    const doc = await createContact({
      ...data,
      ip,
      source: "contact-form",
      suspicious: verdict.suspicious,
      spamScore: verdict.score,
      spamReasons: verdict.reasons,
    });

    try {
      const mails = [
        sendEmail({
          to: siteConfig.email,
          subject: verdict.suspicious
            ? `[Possible spam] New inquiry — ${data.name}`
            : `New inquiry — ${data.name}`,
          react: ContactFormAdmin({ ...data }),
          replyTo: data.email,
        }),
      ];
      // Auto-replies only go to senders we trust. Bogus addresses bounce, and
      // bounces are exactly what gets our sending domain flagged as spam.
      if (!verdict.suspicious) {
        mails.push(
          sendEmail({
            to: data.email,
            subject: `We received your message — ${siteConfig.name}`,
            react: ContactFormAutoReply({ name: data.name }),
          })
        );
      }
      await Promise.all(mails);
    } catch (err) {
      logger.error({ err }, "contact email dispatch failed");
      // The DB record is saved — surface success to the user even if email fails
    }

    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
