import { NextResponse } from "next/server";
import { subscribeSchema } from "@/server/validation/newsletter";
import { subscribe } from "@/server/services/newsletter.service";
import { sendEmail } from "@/server/email/resend";
import { NewsletterWelcome } from "@/server/email/templates/newsletter-welcome";
import { siteConfig } from "@/config/site";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { checkSpam, logBlocked } from "@/server/utils/spamGuard";
import { MIN_NEWSLETTER_MS } from "@/config/antiSpam";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:newsletter:${ip}`, { limit: 3, window: "10 m" });
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = subscribeSchema.parse(body);

    // List-bombing a mailing list burns the sending domain's reputation, so the
    // guard runs before anything is stored or mailed.
    const verdict = checkSpam({ req, body, email: data.email, minElapsedMs: MIN_NEWSLETTER_MS });
    if (verdict.blocked) {
      logBlocked("newsletter", verdict, { ip, email: data.email });
      return NextResponse.json({ ok: true, already: false }, { status: 201 });
    }

    const { isNew } = await subscribe(data);

    // Borderline addresses are recorded but never mailed — bounces are what get
    // a sending domain blacklisted.
    if (isNew && !verdict.suspicious) {
      try {
        await sendEmail({
          to: data.email,
          subject: `You're subscribed — ${siteConfig.name}`,
          react: NewsletterWelcome({ email: data.email }),
        });
      } catch (err) {
        logger.error({ err }, "newsletter welcome email failed");
        // Subscription is saved — surface success even if email fails.
      }
    }

    return NextResponse.json({ ok: true, already: !isNew }, { status: 201 });
  });
}
